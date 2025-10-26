import {BrowserRouter, Routes, Route} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CandidateList from "./pages/CandidateList";
import Settings from "./pages/Settings";
import CooperationRecords from "./pages/CooperationRecords";
import Documents from "./pages/Documents";
import MyFavorites from "./pages/MyFavorites";
import "./index.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/candidates" element={<CandidateList/>}/>
                <Route path="/favorites" element={<MyFavorites/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/cooperation-records" element={<CooperationRecords/>}/>
                <Route path="/documents" element={<Documents/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
