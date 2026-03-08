import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import {
  FiMenu,
  FiChevronDown,
  FiBell,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiMapPin,
  FiTool,
  FiDatabase,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import logojmto from "../assets/logo-jmto-white.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMonitoringParkirOpen, setIsMonitoringParkirOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (
      ["/dashboard", "/area", "/service", "/database"].includes(
        location.pathname
      )
    ) {
      setIsMonitoringParkirOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <img src={logojmto} className="jmto-logo" alt="bg" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Monitoring Kerusakan */}
        <div
          className={`nav-item ${isActive("/latoll") ? "active" : ""}`}
          onClick={() => navigate("/latoll")}
        >
          <FiMenu size={20} />
          <span>Monitoring Kerusakan</span>
        </div>

        {/* Monitoring Parkir */}
        <div
          className={`nav-section ${
            ["/dashboard", "/area", "/service", "/database"].includes(
              location.pathname
            )
              ? "active"
              : ""
          }`}
        >
          <div
            className={`nav-item-header ${
              ["/dashboard", "/area", "/service", "/database"].includes(
                location.pathname
              )
                ? "active"
                : ""
            }`}
            onClick={() => setIsMonitoringParkirOpen(!isMonitoringParkirOpen)}
          >
            <FiMapPin size={20} />
            <span>Monitoring Parkir</span>
            <FiChevronDown
              size={18}
              className={`chevron ${isMonitoringParkirOpen ? "open" : ""}`}
            />
          </div>

          {isMonitoringParkirOpen && (
            <div className="submenu">
              <div
                className={`submenu-item ${
                  isActive("/dashboard") ? "active" : ""
                }`}
                onClick={() => navigate("/dashboard")}
              >
                <FiGrid size={18} />
                <span>Dashboard</span>
              </div>

              <div
                className={`submenu-item ${
                  isActive("/area") ? "active" : ""
                }`}
                onClick={() => navigate("/area")}
              >
                <FiMapPin size={18} />
                <span>Area</span>
              </div>

              <div
                className={`submenu-item ${
                  isActive("/service") ? "active" : ""
                }`}
                onClick={() => navigate("/service")}
              >
                <FiTool size={18} />
                <span>Service</span>
              </div>

              <div
                className={`submenu-item ${
                  isActive("/database") ? "active" : ""
                }`}
                onClick={() => navigate("/database")}
              >
                <FiDatabase size={18} />
                <span>Database</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div
          className={`nav-item ${isActive("/notifications") ? "active" : ""}`}
          onClick={() => navigate("/notifications")}
        >
          <FiBell size={20} />
          <span>Notifications</span>
        </div>

        {/* Settings */}
        <div
          className={`nav-item ${isActive("/settings") ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <FiSettings size={20} />
          <span>Settings</span>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="nav-item logout-item"
          onClick={() => navigate("/dashboard")}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <span>JD</span>
          </div>
          <div className="user-info">
            <h3>John Doe</h3>
            <p>johndoe@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
