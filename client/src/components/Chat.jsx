import { useEffect, useState } from "react";
import socket from "../socket";

const Chat = ({ roomId, username }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: roomId,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const handler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    
    socket.on("receive_message", handler);

    return () => socket.off("receive_message", handler);
  }, []);

  return (
    <div className="d-flex flex-column h-100">
      <div className="chat-header mb-2">
        <h4 className="m-0">Live Chat</h4>
      </div>
      
      {/* Messages Body */}
      <div 
        className="chat-body flex-grow-1 overflow-auto border rounded p-2 mb-2" 
        style={{background: "#0d1117", scrollbarWidth: "thin"}}
      >
          {messageList.map((msg, index) => {
            const isMe = msg.author === username;
            
            return (
               <div key={index} className={`d-flex flex-column mb-2 ${isMe ? "align-items-end" : "align-items-start"}`}>
                  <div 
                    className={`p-2 rounded text-white ${isMe ? "bg-primary" : "bg-secondary"}`}
                    style={{maxWidth: "85%", wordBreak: "break-word"}}
                  >
                     <div className="d-flex justify-content-between align-items-baseline gap-2">
                        <span className="fw-bold small" style={{fontSize: "0.7rem", opacity: 0.8}}>{msg.author}</span>
                        <span style={{fontSize: "0.6rem", opacity: 0.6}}>{msg.time}</span>
                     </div>
                     <p className="m-0">{msg.message}</p>
                  </div>
               </div>
            );
          })}
      </div>

      {/* Chat Input */}
      <div className="chat-footer d-flex gap-2">
        <input
          type="text"
          className="form-control"
          value={currentMessage}
          placeholder="Type a guess..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
        />
        <button className="btn btn-success fw-bold" onClick={sendMessage}>
           ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;