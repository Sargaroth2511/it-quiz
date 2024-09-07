const fetchGPTEvaluation = async (userAnswer, questionId, gameId) => {
  const backendUrl = "/api/chatGPT";
  const requestData = {
    userAnswer: userAnswer,
    questionId: questionId,
    gameId: gameId,
  };

  let maxtries = 3;
// _____TEST_____!!!!!!!
  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then(res => {
          if (!res.ok) {
            maxtries--;
            if (maxtries > 0) {
              console.log("Retrying fetchGPTEvaluation");
              return makeRequest();  // Rekursiver Aufruf, wenn es noch Versuche gibt
            } else {
              throw new Error(`Request failed with status ${res.status}`);
            }
          }
          return res.json();  // Wandle die Antwort in JSON um
        })
        .then(data => {
          if (typeof data.reply === "string") {
            try {
              data.reply = JSON.parse(data.reply);  // Versuche den String zu parsen
            } catch (error) {
              console.error("Fehler beim Parsen des Strings:", error);
              reject(error);  // Fehlerbehandlung
              return;
            }
          }
          resolve(data);  // Erfolgreiche Auflösung des Promises
        })
        .catch(err => reject(err));  // Fehlerbehandlung
    });
  };

  return makeRequest();
};


export default fetchGPTEvaluation;


