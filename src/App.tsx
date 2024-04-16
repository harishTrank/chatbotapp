import { useEffect, useState } from "react";
import Login from "./Screens/Login";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Chatscreen from "./Screens/Chatscreen";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkUserLoginFlag = () => {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkUserLoginFlag();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isLoggedIn ? <Login /> : <Navigate to="/chat" />}
          />
          <Route
            path="/chat"
            element={isLoggedIn ? <Chatscreen /> : <Navigate to="/login" />}
          />
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
