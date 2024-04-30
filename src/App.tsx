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
import { useAtom } from "jotai";
import { sessionChange } from "./jotai";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [sessionChangeAtom] = useAtom(sessionChange);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    let interval: any;
    const checkUserLoginFlag = () => {
      if (token) {
        setIsLoggedIn(true);
        connectSocket();
        const userData: any = sessionStorage.getItem("userData");
        const currentUserId = JSON.parse(userData)?._id;
        interval = setInterval(() => {
          heartBeat({
            userId: currentUserId,
          });
        }, 10000);
      } else {
        setIsLoggedIn(false);
        if (interval) {
          clearInterval(interval);
        }
        disconnectSocket();
      }
    };
    checkUserLoginFlag();
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      disconnectSocket();
    };
  }, [sessionChangeAtom]);

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
