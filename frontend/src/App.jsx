import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Analytics from "./pages/Analytics";
import Assistant from "./pages/Assistant";
import StockDetails from "./pages/StockDetails";

import "./App.css";


function AppContent() {

  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";


  return (
    <div className="app">

      {!isAuthPage && <Navbar />}

      <main className="main-content">

        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


          <Route
            path="/login"
            element={<Login />}
          />


          <Route
            path="/register"
            element={<Register />}
          />


          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          <Route
            path="/portfolio"
            element={<Portfolio />}
          />


          <Route
            path="/watchlist"
            element={<Watchlist />}
          />


          <Route
            path="/analytics"
            element={<Analytics />}
          />


          <Route
            path="/assistant"
            element={<Assistant />}
          />


          <Route
            path="/stocks/:symbol"
            element={<StockDetails />}
          />

        </Routes>

      </main>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App;