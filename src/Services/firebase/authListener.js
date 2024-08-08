import { getAuth, onAuthStateChanged } from "firebase/auth";
import initializeFirebase from "./initializeFirebase";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseApp = initializeFirebase();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const authListener = setUser => {
  return onAuthStateChanged(auth, user => {
    if (user) {
      checkUserDocument(user, db);
      console.log(user.email);
      setUser(user);
    } else {
      console.log("no user found");
      setUser(null);
    }
  });
};

async function checkUserDocument(user, db) {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    console.log("User document exists:", userDoc.data());
  } else {
    let userName;
    do {
      userName = prompt("Please enter your name:");
    } while (userName === null || userName === "");
    await setDoc(userDocRef, {
      name: userName,
      email: user.email,
      uid: user.uid
    });
    console.log("User document created with name:", userName);
  }
}
export default authListener;
