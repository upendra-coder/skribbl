import "./App.css";
import Home from "./pages/Home";
import Room from "./pages/Room";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element = {<Home />} />
          <Route path="/room/:roomId" element = {<Room />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;