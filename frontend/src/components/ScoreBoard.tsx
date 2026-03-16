

interface ScoreBoardProps {
  score: number;
}

export default function ScoreBoard({ score }: ScoreBoardProps) {
  return <div className="score-board">Score: {score}</div>;
}