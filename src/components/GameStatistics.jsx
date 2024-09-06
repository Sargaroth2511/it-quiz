import React, { useState, useEffect } from 'react';
import LoadingAnimation from './LoadingAnimation';

const GameStatistics = ({ showGameStatisticsState, gameId }) => {
    const [showGameStatistics, setShowGameStatistics] = showGameStatisticsState;
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGameStatistics = async () => {
            try {
                const response = await fetch(`/gameStatistics/${gameId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch game statistics');
                }

                const data = await response.json();
                console.log(data);
                setStatistics(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGameStatistics();
    }, [gameId, showGameStatistics]);

    // if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='statistics'>
            <div className='gameStatistics'>
                <button 
                    className='closeButton'
                    onClick={() => {
                    setShowGameStatistics(false)
                    setLoading(false)
                }
                }>X</button>
                <h2>Game Statistics</h2>
            {
                loading ? <LoadingAnimation />
                : error ? <div>Error: {error}</div>
                : statistics && (
                    <>
                        <div>
                            <h3>Average Percentage:</h3>
                            <div>{statistics.statistics.average_percentage}</div>
                        </div>
                        {statistics.statistics.best_answer &&
                        <div>

                            <h3>Best Answer</h3>
                            <div>{statistics.statistics.best_answer.gptPercentage} %</div>
                            <h3>Question:</h3>
                            <div>{statistics.statistics.best_answer.question}</div>
                            <h3>Answer:</h3>
                            <div>{statistics.statistics.best_answer.userAnswer}</div>
                        </div>
                        }
                        <div>
                            <h3>Answers above 50%</h3>
                            <div>{statistics.statistics.answers_above_50}</div>
                        </div>
                        <div>
                            <h3>Answers above 80%</h3>
                            <div>{statistics.statistics.answers_above_80}</div>
                        </div>
                        <div>
                            <h3>Answers with 100%</h3>
                            <div>{statistics.statistics.answers_with_100}</div>
                        </div>
                        <div>
                            <h3>Ranking of this Game</h3>
                            <div>{statistics.ranking}</div>
                        </div>
                    </>
                )}
            
                
            </div>
        </div>
    );
};

export default GameStatistics;
