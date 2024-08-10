import { getDocs, collection } from 'firebase/firestore';


const getRanking = async(db, gameId) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'games'));
        let games = [];
        let position = null;

        querySnapshot.forEach((doc) => {
            const gameData = doc.data();

            // Berechnen des Durchschnitts der gptPercentage für jedes Spiel
            // Work on Ranking
            const totalPercentage = gameData.questions.reduce((acc, question) => {
                return question.gptPercentage !== null ? acc + question.gptPercentage : acc;
            }, 0);

            const validQuestionsCount = gameData.questions.filter(question => question.gptPercentage !== null).length;
            const averagePercentage = validQuestionsCount > 0 ? totalPercentage / validQuestionsCount : 0;

            games.push({
                id: doc.id,
                playerName: gameData.createdBy, // oder ein anderer Spielername
                averagePercentage,
            });
        });

        // Sortieren der Spiele basierend auf averagePercentage
        games.sort((a, b) => b.averagePercentage - a.averagePercentage);

        // Finden der Position des aktuellen Spiels
        games.forEach((game, index) => {
            if (game.id === gameId) {
                position = index + 1; // 1-basierte Position
            }
        });

        return position;
    } catch (error) {
        console.error("Error fetching ranking: ", error);
    }
}

export default getRanking