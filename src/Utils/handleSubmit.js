import createUserWithEmail from "../Services/firebase/createUserWithEmail";

const trySubmit = (e, setError, mail, password, repeatPassword) => {
  let type = e.type === "submit";
  let keyCode = e.keyCode === 13;
  let key = e.key === "Enter";

  const conditions = type || keyCode || key;
  if (conditions) {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Die Passwörter stimmen nicht überein!");
    } else {
      createUserWithEmail(setError, mail, password);
      return true;
    }
      
  }
};

export default trySubmit;
