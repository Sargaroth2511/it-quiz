import React, { useState, useEffect } from 'react';

const GameRanking = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funktion, die den API-Endpunkt aufruft und die Daten abruft
  const fetchGameRanking = async () => {
    try {
      const response = await fetch('/gamesRanked');
      
      // Überprüfen, ob die Anfrage erfolgreich war
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Daten');
      }

      const data = await response.json();
      setGames(data);  // Setze die abgerufenen Spiele in den State
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Verwende useEffect, um die Daten zu laden, sobald die Komponente gemountet wird
  useEffect(() => {
    fetchGameRanking();
  }, []);

  // Fehler oder Ladeanzeige
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Darstellung der Spiele mit durchschnittlichem GPT-Prozentsatz in einer Liste
  return (
    <div>
      <h1>Game Ranking</h1>
      <ul>
        {games.map((game, index) => (
          <li key={game.game_id}>
            <strong>Rank {index + 1}:</strong> Player: {game.user_name}, Average GPT Percentage: {game.average_gpt_percentage}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameRanking;
