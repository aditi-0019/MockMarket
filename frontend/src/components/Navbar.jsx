import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getPortfolio } from "../services/api";

function Navbar() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const portfolio = await getPortfolio();
        setBalance(portfolio.cash_balance);
      } catch (error) {
        console.error("Failed to load balance:", error);
      }

      const savedUser = localStorage.getItem("mockmarket_user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Invalid user data");
        }
      }
    }

    loadNavbarData();

    function handleBalanceUpdate() {
      loadNavbarData();
    }

    window.addEventListener(
      "mockmarket-balance-update",
      handleBalanceUpdate
    );

    return () => {
      window.removeEventListener(
        "mockmarket-balance-update",
        handleBalanceUpdate
      );
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("mockmarket_user");
    localStorage.removeItem("mockmarket_token");

    setShowProfile(false);

    navigate("/login");
  }

  const displayName =
    user?.name || user?.username || "User";

  const email =
    user?.email || "No email available";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo">
        <h2>MOCKMARKET</h2>

        <span>
          Virtual Stock Trading
        </span>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="nav-links">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          Portfolio
        </NavLink>

        <NavLink
          to="/watchlist"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          Watchlist
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          Analytics
        </NavLink>

        <NavLink
          to="/assistant"
          className={({ isActive }) =>
            `nav-button ${isActive ? "active" : ""}`
          }
        >
          AI Assistant
        </NavLink>

      </div>

      {/* USER SECTION */}
      <div
        className="user-section"
        ref={profileRef}
      >

        <span>
          ₹{balance.toLocaleString("en-IN")}
        </span>

        <button
          type="button"
          className="avatar"
          onClick={() =>
            setShowProfile(!showProfile)
          }
          title="View Profile"
        >
          {initial}
        </button>

        {/* PROFILE DROPDOWN */}
        {showProfile && (
          <div className="profile-dropdown">

            <div className="profile-header">

              <div className="profile-avatar">
                {initial}
              </div>

              <div>
                <h3>{displayName}</h3>
                <p>{email}</p>
              </div>

            </div>

            <div className="profile-details">

              <div className="profile-detail">
                <span>Name</span>
                <strong>{displayName}</strong>
              </div>

              <div className="profile-detail">
                <span>Email</span>
                <strong>{email}</strong>
              </div>

              <div className="profile-detail">
                <span>Virtual Balance</span>
                <strong>
                  ₹{balance.toLocaleString("en-IN")}
                </strong>
              </div>

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  );
}

export default Navbar;