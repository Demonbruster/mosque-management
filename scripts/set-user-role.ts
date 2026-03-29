import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin credentials in environment variables.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

async function main() {
  const [uid, role, tenantId] = process.argv.slice(2);

  if (!uid || !role) {
    console.error('Usage: bun run scripts/set-user-role.ts <uid> <role> [tenant_id]');
    process.exit(1);
  }

  try {
    const claims = {
      role,
      ...(tenantId ? { tenant_id: tenantId } : {}),
    };

    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Successfully set custom claims for user ${uid}:`, claims);
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  }
}

main();
