#!/usr/bin/env node
import { createSign } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FIRESTORE_API = 'https://firestore.googleapis.com/v1';
const STORAGE_API = 'https://storage.googleapis.com/storage/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

function parseArgs(argv) {
  return argv.reduce((args, arg) => {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      return args;
    }

    if (arg === '--write') {
      args.write = true;
      return args;
    }

    if (arg === '--keep-old') {
      args.keepOld = true;
      return args;
    }

    const match = arg.match(/^--([^=]+)=(.*)$/);

    if (match) {
      args[match[1]] = match[2];
    }

    return args;
  }, {
    help: false,
    write: false,
    keepOld: false
  });
}

function printUsage() {
  console.log(`
Usage:
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run migrate:product-images
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run migrate:product-images -- --write

Options:
  --write                Copy Storage objects, update Firestore, then delete unreferenced old source objects.
  --keep-old             With --write, keep old source objects after successful migration.
  --credentials=PATH     Service account JSON path. Alternative to GOOGLE_APPLICATION_CREDENTIALS.
  --project-id=ID        Firebase project ID. Defaults to .env, service account, or .firebaserc.
  --bucket=NAME          Firebase Storage bucket. Defaults to VITE_FIREBASE_STORAGE_BUCKET in .env.
`);
}

function decodeEnvValue(value) {
  const trimmedValue = value.trim();
  const quote = trimmedValue[0];

  if ((quote === '"' || quote === "'") && trimmedValue.endsWith(quote)) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

async function loadDotenv() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return;
  }

  const lines = (await readFile(envPath, 'utf8')).split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = decodeEnvValue(trimmedLine.slice(separatorIndex + 1));

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(path.resolve(filePath), 'utf8'));
}

async function getDefaultFirebaseProjectId() {
  const rcPath = path.resolve(process.cwd(), '.firebaserc');

  if (!existsSync(rcPath)) {
    return '';
  }

  const firebaseRc = await readJsonFile(rcPath);

  return firebaseRc?.projects?.default || '';
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT'
  }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');

  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64Url(signer.sign(serviceAccount.private_key))}`;
}

async function getAccessToken(serviceAccount) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signJwt(serviceAccount)
    })
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function requestJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 404) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${response.status} ${text}`);
  }

  return data;
}

function documentId(documentName) {
  return documentName.split('/').pop();
}

function stringField(document, fieldName) {
  return document?.fields?.[fieldName]?.stringValue || '';
}

async function listProducts(projectId, token) {
  const products = [];
  let pageToken = '';

  do {
    const url = new URL(`${FIRESTORE_API}/projects/${projectId}/databases/(default)/documents/products`);

    url.searchParams.set('pageSize', '500');

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const page = await requestJson(url, token);

    products.push(...(page?.documents || []));
    pageToken = page?.nextPageToken || '';
  } while (pageToken);

  return products;
}

async function getProduct(documentName, token) {
  return requestJson(`${FIRESTORE_API}/${documentName}`, token);
}

async function updateProductImage(documentName, imagePath, token) {
  const url = new URL(`${FIRESTORE_API}/${documentName}`);

  url.searchParams.set('updateMask.fieldPaths', 'image');

  return requestJson(url, token, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: {
        image: {
          stringValue: imagePath
        }
      }
    })
  });
}

function encodeObjectName(objectName) {
  return encodeURIComponent(objectName);
}

async function getObject(bucket, objectName, token) {
  return requestJson(`${STORAGE_API}/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(objectName)}`, token);
}

async function copyObject(bucket, sourceName, targetName, token) {
  return requestJson(
    `${STORAGE_API}/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(sourceName)}/copyTo/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(targetName)}`,
    token,
    {
      method: 'POST'
    }
  );
}

async function deleteObject(bucket, objectName, token) {
  return requestJson(`${STORAGE_API}/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(objectName)}`, token, {
    method: 'DELETE'
  });
}

function normalizeStoragePath(value, bucket) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (trimmedValue.startsWith('gs://')) {
    return trimmedValue.replace(new RegExp(`^gs://${bucket}/?`), '');
  }

  try {
    const url = new URL(trimmedValue);
    const firebasePathPrefix = `/v0/b/${bucket}/o/`;

    if (url.hostname === 'firebasestorage.googleapis.com' && url.pathname.startsWith(firebasePathPrefix)) {
      return decodeURIComponent(url.pathname.slice(firebasePathPrefix.length));
    }
  } catch {}

  return trimmedValue.replace(/^\/+/, '');
}

function getExtension(storagePath) {
  const fileName = storagePath.split('/').pop() || '';
  const match = fileName.match(/\.([A-Za-z0-9]+)$/);

  return match ? match[1] : '';
}

function createSafeImageName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTargetPath(productId, productName, sourcePath) {
  const extension = getExtension(sourcePath);
  const safeProductName = createSafeImageName(productName);

  if (!extension) {
    return '';
  }

  return safeProductName
    ? `products/${productId}-${safeProductName}.${extension}`
    : `products/${productId}.${extension}`;
}

function sameObjectContent(firstObject, secondObject) {
  if (!firstObject || !secondObject) {
    return false;
  }

  if (firstObject.size !== secondObject.size) {
    return false;
  }

  if (firstObject.md5Hash && secondObject.md5Hash) {
    return firstObject.md5Hash === secondObject.md5Hash;
  }

  if (firstObject.crc32c && secondObject.crc32c) {
    return firstObject.crc32c === secondObject.crc32c;
  }

  return false;
}

