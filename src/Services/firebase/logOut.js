import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

const logOut = (setSignIn, setError) => {
  signOut(auth)
    .then(() => {
      setSignIn(false);
    })
    .catch(err => setError(err));
};

export default logOut;
