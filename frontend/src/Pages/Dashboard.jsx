import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../App.css";

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState(0);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState("");
    const [budgetError, setBudgetError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const getCategoryClass = (category) => {
        const cat = (category || "").toLowerCase();
        if (cat === "food") return "cat-food";
        if (cat === "transport") return "cat-transport";
        if (cat === "shopping") return "cat-shopping";
        if (cat === "medical") return "cat-medical";
        if (cat === "education") return "cat-education";
        if (cat === "entertainment") return "cat-entertainment";
        if (cat === "bills") return "cat-bills";
        return "cat-other";
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const savedBudget = user && user.budget !== undefined && user.budget !== null ? Number(user.budget) : 0;
                setBudget(savedBudget);
                setNewBudget(savedBudget.toString());

                const url = user && user.id
                    ? `http://localhost:5000/api/expenses?userId=${user.id}`
                    : "http://localhost:5000/api/expenses";

                const response = await axios.get(url);
                setExpenses(response.data);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        setBudgetError("");

        const num = Number(newBudget);
        if (newBudget === "" || newBudget === null || isNaN(num)) {
            setBudgetError("Budget cannot be empty.");
            return;
        }
        if (num <= 0) {
            setBudgetError("Budget must be greater than 0.");
            return;
        }

        try {
            const response = await axios.put("http://localhost:5000/api/user/budget", {
                userId: user ? user.id : null,
                budget: num
            });

            setBudget(response.data.budget);
            setIsEditingBudget(false);

            if (user) {
                const updatedUser = { ...user, budget: response.data.budget };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (err) {
            setBudgetError(err.response?.data?.message || "Failed to update budget.");
        }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remainingBalance = budget - totalExpenses;
    const isBudgetExceeded = totalExpenses > budget && totalExpenses > 0;
    const recentExpenses = expenses.slice(0, 5);

    return (
        <>
            <Header />

            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Dashboard Overview</h2>
                </div>

                {isBudgetExceeded && (
                    <div className="budget-warning-banner">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>Budget Exceeded! Expenses exceed monthly budget by ₹{Math.abs(remainingBalance).toLocaleString('en-IN')}</span>
                    </div>
                )}

                <div className="dashboard-cards">
                    {/* Total Budget Card */}
                    <div className="dashboard-card">
                        <div className="card-icon-wrapper icon-budget">
                            <i className="fa-solid fa-wallet"></i>
                        </div>

                        <button
                            className="edit-budget-btn"
                            onClick={() => {
                                setIsEditingBudget(!isEditingBudget);
                                setBudgetError("");
                            }}
                        >
                            <i className="fa-solid fa-pen"></i> {isEditingBudget ? "Cancel" : "Edit"}
                        </button>

                        <h3>Total Budget</h3>
                        <p>₹{budget.toLocaleString('en-IN')}</p>

                        {isEditingBudget && (
                            <form onSubmit={handleSaveBudget} className="budget-edit-box">
                                <input
                                    type="number"
                                    placeholder="New Budget (₹)"
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn-primary">
                                    Save
                                </button>
                            </form>
                        )}
                        {budgetError && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {budgetError}</span>}
                    </div>

                    {/* Total Expenses Card */}
                    <div className="dashboard-card">
                        <div className="card-icon-wrapper icon-expense">
                            <i className="fa-solid fa-money-bill-trend-up"></i>
                        </div>
                        <h3>Total Expenses</h3>
                        <p>₹{totalExpenses.toLocaleString('en-IN')}</p>
                    </div>

                    {/* Remaining Balance Card */}
                    <div className="dashboard-card">
                        <div className={`card-icon-wrapper icon-balance ${isBudgetExceeded ? "exceeded" : ""}`}>
                            <i className="fa-solid fa-piggy-bank"></i>
                        </div>
                        <h3>Remaining Balance</h3>
                        <p className={isBudgetExceeded ? "exceeded" : ""}>
                            ₹{remainingBalance.toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* Total Records Card */}
                    <div className="dashboard-card">
                        <div className="card-icon-wrapper icon-records">
                            <i className="fa-solid fa-receipt"></i>
                        </div>
                        <h3>Total Records</h3>
                        <p>{expenses.length}</p>
                    </div>
                </div>

                <div className="quick-actions">
                    <button onClick={() => navigate("/addexpense")}>
                        <i className="fa-solid fa-circle-plus"></i> Add New Expense
                    </button>
                    <button onClick={() => navigate("/viewexpense")}>
                        <i className="fa-solid fa-table-list"></i> View All Expenses
                    </button>
                </div>

                <div className="recent-table">
                    <h2>Recent Transactions</h2>

                    {loading ? (
                        <p className="no-data">Loading recent transactions...</p>
                    ) : recentExpenses.length === 0 ? (
                        <p className="no-data">No Expenses Found</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Amount (₹)</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentExpenses.map((exp) => (
                                    <tr key={exp._id}>
                                        <td style={{ fontWeight: 600 }}>{exp.title}</td>
                                        <td>
                                            <span className={`badge-category ${getCategoryClass(exp.category)}`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: "#0F172A" }}>
                                            ₹{Number(exp.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td>{exp.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Dashboard;