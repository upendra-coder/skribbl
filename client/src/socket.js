import { io } from "socket.io-client";

// This ensures we only create ONE connection for the whole app
const serverURL = "https://skribbl-backend-flx5.onrender.com";
const socket = io(serverURL, { transports: ["websocket"] });

export default socket;