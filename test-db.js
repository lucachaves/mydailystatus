const admin = require('firebase-admin');
const { GeoFirestore } = require('geofirestore');
const secret = require('./firebase-secret.json');

admin.initializeApp({
  credential: admin.credential.cert(secret),
});

const db = admin.firestore();
const dbgeo = new GeoFirestore(db);

dbgeo
  .collection('markers')
  .add({
    test: 1,
    coordinates: new admin.firestore.GeoPoint(-7.1349305, -34.9155661),
  })
  .then(() => {
    console.log('ok');
  });