function statusSummary(results) {
  return results.reduce((summary, result) => {
    summary[result.status] = (summary[result.status] || 0) + 1;
    return summary;
  }, {});
}

async function main() {
  await loadDotenv();

  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const credentialsPath = args.credentials || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json or pass --credentials=/path/to/service-account.json.');
  }

  const serviceAccount = await readJsonFile(credentialsPath);
  const projectId = args['project-id'] ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    serviceAccount.project_id ||
    await getDefaultFirebaseProjectId();
  const bucket = args.bucket || process.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (!projectId) {
    throw new Error('Project ID is required. Set VITE_FIREBASE_PROJECT_ID or pass --project-id=...');
  }

  if (!bucket) {
    throw new Error('Storage bucket is required. Set VITE_FIREBASE_STORAGE_BUCKET or pass --bucket=...');
  }

  const token = await getAccessToken(serviceAccount);
  const products = await listProducts(projectId, token);
  const productsWithImages = products
    .map((product) => {
      const id = documentId(product.name);
      const name = stringField(product, 'name');
      const sourcePath = normalizeStoragePath(stringField(product, 'image'), bucket);
      const targetPath = getTargetPath(id, name, sourcePath);

      return {
        id,
        name,
        documentName: product.name,
        originalImageValue: stringField(product, 'image'),
        sourcePath,
        targetPath
      };
    })
    .filter((product) => product.sourcePath);
  const targetPaths = new Set(productsWithImages.map((product) => product.targetPath).filter(Boolean));
  const sourceGroups = new Map();
  const results = [];

  productsWithImages.forEach((product) => {
    const group = sourceGroups.get(product.sourcePath) || [];

    group.push(product);
    sourceGroups.set(product.sourcePath, group);
  });

  console.log(`${args.write ? 'WRITE' : 'DRY RUN'}: ${productsWithImages.length} product image reference(s) found in ${projectId}/${bucket}.`);

  for (const product of productsWithImages) {
    if (!product.targetPath) {
      results.push({
        ...product,
        status: 'skipped-no-extension'
      });
      console.log(`SKIP no extension: ${product.id} ${product.sourcePath}`);
      continue;
    }

    if (product.sourcePath === product.targetPath) {
      results.push({
        ...product,
        status: 'already-target-path'
      });
      console.log(`OK already target path: ${product.id} ${product.sourcePath}`);
      continue;
    }

    if (!args.write) {
      results.push({
        ...product,
        status: 'would-migrate'
      });
      console.log(`WOULD ${product.sourcePath} -> ${product.targetPath} (${product.name || product.id})`);
      continue;
    }

    const sourceObject = await getObject(bucket, product.sourcePath, token);

    if (!sourceObject) {
      results.push({
        ...product,
        status: 'skipped-source-missing'
      });
      console.log(`SKIP missing source: ${product.id} ${product.sourcePath}`);
      continue;
    }

    const existingTargetObject = await getObject(bucket, product.targetPath, token);

    if (existingTargetObject && !sameObjectContent(sourceObject, existingTargetObject)) {
      results.push({
        ...product,
        status: 'skipped-target-different'
      });
      console.log(`SKIP target exists with different content: ${product.id} ${product.targetPath}`);
      continue;
    }

    if (!existingTargetObject) {
      await copyObject(bucket, product.sourcePath, product.targetPath, token);
    }

    const targetObject = await getObject(bucket, product.targetPath, token);

    if (!sameObjectContent(sourceObject, targetObject)) {
      results.push({
        ...product,
        status: 'failed-copy-verify'
      });
      console.log(`FAIL verify copy: ${product.id} ${product.sourcePath} -> ${product.targetPath}`);
      continue;
    }

    const latestProduct = await getProduct(product.documentName, token);
    const latestImageValue = stringField(latestProduct, 'image');

    if (latestImageValue !== product.originalImageValue) {
      results.push({
        ...product,
        status: 'skipped-firestore-changed'
      });
      console.log(`SKIP Firestore changed during migration: ${product.id}`);
      continue;
    }

    await updateProductImage(product.documentName, product.targetPath, token);
    results.push({
      ...product,
      status: 'migrated'
    });
    console.log(`MIGRATED ${product.sourcePath} -> ${product.targetPath} (${product.name || product.id})`);
  }

  if (args.write && !args.keepOld) {
    const currentProducts = await listProducts(projectId, token);
    const currentImagePaths = new Set(
      currentProducts
        .map((product) => normalizeStoragePath(stringField(product, 'image'), bucket))
        .filter(Boolean)
    );

    for (const [sourcePath, group] of sourceGroups.entries()) {
      if (targetPaths.has(sourcePath)) {
        console.log(`KEEP source is a UUID target: ${sourcePath}`);
        continue;
      }

      if (currentImagePaths.has(sourcePath)) {
        console.log(`KEEP still referenced: ${sourcePath}`);
        continue;
      }

      const groupResults = results.filter((result) => result.sourcePath === sourcePath);
      const allReferencesMoved = group.length === groupResults.length &&
        groupResults.every((result) => result.status === 'migrated');

      if (!allReferencesMoved) {
        console.log(`KEEP not all references migrated: ${sourcePath}`);
        continue;
      }

      await deleteObject(bucket, sourcePath, token);
      console.log(`DELETED old source: ${sourcePath}`);
    }
  }

  console.log('Summary:', JSON.stringify(statusSummary(results), null, 2));

  if (!args.write) {
    console.log('Dry run only. Re-run with --write to copy objects, update Firestore, and delete old sources.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
