import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

function Signup(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateFrontend = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = "Name is required.";
        }

        if (!email.trim()) {
            errors.email = "Email is required.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.email = "Please enter a valid email address.";
            }
        }

        if (!password) {
            errors.password = "Password is required.";
        } else if (password.length < 3) {
            errors.password = "Password must be at least 3 characters long.";
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match!";
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
            const response = await axios.post("http://localhost:5000/api/auth/signup", {
                name: name.trim(),
                email: email.trim(),
                password
            });

            setSuccessMsg(response.data.message || "Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            setServerError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <>
            <Header/>

            <div className="signup-container">
                <div className="signup-box">
                    <h2><i className="fa-solid fa-user-plus" style={{ color: "#2563EB" }}></i> Create Account</h2>

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
                            <label>Full Name *</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Alex Johnson" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {fieldErrors.name && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.name}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Email Address *</label>
                            <input 
                                type="email" 
                                placeholder="e.g. alex@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {fieldErrors.email && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Password *</label>
                            <input 
                                type="password" 
                                placeholder="Create a password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {fieldErrors.password && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.password}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Confirm Password *</label>
                            <input 
                                type="password" 
                                placeholder="Re-enter your password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {fieldErrors.confirmPassword && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.confirmPassword}</span>
                            )}
                        </div>

                        <div style={{ marginTop: "24px" }}>
                            <button type="submit" disabled={loading}>
                                {loading ? "Registering Account..." : "Create Account"}
                            </button>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <p style={{ fontSize: "14px", color: "#64748B" }}>
                                Already registered? <Link to="/login" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <Footer/>       
        </>
    );
}

export default Signup;