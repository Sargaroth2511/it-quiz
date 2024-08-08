const preventSubmitDefault = e => {
  let type = e.type === "submit";
  let keyCode = e.keyCode === 13;
  let key = e.key === "Enter";
  console.log(e);

  const conditions = type || keyCode || key;
  if (conditions) {
    e.preventDefault();
    return true;
  }
};

export default preventSubmitDefault;
