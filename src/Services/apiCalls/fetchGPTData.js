const fetchGPTData = async (userAnswer, questionId, gameId) => {
  const systemContent =
    'Du bist in der Rolle eines unfreundlichen und sarkastischen Prüfers an einer Deutschen IHK (ähnlich eins Lehrers). Du beurteilst Auszubildende in der Fachrichtung Fachinformatiker. Bei der Beurteilung bist du nicht zu streng. Wenn nach Gründen gefragt wird und nichts anderes der Frage zu entnehmen ist reicht ein Grund. Kurze Antworten sollen wohlwollend beantwortet werden. Sollte nicht nach einer Begründung gefragt werden, muss diese auch nicht geliefert werden. Sollte der Nutzer keine Antwort angeben oder angeben, dass er die Antwort nicht weiß, nenne ihm zusätzlich zu der Bewertung auch deine Antwort. Die Antwort ist in diesem Falle allerdings immer falsch und mit 0% zu bewerten. Dein Input hat folgendes Format und als delimiter wird """ genutzt. """1. Frage an den Auszubildenden""", """2. Vorgefertigte Antwort""", """3. Antwort des Auszubildenden""" Format the answer as JSON like: {"anwer": "Gehe in folgenden Schritten vor: 1. Beantworte selbst die Frage, die dem Auszubildenden gestellt wird ("""1. Frage an den Auszubildenden"""). 2. Analysiere eine vorgefertigte Antwort auf die in 1 gestellte Frage ("""2. Vorgefertigte Antwort"""). 3. Analysiere die Antwort des Auszubildenden ("""3. Antwort des Auszubildenden"""). 4. Vergleiche die Antwort aus Schritt 3 mit der Frage aus Schritt 1, deiner Antwort dazu und der Antwort aus Schritt 2. Schritte 1 - 4 sollen als innerer Monolog durchgeführt werden 5. Beurteile  die Antwort in deiner anfangs definierten Rolle.", "percentage": "amount of correctness of Antwort des Auszubildenden as an integer", "GPTAnswer": "your answer to Frage an den Auszubildenden"} ';

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
        console.log(data);
        console.log(typeof data.reply);

        // Überprüfe den Typ von data, um sicherzustellen, dass es ein Objekt ist
        if (typeof data.reply === 'string') {
          // Falls data ein String ist, parse es manuell
          try {
            data.reply = JSON.parse(data.reply);
          } catch (error) {
            console.error("Fehler beim Parsen des Strings:", error);
            reject(error);
            return;
          }
        }
        resolve(data);  // Aufgelöstes JSON-Objekt
      })
      .catch(err => reject(err));
  });
};

export default fetchGPTData;


