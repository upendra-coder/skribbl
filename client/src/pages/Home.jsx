import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Home = () => {
  const [user, setUser] = useState({
    username: "",
    room: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 7);
    setUser({ ...user, room: id });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (user.username && user.room) {
      navigate(`/room/${user.room}`, { state: user });
    } else {
      alert("Please enter a username and room ID");
    }
  };

  return (
    <div className="home-wrapper">
      <div className="card shadow-lg p-4" style={{ width: "360px" }}>
        <h1 className="mb-4 text-center">🎨 Skribbl </h1>

        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <input
              type="text"
              name="username"
              placeholder="Enter your Name"
              className="form-control"
              value={user.username}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="mb-3 input-group">
            <input
              type="text"
              name="room"
              placeholder="Enter Room ID"
              className="form-control"
              value={user.room}
              onChange={handleChange}
              autoComplete="off"
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={generateRoomId}
            >
              Generate
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Play Game 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
