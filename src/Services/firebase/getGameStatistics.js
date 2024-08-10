import { doc, getDoc } from 'firebase/firestore';


const getGameStatistics = async (db, docID) => {
    try {
        const docRef = doc(db, "games", docID);
        const gameDoc = await getDoc(docRef);
        if(gameDoc.exists()){
        const gameData =  gameDoc.data();
        gameData.avrgPrctg = calculateAverage(gameData);
        return gameData;
        } else {
        console.log("No such document!");
        }
    } catch (e) {
        console.error("Error getting document:", e);
    }    
}

const calculateAverage = (data) => {
    let total = 0;
    let count = 0;
    for (const key in data) {
        if (data[key].gptPercentage || data[key].gptPercentage === 0) {
            total += data[key].gptPercentage;
            count++;
        }
    }
    let result = count > 0 ? total / count : 0;
    return result
};

export default getGameStatistics