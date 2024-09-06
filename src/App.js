import React, { useEffect, useState } from "react";
import "./App.css";
import fetchGPTEvaluation from "./Services/apiCalls/fetchGPTEvaluation";
import authListener from "./Services/firebase/authListener";
import logOut from "./Services/firebase/logOut";
import SignInWithGooglePopup from "./components/signInWithGooglePopup";
import GameStatistics from "./components/GameStatistics";
import GameRanking from "./components/GameRanking";
import createNewGame from "./Services/apiCalls/createNewGame";
import LoadingAnimation from "./components/LoadingAnimation";

function App() {
  const [gptData, setGptData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizdata] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSignInWithGooglePopup, setShowSignInWithGooglePopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameID, setGameID] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showGameStatistics, setShowGameStatistics] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = authListener(setCurrentUser);
    return () => {
      unsubscribe();
    };
  }, []);


  const submitForm = e => {
    if(e.type === "submit" || e.key === "Enter") {
      checkUserAnswer();
      e.preventDefault();
    }
  };

  const checkUserAnswer = () => {
    // Move to Backend
    if(!currentUser) return alert("Du musst eingeloggt sein um die Funktion nutzen zu können");

    setLoading(true);
    let questionId = quizData[questionIndex].index;

    try {
      fetchGPTEvaluation(userAnswer, questionId, gameID)
      .then(data => {
        setGptData(data.reply);
        setCorrectAnswer(data.dbAnswer);
        setLoading(false);
      })
    } catch (error) {
      console.error("An error occurred:", error.message);
      setError(true);
    }
  };



  const startNewGame = async () => {
    setIsPlaying(true);
    clearQuestionData();
    setLoading(true);
    setQuizdata(null);
    setQuestionIndex(0);

    try {
      let gameData = await createNewGame(currentUser.uid)
      setQuizdata(gameData.gameQuestions);
      console.log(gameData.gameId);
      setGameID(gameData.gameId);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setError(true);
    }
  }



  const changeQuestionIndex = () => {

    setQuestionIndex(prevIndex => (prevIndex += 1));
    clearQuestionData();
    
  };


  const endGame = () => {
    setIsPlaying(false);
    clearQuestionData();
    setQuizdata(null);
  };

  const clearQuestionData = () => { 
    setUserAnswer("");
    setGptData(null);
    setCorrectAnswer(null);
  };

  return (
    <div className="appContainer">

      {showRanking ? (<GameRanking
      showRanking={setShowRanking}
      />) : ("")}
     
      {showSignInWithGooglePopup ? (
        <SignInWithGooglePopup
        showPopup = {setShowSignInWithGooglePopup}
        />
      ) : (
        ""
      )}
      {showGameStatistics ? (
        <GameStatistics
        showGameStatisticsState = {[showGameStatistics, setShowGameStatistics]}
        gameId = {gameID}
        />
      ) : (
        ""
      )}
      <div className="App">
      <h1>Welcome to the IT- Quiz</h1>
        <div>
          {!currentUser ? (
          <button onClick={()=>setShowSignInWithGooglePopup(true)}>Mit Google anmelden</button>
          ):(<button onClick={() => logOut(setError)}>Ausloggen</button>)}
          {/* <br /> */}
          
        </div>

        {isPlaying ? (
  <div>
    <div>
      <p>Frage Nummer {questionIndex + 1}</p>
      <p>{quizData ? quizData[questionIndex].frage : "Hier soll die Frage stehen..."}</p>
      
      <form onKeyDown={submitForm} onSubmit={submitForm}>
        <label htmlFor="answerField"></label>
        <br />
        <textarea
          placeholder="Deine Antwort..."
          type="text"
          id="answerField"
          maxLength={500}
          onChange={e => setUserAnswer(e.target.value)}
          value={userAnswer}
        />
        <br />
        
        <button type="submit" disabled={gptData || loading}>Senden</button>
        
      </form>
      <br />
    </div>
    
    <div>
      <div>
        {correctAnswer ? (
          <div>
            <h3>Antwort aus der Datenbank</h3>
            <p>{correctAnswer}</p>
          </div>
        ) : (
          ""
        )}
      </div>
      
      <div>
        {loading ? (
          <LoadingAnimation />
        ) : gptData ? (
          <div>
            <div>
              <h3>Beurteilung der Antwort durch ChatGPT</h3>
              <p>{gptData.answer}</p>
            </div>
            <div className="gpt-percentage">{gptData.percentage} %</div>
            <div>
              <h3>Lösung von ChatGPT</h3>
              <p>{gptData.GPTAnswer}</p>
              <button id="nextButton" disabled={questionIndex===9} onClick={changeQuestionIndex}>
        Nächste Frage
      </button>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      
      {error && <p>Irgendetwas ist schief gelaufen...</p>}
    </div>
    <button onClick={endGame} disabled={loading}>Spiel beenden</button>
    <button onClick={() => setShowGameStatistics(!showGameStatistics)}>
    Show Statistics
  </button>
  <button onClick={()=>setShowRanking(!showRanking)}>Show Ranking</button>

  </div>
) : (
  <div>
    <br />
    <button onClick={()=>startNewGame()}>Neues Spiel?</button>
    <button onClick={()=>setShowRanking(!showRanking)}>Show Ranking</button>
    
  


  </div>
)}

      </div>
    </div>
  );
}

export default App;
