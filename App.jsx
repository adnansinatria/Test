import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Area from "./components/Area";
import Service from "./components/Service";
import Database from "./components/Database";
import Notifications from "./components/Notification";
import Settings from "./components/Settings";
import Lattol from "./components/Lattol";
import logoBg from "./assets/logo-jmto-opacity.png";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <div className='glassmorph'></div>
        <div className='blue'></div>

        <Sidebar />

        {/* Global Layout */}
        <div className="app-wrapper">
          <div className="app-white">
            <img src={logoBg} className="app-bg-logo" alt="bg" />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/area" element={<Area />} />
              <Route path="/service" element={<Service />} />
              <Route path="/database" element={<Database />} />
              <Route path="/latoll" element={<Lattol />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </div>

      </div>
    </Router>
  );
}
