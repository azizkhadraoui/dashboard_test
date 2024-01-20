const admin = require('firebase-admin');
const serviceAccount = require('./medtour-test-firebase-adminsdk-ryg9e-054686dc68.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const listUsers = async () => {
  try {
    const users = await admin.auth().listUsers();
    return users.users.map(user => user.email);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

module.exports = listUsers;
