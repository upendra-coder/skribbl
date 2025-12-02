import { io } from "socket.io-client";

// This ensures we only create ONE connection for the whole app
const serverURL = "http://localhost:5000";
const socket = io(serverURL, { transports: ["websocket"] });

export default socket;