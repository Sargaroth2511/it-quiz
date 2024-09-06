
const createNewGame = async userId => {

    return new Promise((resolve, reject) => {

    fetch("/createNewGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "userId": userId }),
    })
      .then(res => {
        if (!res.ok) {
          reject(`Request failed with status ${res.status}`);
        }
        resolve(res.json());
      })
    })
}

export default createNewGame