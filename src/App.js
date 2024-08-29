import React, { useEffect, useState } from "react";
import firebaseApp from "./Services/firebase/initializeFirebase";
import "./App.css";
import fetchGPTData from "./Services/apiCalls/fetchGPTData";
import authListener from "./Services/firebase/authListener";
import logOut from "./Services/firebase/logOut";
import SignInWithGooglePopup from "./components/signInWithGooglePopup";
import { getFirestore, collection, doc, setDoc, addDoc } from "firebase/firestore";
import GameStatistics from "./components/GameStatistics";
import GameRanking from "./components/GameRanking";

function App() {
  const [gptData, setGptData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [sendAnswer, setSendAnswer] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizdata] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [signIn, setSignIn] = useState(null);
  const [showSignInWithGooglePopup, setShowSignInWithGooglePopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameID, setGameID] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showGameStatistics, setShowGameStatistics] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = authListener(setCurrentUser);
    return () => {
      unsubscribe();
    };
  }, []);

  let questionNumber = 10;

  const submitForm = e => {
    e.preventDefault();
    if (e.keyCode === 13) {
      e.preventDefault();
    }
    setSendAnswer(true);
  };

  const handleKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      setSendAnswer(true);
    }
  };


  useEffect(() => {
    if (!sendAnswer) return;
    if (sendAnswer && currentUser) {
      setLoading(true);
      const correctAnswer = quizData[questionIndex].antwort;
      const question = quizData[questionIndex].frage;
      const questionId = quizData[questionIndex].index;
      console.log(questionId);

      const fetchData = async () => {
        const data = await fetchGPTData(userAnswer, questionId, gameID);
        return data;
      };
      fetchData()
        .then(data => {
          setGptData(data.reply);
          setCorrectAnswer(data.dbAnswer);
          setLoading(false);
          setSendAnswer(false);
          if (questionIndex === 9) {
            setIsGameComplete(true);
          }
        })
        .catch(err => console.log(err));
    } else if (sendAnswer && !currentUser) {
      alert("Du muss eingeloggt sein um die Funktion nutzen zu können");
      setSendAnswer(false);
    }
  }, [sendAnswer, currentUser]);

  const createNewGame = () => {
    setIsPlaying(true);
    fetch("/createNewGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: currentUser.uid }),
    })
      .then(res => {
        if (!res.ok) {
          setError(`Request failed with status ${res.status}`);
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setQuizdata(data.questionsAndAnswers);
        console.log(data.gameId);
        setGameID(data.gameId);

      })
      .catch(error => {
        console.error("An error occurred:", error.message);
        setError(true);
      });
  }

  // useEffect(() => {
  //   if (!isPlaying) return;

  //   fetch("/createNewGame", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ userId: currentUser.uid }),
  //   })
  //     .then(res => {
  //       if (!res.ok) {
  //         setError(`Request failed with status ${res.status}`);
  //         throw new Error(`Request failed with status ${res.status}`);
  //       }
  //       return res.json();
  //     })
  //     .then(data => {
  //       setQuizdata(data.questionsAndAnswers);
  //       console.log(data.gameId);
  //       setGameID(data.gameId);

  //     })
  //     .catch(error => {
  //       console.error("An error occurred:", error.message);
  //       setError(true);
  //     });
  // }, [isPlaying]);

  useEffect(() => {
    setUserAnswer("");
    setGptData(null);
    setCorrectAnswer(null);
  }, [questionIndex]);

  // TODO:Change bounderies to match the length of the json response

  const changeQuestionIndex = e => {
    if(loading) return alert("Bitte warte bis die Antwort geladen ist");
    if (questionIndex > 0 && e.currentTarget.id === "prevButton")
      setQuestionIndex(prevIndex => (prevIndex -= 1));
    if (
      questionIndex < 9 &&
      e.currentTarget.id === "nextButton"
    ) {
      setQuestionIndex(prevIndex => (prevIndex += 1));
    }
  };


  const startNewGame = () => {
    createNewGame();
    setUserAnswer("");
    setCorrectAnswer(null);
    setGptData(null);
    setIsGameComplete(false);
  };

  const endGame = () => {
    setIsPlaying(false);
    setUserAnswer("");
    setGptData(null);
    setQuizdata(null);
    setCorrectAnswer(null);
    setIsGameComplete(true);
  };

  return (
    <div className="appContainer">

      {showRanking ? (
        <GameRanking/>
      ) : (
        ""
      )}
     
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
          ):(<button onClick={() => logOut(setSignIn, setError)}>Ausloggen</button>)}
          {/* <br /> */}
          
        </div>

        {isPlaying ? (
  <div>
    <div>
      <p>Frage Nummer {questionIndex + 1}</p>
      <p>{quizData ? quizData[questionIndex].frage : "Hier soll die Frage stehen..."}</p>
      
      <form onKeyDown={handleKeyPress} onSubmit={submitForm}>
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
          "Loading..."
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
              <button id="nextButton" onClick={changeQuestionIndex}>
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
