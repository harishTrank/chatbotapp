import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Screens/Login";

function App() {
  return (
    <div className="App">
      <ToastContainer autoClose={2000} />
      <Login />
    </div>
  );
}

export default App;
