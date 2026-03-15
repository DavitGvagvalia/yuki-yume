import * as path from 'path';
import { fileURLToPath } from 'url';
import { cert,initializeApp} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = path.join(__dirname, './yuki-yume-site-firebase-adminsdk-fbsvc-ce034bab95.json');

  initializeApp({
    credential: cert(serviceAccount)
  });

// Export Firestore instancec
const db = getFirestore('(default)');
//export storage instance


export { db };