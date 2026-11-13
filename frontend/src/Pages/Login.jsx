import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateFrontend = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validateFrontend()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim(),
        password
      });

      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMsg(response.data.message || "Login successful!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="login-container">
        <div className="login-box">
          <h2><i className="fa-solid fa-right-to-bracket" style={{ color: "#2563EB" }}></i> User Login</h2>

          {successMsg && (
            <div className="alert-success">
              <i className="fa-solid fa-circle-check"></i> {successMsg}
            </div>
          )}
          {serverError && (
            <div className="alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group-custom">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && (
                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.password}</span>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login to Account"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p style={{ fontSize: "14px", color: "#64748B" }}>
                Don't have an account? <Link to="/signup" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
