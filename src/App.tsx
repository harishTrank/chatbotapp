import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Screens/Login";
import Chatscreen from "./Screens/Chatscreen";

function App() {
  return (
    <div className="App">
      <ToastContainer autoClose={2000} />
      {/* <Login /> */}
      <Chatscreen />
    </div>
  );
}

export default App;
