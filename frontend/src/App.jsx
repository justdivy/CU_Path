import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import axios from "axios";
import { GiPartyPopper } from "react-icons/gi";
import { FaDirections } from "react-icons/fa";

// Fix Leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ChandigarhUniversityMap() {
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);
  const [path, setPath] = useState([]);
  const [mood, setMood] = useState("silly");

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    if (!start) setStart([lat, lng]);
    else if (!goal) setGoal([lat, lng]);
  };

  const MapClickHandler = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  const sendToBackend = async () => {
    if (!start || !goal) {
      alert("Please select both start and goal points!");
      return;
    }

    try {
      const dummyGrid = Array(10).fill().map(() => Array(10).fill(0));
      await axios.post("http://127.0.0.1:5000/path", {
        start: [0, 0],
        goal: [9, 9],
        grid: dummyGrid,
      });

      const steps = 20;
      const line = Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        return [start[0] * (1 - t) + goal[0] * t, start[1] * (1 - t) + goal[1] * t];
      });
      setPath(line);
    } catch (err) {
      console.error(err);
      alert("Backend connection failed! Maybe it's stuck in CU traffic 🚗");
    }
  };

  const resetAll = () => {
    setStart(null);
    setGoal(null);
    setPath([]);
  };

  const landmarks = [
    { name: "Block A", coords: [30.7698, 76.5745] },
    { name: "Block B", coords: [30.7693, 76.5749] },
    { name: "Block C (CS Dept)", coords: [30.7689, 76.5752] },
    { name: "Central Library", coords: [30.7696, 76.5762] },
    { name: "Canteen", coords: [30.7701, 76.5758] },
    { name: "Hostel Area", coords: [30.7707, 76.5769] },
    { name: "Main Gate", coords: [30.7684, 76.5738] },
  ];

  const statusText = () => {
    if (!start) return "Click the map to pick your START point (Maybe your hostel?)";
    if (!goal) return "Now click to choose your GOAL (Library? Canteen? Heaven?)";
    if (path.length === 0) return "Press \"Find Path\" to get your CU shortcut 🧭";
    return "Path generated! Avoid detours via samosa stall 😅";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-yellow-50 flex flex-col items-center py-8">
      <header className="w-full max-w-5xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GiPartyPopper className="text-4xl text-red-500 animate-spin" />
          <div>
            <h1 className="text-3xl font-extrabold text-red-700">Chandigarh University Smart Navigator</h1>
            <p className="text-sm text-gray-600">Navigate CU Campus — with style, humor & zero traffic!</p>
          </div>
        </div>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/90 shadow-sm text-sm"
        >
          <option value="silly">Silly</option>
          <option value="calm">Calm</option>
          <option value="energetic">Energetic</option>
        </select>
      </header>

      <main className="w-full max-w-5xl mt-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="col-span-2 bg-white/90 p-4 rounded-xl shadow-lg">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-red-700 mb-3"
            >
              Map (Click to Set Start & Goal)
            </motion.h2>

            <div className="border rounded-lg overflow-hidden">
              <MapContainer center={[30.7694, 76.5750]} zoom={17} className="h-[60vh] w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />

                {landmarks.map((l, idx) => (
                  <Marker key={idx} position={l.coords}>
                    <Popup>{l.name}</Popup>
                  </Marker>
                ))}

                {start && <Marker position={start}><Popup>Start Point</Popup></Marker>}
                {goal && <Marker position={goal}><Popup>Goal Point</Popup></Marker>}

                {path.length > 0 && (
                  <Polyline positions={path} pathOptions={{ color: mood === "energetic" ? "red" : mood === "calm" ? "blue" : "magenta", weight: 5 }} />
                )}
              </MapContainer>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">{statusText()}</div>
              <div className="flex gap-3">
                <button
                  onClick={sendToBackend}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <FaDirections /> Find Path
                </button>
                <button onClick={resetAll} className="px-4 py-2 bg-gray-200 rounded-lg">Reset</button>
              </div>
            </div>
          </section>

          <aside className="bg-white/90 p-4 rounded-xl shadow-lg">
            <h3 className="font-semibold text-red-700 mb-2">🎓 CU Landmarks</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {landmarks.map((l, i) => (
                <li key={i}>📍 {l.name}</li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm">
              <p className="text-red-700 font-medium">Tips for CU Adventurers:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>Avoid 1pm crowd near Canteen 🍔</li>
                <li>Library WiFi strongest near window 📶</li>
                <li>Beware of sudden rain ambush 🌧️</li>
              </ul>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Made with ❤️ at Chandigarh University</p>
          </aside>
        </div>
      </main>

      <footer className="w-full max-w-5xl px-6 mt-8 text-center text-xs text-gray-500">
        🚶 Walk smart. Laugh often. Study sometimes. — CU Smart Navigator
      </footer>
    </div>
  );
}
