import initializeFirebase from "./initializeFirebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Initialize Firebase
let app = initializeFirebase();
const auth = getAuth(app);

// Google Auth Provider
var provider = new GoogleAuthProvider();

function signWithGoogle() {
    signInWithPopup(auth, provider)
    .then((result) => {
            console.log('User signed in:', result.user);
          })
          .catch((error) => {
            console.error('Error during sign in:', error);
          });

}
export default signWithGoogle;