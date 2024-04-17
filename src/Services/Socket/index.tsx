import io from "socket.io-client";
import { BASEURL } from "../../Utils/apiUtils";

const socket = io(BASEURL);

const connectSocket = () => {
  socket.connect();
};

// ---------------------------------------------
const heartBeat = (callback: any) => {
  socket.emit("heartbeat", callback);
};

const joinConversation = (callback: any) => {
  socket.emit("join", callback);
};

const leaveConversation = (callback: any) => {
  socket.on("leave", callback);
};

const sendMessage = (callback: any) => {
  socket.emit("send message", callback);
};

const receiveMessage = () => {
  socket.emit("send message");
};
// ---------------------------------------------

const disconnectSocket = () => {
  socket.disconnect();
};

export {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  receiveMessage,
  heartBeat,
};
