import { useEffect, useState } from "react";
import Login from "./Screens/Login";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Chatscreen from "./Screens/Chatscreen";
import { connectSocket, disconnectSocket, heartBeat } from "./Services/Socket";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    const checkUserLoginFlag = () => {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
        connectSocket();
        const userData: any = sessionStorage.getItem("userData");
        const currentUserId = JSON.parse(userData)._id;
        interval = setInterval(() => {
          heartBeat({
            userId: currentUserId,
          });
        }, 10000);
      }
    };
    checkUserLoginFlag();
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isLoggedIn ? <Login /> : <Navigate to="/chat" />}
          />
          {isLoggedIn && (
            <>
              <Route path="/chat" element={<Chatscreen />} />
              <Route path="/chat/:id" element={<Chatscreen />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
// This message was deleted.
// You deleted this message.
