import admin from './firebaseAdmin';

export async function setUserRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
}