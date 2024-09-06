import React from 'react'

const LoadingAnimation = () => {
    const questionMarks = Array.from({ length: 20 }, (_, index) => {
      const leftPosition = Math.random() * 90; // Zufällige horizontale Position zwischen 0% und 90%
      const delay = Math.random() * 2; // Zufällige Verzögerung zwischen 0 und 2 Sekunden
  
      return (

        <div
          key={index}
          className="question-mark"
          style={{ left: `${leftPosition}%`, animationDelay: `${delay}s` }}
        >
          ?
        </div>
      );
    });
  
    return <div className="loading-container">Loading...{questionMarks}</div>;
  };
export default LoadingAnimation