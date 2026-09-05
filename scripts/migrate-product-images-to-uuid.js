#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
  gcloud auth application-default login
  firebase use <project-id>
  npm run migrate:product-images
  npm run migrate:product-images -- --write

Options:
  --write                Copy Storage objects, update Firestore, then delete unreferenced old source objects.
  --keep-old             With --write, keep old source objects after successful migration.
  --credentials=PATH     ADC/service account JSON path. Alternative to GOOGLE_APPLICATION_CREDENTIALS.
  --project-id=ID        Firebase project ID. Defaults to .env or .firebaserc.
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

function stringField(document, fieldName) {
  const value = document.get(fieldName);

  return typeof value === 'string' ? value : '';
}

async function getObject(storageBucket, objectName) {
  const file = storageBucket.file(objectName);
  const [exists] = await file.exists();

  if (!exists) {
    return null;
  }

  const [metadata] = await file.getMetadata();

  return metadata;
}

async function copyObject(storageBucket, sourceName, targetName) {
  await storageBucket.file(sourceName).copy(storageBucket.file(targetName));
}

async function deleteObject(storageBucket, objectName) {
  await storageBucket.file(objectName).delete();
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

function formatAuthError(error) {
  const message = error?.message || String(error);

  if (
    message.includes('Could not load the default credentials') ||
    message.includes('Your default credentials were not found')
  ) {
    return [
      'Firebase Admin credentials were not found.',
      'Run `gcloud auth application-default login`, or pass `--credentials=/path/to/service-account.json`.',
      '`firebase login` authenticates Firebase CLI commands, but it does not create Application Default Credentials for this Node script.'
    ].join('\n');
  }

  return message;
}

async function main() {
  await loadDotenv();

  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  if (args.credentials) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(args.credentials);
  }

  const projectId = args['project-id'] ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    await getDefaultFirebaseProjectId();
  const bucket = args.bucket || process.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (!projectId) {
    throw new Error('Project ID is required. Run firebase use <project-id>, set VITE_FIREBASE_PROJECT_ID, or pass --project-id=...');
  }

  if (!bucket) {
    throw new Error('Storage bucket is required. Set VITE_FIREBASE_STORAGE_BUCKET or pass --bucket=...');
  }

  const app = initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket: bucket
  });

  await app.options.credential.getAccessToken();

  const db = getFirestore(app);
  const storageBucket = getStorage(app).bucket(bucket);
  const productsSnapshot = await db.collection('products').get();
  const products = productsSnapshot.docs;
  const productsWithImages = products
    .map((product) => {
      const id = product.id;
      const name = stringField(product, 'name');
      const sourcePath = normalizeStoragePath(stringField(product, 'image'), bucket);
      const targetPath = getTargetPath(id, name, sourcePath);

      return {
        id,
        name,
        ref: product.ref,
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

    const sourceObject = await getObject(storageBucket, product.sourcePath);

    if (!sourceObject) {
      results.push({
        ...product,
        status: 'skipped-source-missing'
      });
      console.log(`SKIP missing source: ${product.id} ${product.sourcePath}`);
      continue;
    }

    const existingTargetObject = await getObject(storageBucket, product.targetPath);

    if (existingTargetObject && !sameObjectContent(sourceObject, existingTargetObject)) {
      results.push({
        ...product,
        status: 'skipped-target-different'
      });
      console.log(`SKIP target exists with different content: ${product.id} ${product.targetPath}`);
      continue;
    }

    if (!existingTargetObject) {
      await copyObject(storageBucket, product.sourcePath, product.targetPath);
    }

    const targetObject = await getObject(storageBucket, product.targetPath);

    if (!sameObjectContent(sourceObject, targetObject)) {
      results.push({
        ...product,
        status: 'failed-copy-verify'
      });
      console.log(`FAIL verify copy: ${product.id} ${product.sourcePath} -> ${product.targetPath}`);
      continue;
    }

    const latestProduct = await product.ref.get();
    const latestImageValue = stringField(latestProduct, 'image');

    if (latestImageValue !== product.originalImageValue) {
      results.push({
        ...product,
        status: 'skipped-firestore-changed'
      });
      console.log(`SKIP Firestore changed during migration: ${product.id}`);
      continue;
    }

    await product.ref.update({ image: product.targetPath });
    results.push({
      ...product,
      status: 'migrated'
    });
    console.log(`MIGRATED ${product.sourcePath} -> ${product.targetPath} (${product.name || product.id})`);
  }

  if (args.write && !args.keepOld) {
    const currentProductsSnapshot = await db.collection('products').get();
    const currentProducts = currentProductsSnapshot.docs;
    const currentImagePaths = new Set(
      currentProducts
        .map((product) => normalizeStoragePath(stringField(product, 'image'), bucket))
        .filter(Boolean)
    );

    for (const [sourcePath, group] of sourceGroups.entries()) {
      if (targetPaths.has(sourcePath)) {
        console.log(`KEEP source is a target path: ${sourcePath}`);
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

      await deleteObject(storageBucket, sourcePath);
      console.log(`DELETED old source: ${sourcePath}`);
    }
  }

  console.log('Summary:', JSON.stringify(statusSummary(results), null, 2));

  if (!args.write) {
    console.log('Dry run only. Re-run with --write to copy objects, update Firestore, and delete old sources.');
  }
}

main().catch((error) => {
  console.error(formatAuthError(error));
  process.exitCode = 1;
});
