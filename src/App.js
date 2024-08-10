import React, { useEffect, useState } from "react";
import firebaseApp from "./Services/firebase/initializeFirebase";
import "./App.css";
import fetchGPTData from "./Services/apiCalls/fetchGPTData";
import authListener from "./Services/firebase/authListener";
import logOut from "./Services/firebase/logOut";
import SignInWithGooglePopup from "./components/signInWithGooglePopup";
import { getFirestore, collection, doc, setDoc, addDoc } from "firebase/firestore";
import GameStatistics from "./components/GameStatistics";

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

  const storeInDB = async (data) => {
    try {
      const gameRef = doc(db, "games", gameID);
      await setDoc(gameRef, {
        [quizData[questionIndex].index]: {
          userAnswer: userAnswer,
          evaluateAnswer: data.answer,
          gptAnswer: data.GPTAnswer,
          gptPercentage: data.percentage,
          status: 'answered',
        },
      }, { merge: true });
    } catch (error) {
      console.error("Error storing data in DB: ", error);
    }
  };

  useEffect(() => {
    if (sendAnswer && currentUser && quizData) {
      setLoading(true);
      const correctAnswer = quizData[questionIndex].antwort;
      const question = quizData[questionIndex].frage;

      const fetchData = async () => {
        const data = await fetchGPTData(correctAnswer, question, userAnswer);
        return data;
      };
      fetchData()
        .then(data => {
          setGptData(data);
          storeInDB(data);
          setLoading(false);
          setSendAnswer(false);
          if (questionIndex === 9) {
            setIsGameComplete(true);
          }
        })
        .catch(err => setError(err));
    } else if (sendAnswer && !currentUser) {
      alert("Du muss eingeloggt sein um die Funktion nutzen zu können");
      setSendAnswer(false);
    }
  }, [sendAnswer, currentUser, questionIndex, userAnswer, quizData]);

  useEffect(() => {
    if (!isPlaying) return;
    const learningField = "LF1";
    const backendUrl = `/quizlet?questionNumber=${encodeURIComponent(
      questionNumber
    )}&learningField=${encodeURIComponent(learningField)}`;

    fetch(backendUrl)
      .then(res => {
        if (!res.ok) {
          setError(`Request failed with status ${res.status}`);
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        createNewGame(db, currentUser.uid, data);
        setQuizdata(data);
      })
      .catch(error => {
        console.error("An error occurred:", error.message);
        setError(true);
      });
  }, [isPlaying]);

  useEffect(() => {
    setUserAnswer("");
    setGptData(null);
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

  async function createNewGame(db, userId, data) {
    try {
      console.log(data);
      const newGame = {
        createdBy: userId,
        createdAt: new Date(),
        status: 'active',
      };
      data.forEach((question) => {
        newGame[question.index] = {
          question: question.frage,
          correctAnswer: question.antwort,
          evaluateAnswer: null,
          userAnswer: null,
          gptAnswer: null,
          gptPercentage: 0,
          status: null,
        };
      });
      const gameRef = await addDoc(collection(db, "games"), newGame);
      console.log("New game created with ID: ", gameRef.id);
      setGameID(gameRef.id);
    } catch (error) {
      console.error("Error creating new game: ", error);
    }
  }

  const startNewGame = () => {
    setIsPlaying(true);
    setUserAnswer("");
    setGptData(null);
    setIsGameComplete(false);
  };

  const endGame = () => {
    setIsPlaying(false);
    setUserAnswer("");
    setGptData(null);
    setQuizdata(null);
    setIsGameComplete(true);
  };

  return (
    <div className="appContainer">
     
      {showSignInWithGooglePopup ? (
        <SignInWithGooglePopup
        showPopup = {setShowSignInWithGooglePopup}
        />
      ) : (
        ""
      )}
      {isGameComplete ? (
        <GameStatistics
        showStatistics = {setIsGameComplete}
        db= {db}
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
        {quizData && sendAnswer && currentUser ? (
          <div>
            <h3>Antwort aus der Datenbank</h3>
            <p>{quizData[questionIndex].antwort}</p>
          </div>
        ) : (
          "Hier steht die richtige Antwort"
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
  </div>
) : (
  <div>
    <br />
    <button onClick={()=>startNewGame()}>Neues Spiel?</button>

  </div>
)}

      </div>
    </div>
  );
}

export default App;
