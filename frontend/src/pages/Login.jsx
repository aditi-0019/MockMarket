import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(
        username.trim(),
        password
      );

      // Save JWT token
      localStorage.setItem(
        "mockmarket_token",
        data.access_token
      );

      // Save logged-in user
      localStorage.setItem(
        "mockmarket_user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <p className="eyebrow">MOCKMARKET</p>

        <h1>Welcome Back</h1>

        <p>
          Login to access your virtual trading portfolio.
        </p>
      </div>


      <form
        className="form-card"
        onSubmit={handleLogin}
      >

        <label htmlFor="username">
          Username
        </label>

        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />


        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />


        {error && (
          <p className="negative">
            {error}
          </p>
        )}


        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>


        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">
            Create Account
          </Link>
        </p>

      </form>

    </div>
  );
}

export default Login;