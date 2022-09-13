import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, setPersistence, onAuthStateChanged, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

import { message } from 'antd';

const firebaseConfig = {
  apiKey: 'AIzaSyC9qm7Z20wvL3Fk6Unf-IihFZ4uolEiq_g',
  authDomain: 'todobox-firebase.firebaseapp.com',
  projectId: 'todobox-firebase',
  storageBucket: 'todobox-firebase.appspot.com',
  messagingSenderId: '976623005984',
  appId: '1:976623005984:web:39e1e20abc714904272745',
  measurementId: 'G-79PEF11J6E'
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signUpWithEmail = async (username, email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
    .then((res) => {
      let user = res.user;
      let userRef = doc(db, 'data', user.uid);

      setDoc(userRef, {
        username: username,
        tasks: [],
        sections: []
      })
    })
    .catch((err) => {
      switch (err.code) {
      case 'auth/email-already-in-use':
        message.error('The entered email is already in use.');
        break;

      default:
        console.error(err.code);
        message.error('An error has occured.');
      }
    });
}

const signInWithEmail = async (email, password, persist) => {
  return await setPersistence(auth, persist ? browserLocalPersistence : inMemoryPersistence)
    .then(() => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => userCredential.user)
        .catch((err) => {
          switch (err.code) {
          case 'auth/user-not-found':
            message.error('The entered email is not valid.');
            break;

          case 'auth/wrong-password':
            message.error('The entered email or password is not valid.');
            break;

          case 'auth/too-many-requests':
            message.error('Too many attempts have been made. Please try again in a bit.');
            break;

          default:
            console.error(err.code);
            message.error('An error has occured.');
          }
        });
    });
}

const sendPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email)
    .then(() => {
      message.info('The recovery email has been sent.');
    })
    .catch((err) => {
      console.error(err);
    });
}

const signOutOfAccount = () => {
  signOut(auth);
}

const setupAuthListener = (callback) => {
  onAuthStateChanged(auth, callback,
    (err) => {
      console.error(err);
      callback(null);
    }
  );
}

const getIdToken = (callback) => {
  if (auth.currentUser) {
    auth.currentUser.getIdToken(true)
      .then(callback)
      .catch((err) => {
        console.error(err);
      });
  } else {
    callback(null);
  }
}

export {
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  signOutOfAccount,
  setupAuthListener,
  getIdToken
}
