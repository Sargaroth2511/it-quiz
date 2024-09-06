const fetchGPTEvaluation = async (userAnswer, questionId, gameId) => {

  const backendUrl = "/api/chatGPT";
  const requestData = {
    userAnswer: userAnswer,
    questionId: questionId,
    gameId: gameId,
  };

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
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (typeof data.reply === 'string') {
          try {
            data.reply = JSON.parse(data.reply);
          } catch (error) {
            console.error("Fehler beim Parsen des Strings:", error);
            reject(error);
            return;
          }
        }
        resolve(data);  
      })
      .catch(err => reject(err));
  });
};

export default fetchGPTEvaluation;


