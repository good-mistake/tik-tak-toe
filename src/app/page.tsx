"use client";
import React, { useRef, useState, useEffect } from "react";

import Image from "next/image";

export default function Home() {
  const [pick, setPick] = useState<"x" | "o">("x");
  const [mode, setMode] = useState<"pvp" | "pvc" | null>(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [rounds, setRounds] = useState<{ win: string | null }[]>([]);
  const [finish, setFinish] = useState(false);
  const [turn, setTurn] = useState<"x" | "o">("x");
  const [resModal, setResModal] = useState(false);
  const [result, setResult] = useState<"wonX" | "draw" | "wonO" | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [hoverindex, setHoverIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const minimax = (
    board: (string | null)[],
    player: "x" | "o"
  ): { index: number; score: number } => {
    const avail = board
      .map((v, i) => (v === null ? i : null))
      .filter((i) => i !== null) as number[];

    const { winner } = whoWon(board);
    if (winner === "x") return { index: -1, score: -10 };
    if (winner === "o") return { index: -1, score: 10 };
    if (!avail.length) return { index: -1, score: 0 };

    let bestMove!: { index: number; score: number };

    if (player === "o") {
      let bestScore = -Infinity;
      for (const idx of avail) {
        const b2 = [...board];
        b2[idx] = player;
        const { score } = minimax(b2, "x");
        if (score > bestScore) {
          bestScore = score;
          bestMove = { index: idx, score };
        }
      }
    } else {
      let bestScore = Infinity;
      for (const idx of avail) {
        const b2 = [...board];
        b2[idx] = player;
        const { score } = minimax(b2, "o");
        if (score < bestScore) {
          bestScore = score;
          bestMove = { index: idx, score };
        }
      }
    }

    return bestMove;
  };

  const whoWon = (won: (string | null)[]) => {
    const winnerLine = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of winnerLine) {
      if (won[a] && won[a] === won[b] && won[a] === won[c]) {
        return { winner: won[a], line: [a, b, c] };
      }
    }
    return { winner: null, line: null };
  };

  const handleClick = (i: number) => {
    if (board[i] || finish) return;

    const update = [...board];
    update[i] = turn;
    setBoard(update);

    const { winner, line } = whoWon(update);
    setResult(winner ? (winner === "x" ? "wonX" : "wonO") : "draw");

    if (winner || update.every((cell) => cell !== null)) {
      setRounds([...rounds, { win: winner }]);
      setFinish(true);
      setWinningLine(line);
      return;
    }

    const whosNext = turn === "x" ? "o" : "x";
    setTurn(whosNext);
  };
  useEffect(() => {
    if (
      mode === "pvc" &&
      !finish &&
      ((pick === "o" && turn === "x") || (pick === "x" && turn === "o"))
    ) {
      const timer = setTimeout(() => {
        const { index } = minimax(board, turn);
        if (index !== undefined) handleClick(index);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, board, finish]);
  useEffect(() => {
    if (!resModal) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setResModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [resModal]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn("x");
    setFinish(false);
    setWinningLine(null);
  };
  const Quit = () => {
    resetGame();
    setResult(null);
    setRounds([]);
    setMode(null);
  };
  const restart = () => {
    resetGame();
    setResult(null);
    setRounds([]);
    setResModal(false);
  };
  const rematch = () => {
    resetGame();
  };
  const xWins = rounds.filter((r) => r.win === "x").length;
  const oWins = rounds.filter((r) => r.win === "o").length;
  const ties = rounds.filter((r) => r.win === null).length;
  return (
    <div className="tikTakToe">
      {mode === null && (
        <section className={`first ${!mode ? "notactive" : ""}`}>
          <Image
            src={"/assets/logo.svg"}
            width={71.97}
            height={32}
            alt="logo"
          />
          <div className="start">
            <p>PICK PLAYER 1’S MARK</p>
            <div className="pick">
              <button
                onClick={() => setPick("x")}
                className={`${pick === "x" ? "active" : ""}`}
              >
                <Image
                  src={"/assets/icon-x.svg"}
                  width={32}
                  height={32}
                  alt="X"
                ></Image>
              </button>
              <button
                onClick={() => setPick("o")}
                className={`${pick === "o" ? "active" : ""}`}
              >
                <Image
                  src={"/assets/icon-o.svg"}
                  width={32}
                  height={32}
                  alt="O"
                ></Image>
              </button>
            </div>
            <p className="firsts">REMEMBER : X GOES FIRST</p>
          </div>
          <div className="btns">
            <button
              onClick={() => {
                setMode("pvc");
                setTurn("x");
              }}
            >
              NEW GAME (VS CPU)
            </button>
            <button
              onClick={() => {
                setMode("pvp");
                setTurn("x");
              }}
            >
              NEW GAME (VS PLAYER)
            </button>
          </div>
        </section>
      )}

      {mode !== null && (
        <section className={`second ${!mode ? "" : "active"}`}>
          <div className="turn">
            <Image
              src={"/assets/logo.svg"}
              width={71.97}
              height={32}
              alt="logo"
            />
            <div className="whosTurn">
              <Image
                key={turn}
                src={turn === "x" ? "/assets/icon-x.svg" : "/assets/icon-o.svg"}
                alt={turn === "x" ? "x" : "o"}
                width={20}
                height={20}
                className="icon"
              />
              <p>TURN</p>
            </div>
            <button className="restart" onClick={() => setResModal(true)}>
              <Image
                src={"/assets/icon-restart.svg"}
                width={20}
                height={20}
                alt="restart"
              />
            </button>
          </div>
          <div className="board">
            {board.map((b, i) => {
              return (
                <button
                  key={i}
                  className={`cells ${
                    winningLine?.includes(i) ? "highlight" : ""
                  }  ${b === "x" ? "blue" : b === "o" ? "yellow" : ""}`}
                  onClick={() => handleClick(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {b ? (
                    <Image
                      src={`/assets/icon-${b}.svg`}
                      width={64}
                      height={64}
                      alt={b}
                    />
                  ) : (
                    hoverindex === i && (
                      <Image
                        src={`/assets/icon-${turn}-outline.svg`}
                        width={64}
                        height={64}
                        alt={`${turn}-outline`}
                        className="opacity-50"
                      />
                    )
                  )}
                </button>
              );
            })}
          </div>
          <div className="result">
            <div className="col">
              {mode === "pvp"
                ? "X (Player 1)"
                : pick === "x"
                ? "X (YOU)"
                : "X (CPU)"}
              <p>{xWins}</p>
            </div>
            <div className="col">
              TIES <p>{ties}</p>
            </div>
            <div className="col">
              {mode === "pvp"
                ? "O (Player 2)"
                : pick === "o"
                ? "O (YOU)"
                : "O (CPU)"}
              <p>{oWins}</p>
            </div>
          </div>
        </section>
      )}

      {finish && (
        <section className="third">
          <div className="overLay"></div>
          <div className="modal">
            {mode === "pvc" ? (
              <p>
                {result === "draw"
                  ? ""
                  : (pick === "o" && result === "wonO") ||
                    (pick === "x" && result === "wonX")
                  ? "YOU WON!"
                  : "OH NO, YOU LOST…"}
              </p>
            ) : (
              <p>
                {result === "draw"
                  ? ""
                  : (pick === "x" && result === "wonX") ||
                    (pick === "o" && result === "wonO")
                  ? "PLAYER 1 WINS!"
                  : "PLAYER 2 WINS!"}
              </p>
            )}

            <div className="results">
              {result !== "draw" && (
                <Image
                  width={64}
                  height={64}
                  src={
                    result === "wonO"
                      ? "/assets/icon-o.svg"
                      : "/assets/icon-x.svg"
                  }
                  alt="winner"
                />
              )}
              <p
                className={
                  result === "wonO"
                    ? "yellow"
                    : result === "wonX"
                    ? "blue"
                    : "silver"
                }
              >
                {result === "wonX"
                  ? "TAKES THE ROUND"
                  : result === "wonO"
                  ? "TAKES THE ROUND"
                  : "ROUND TIED"}
              </p>
            </div>
            <div className="btns">
              <button onClick={Quit}>Quit</button>
              <button
                onClick={rematch}
                className={
                  result === "wonO"
                    ? "yellow"
                    : result === "wonX"
                    ? "blue"
                    : "silver"
                }
              >
                Next Round
              </button>
            </div>
          </div>
        </section>
      )}
      {resModal && (
        <section className="fourth">
          <div className="overLay"></div>
          <div className="modal" ref={modalRef}>
            <h4>RESTART GAME?</h4>
            <div className="btns">
              <button onClick={() => setResModal(false)}>NO, CANCEL</button>
              <button onClick={restart} className={"yellow"}>
                YES, RESTART
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
