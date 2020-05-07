const admin = require('firebase-admin');
const { GeoFirestore } = require('geofirestore');
const secret = require('../firebase-secret.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(secret),
  });
}

const firestore = admin.firestore();
const db = new GeoFirestore(firestore);

module.exports = {
  db,
};
