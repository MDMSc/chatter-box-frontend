import './App.css';
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Chats from "./Pages/Chats";
import ForgotPasswordPage from './Pages/ForgotPasswordPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} exact />
        <Route path="/chats" element={<Chats />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </div>
  );
}

export default App;
