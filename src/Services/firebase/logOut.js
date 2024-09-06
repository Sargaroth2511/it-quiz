import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

const logOut = (setError) => {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
    })
    .catch(err => setError(err));
};

export default logOut;
