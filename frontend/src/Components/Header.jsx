import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="header">
            <Link to="/" className="brand-logo">
                <i className="fa-solid fa-wallet"></i>
                <h3>Expense Tracker</h3>
            </Link>

            <div className="nav-items">
                {user ? (
                    <>
                        <Link to="/" className={isActive("/") ? "active" : ""}>
                            <i className="fa-solid fa-chart-pie"></i> Dashboard
                        </Link>
                        <Link to="/viewexpense" className={isActive("/viewexpense") ? "active" : ""}>
                            <i className="fa-solid fa-list-check"></i> View Expenses
                        </Link>
                        <Link to="/addexpense" className={isActive("/addexpense") ? "active" : ""}>
                            <i className="fa-solid fa-plus"></i> Add Expense
                        </Link>

                        <div className="user-badge">
                            <div className="user-avatar-circle">
                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span>{user.name}</span>
                        </div>

                        <button className="logout-btn" onClick={handleLogout} title="Logout">
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={isActive("/login") ? "active" : ""}>
                            <i className="fa-solid fa-right-to-bracket"></i> Login
                        </Link>
                        <Link to="/signup" className={isActive("/signup") ? "active" : ""}>
                            <i className="fa-solid fa-user-plus"></i> Signup
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;