import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function MapGrid() {
  const rows = 10;
  const cols = 10;
  const [grid, setGrid] = useState(Array(rows).fill().map(() => Array(cols).fill(0)));
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  const [path, setPath] = useState([]);

  const handleCellClick = (r, c) => {
    if (!start) setStart([r, c]);
    else if (!goal) setGoal([r, c]);
    else {
      const newGrid = [...grid];
      newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1; // toggle wall
      setGrid(newGrid);
    }
  };

  const handleFindPath = async () => {
    if (!start || !goal) {
      alert("Please select start and goal first!");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/path", {
        start,
        goal,
        grid,
      });
      setPath(res.data.path);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend!");
    }
  };

  const isPathCell = (r, c) => path.some(([pr, pc]) => pr === r && pc === c);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Campus Navigation Grid</h2>
      <div className="grid grid-cols-10 gap-1">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            let bg = "bg-white";
            if (cell === 1) bg = "bg-gray-700";
            if (start && start[0] === r && start[1] === c) bg = "bg-green-500";
            if (goal && goal[0] === r && goal[1] === c) bg = "bg-red-500";
            if (isPathCell(r, c)) bg = "bg-yellow-400 animate-pulse";

            return (
              <motion.div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 rounded-md border border-gray-300 cursor-pointer ${bg}`}
                whileHover={{ scale: 1.1 }}
              />
            );
          })
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleFindPath}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Find Path
        </button>
        <button
          onClick={() => { setStart(null); setGoal(null); setPath([]); }}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
