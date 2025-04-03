import React, { useState } from "react";
import "./App.css";

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const handleClick = async (index) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board: newBoard }),
        }
      );

      const { winner: gameWinner } = await response.json();

      if (gameWinner) {
        setWinner(gameWinner);
      } else {
        setIsXNext(!isXNext);
      }
      setBoard(newBoard);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <div className="board">
        {board.map((cell, index) => (
          <div key={index} className="cell" onClick={() => handleClick(index)}>
            {cell}
          </div>
        ))}
      </div>
      {winner && <h2>Winner: {winner} 🎉</h2>}
      {!winner && board.every((cell) => cell) && <h2>Draw! 🤝</h2>}
    </div>
  );
}

export default App;
