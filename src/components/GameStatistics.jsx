import React, {useState, useEffect} from 'react'
import getGameStatistics from '../Services/firebase/getGameStatistics'
import getRanking from '../Services/firebase/getRanking';

const GameStatistics = ({showStatistics, db, gameId }) => {
    const [gameData, setGameData] = useState(null);
    const [avrgPrctg, setAvrgPrctg] = useState(null);
    const [bestAnswer, setBestAnswer] = useState(null);
    const [answersAbove50, setAnswersAbove50] = useState(null);
    const [answersAbove80, setAnswersAbove80] = useState(null);
    const [answersWith100, setAnswersWith100] = useState(null);
    const [ranking, setRanking] = useState("???");

    // move logic to backend

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
        return `${result} %` // Rückgabe 0, wenn count 0 ist, um Division durch Null zu vermeiden
    };

    const getBestAnswer = (data) => {
        let bestAnswerPrctg = 0;
        let bestAnswer = {};
        for (const key in data) {
            if (data[key].gptPercentage >= bestAnswerPrctg) {
                bestAnswerPrctg = data[key].gptPercentage;
                bestAnswer = data[key];
            }
        }
        console.log(bestAnswer);
        return bestAnswer;
    };

    const countAnswersAbove = (percentage, data) => {
        let count = 0;
        for (const key in data) {
            if (data[key].gptPercentage >= percentage) {
                count++;
            }
        }
        return count;
    }

    

    useEffect(() => {
        getGameStatistics(db, gameId)
        .then((data) => {
            setGameData(data);
            setAvrgPrctg(calculateAverage(data));
            setBestAnswer(getBestAnswer(data));
            setAnswersAbove50(countAnswersAbove(50, data));
            setAnswersAbove80(countAnswersAbove(80, data));
            setAnswersWith100(countAnswersAbove(100, data));
            getRanking(db, gameId).then((ranking) => {
                setRanking(ranking);
            });
        });
        
    }, [gameId, db]);
  return (
    <div className='authPopup'>
        <div className='gameStatistics'>
            <button onClick={() => showStatistics(false)}>Close</button>
            <h2>Game Statistics</h2>
            <div>
                <h3>Average Percentage:</h3>
                <div>{avrgPrctg ? avrgPrctg : "??"}</div>
            </div>
            <div>
                <h3>Best Answer</h3>
                <div>{bestAnswer && bestAnswer.gptPercentage !== undefined && bestAnswer.gptPercentage !== null ? bestAnswer.gptPercentage : "??"} %</div>

                <h3>Question:</h3>
                <div>{bestAnswer && bestAnswer.question}</div>
                <h3>Answer:</h3>
                <div>{bestAnswer && bestAnswer.userAnswer}</div>
            </div>
            <div>
                <h3>Answers above 50%</h3>
                <div>{answersAbove50}</div>
            </div>
            <div>
                <h3>Answers above 80%</h3>
                <div>{answersAbove80}</div>
            </div>
            <div>
                <h3>Answers with 100%</h3>
                <div>{answersWith100}</div>
            </div>
            <div>
                <h3>Ranking of this Game</h3>
                <div>{ranking}</div>
            </div>
        </div>
    </div>
  )
}

export default GameStatistics