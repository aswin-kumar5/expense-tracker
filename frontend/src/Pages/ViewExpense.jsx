import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Medical",
    "Education",
    "Entertainment",
    "Bills",
    "Other"
];

function ViewExpense(){
    const [expenses, setExpenses] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
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

    const fetchExpenses = async (selectedCategory = "") => {
        setLoading(true);
        setServerError("");
        try {
            const queryParams = new URLSearchParams();
            if (user && user.id) {
                queryParams.append("userId", user.id);
            }
            if (selectedCategory) {
                queryParams.append("category", selectedCategory);
            }

            const queryString = queryParams.toString();
            const url = queryString 
                ? `http://localhost:5000/api/expenses?${queryString}`
                : "http://localhost:5000/api/expenses";

            const response = await axios.get(url);
            setExpenses(response.data);
        } catch (err) {
            setServerError("Failed to load expenses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilter = () => {
        fetchExpenses(categoryFilter);
    };

    const handleDelete = async (id, title) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
        if (!confirmed) return;

        setSuccessMsg("");
        setServerError("");

        try {
            const response = await axios.delete(`http://localhost:5000/api/expenses/${id}`);
            setSuccessMsg(response.data.message || "Expense deleted successfully!");
            setExpenses(expenses.filter(item => item._id !== id));
            
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to delete expense.");
        }
    };

    return(
        <>
            <Header/>

            <div className="view-expense-page">
                <div className="page-header">
                    <h2>Manage Expenses</h2>
                </div>

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

                <div className="view-expense-card">
                    <div className="card-top-bar">
                        <h3>Expense Records</h3>

                        <div className="filter-section">
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <button onClick={handleFilter}>
                                <i className="fa-solid fa-filter"></i> Filter
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="no-data">Loading expenses list...</p>
                    ) : (
                        <table className="full-width-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Amount (₹)</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-data">No Expenses Found</td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense._id}>
                                            <td style={{ fontWeight: 600 }}>{expense.title}</td>
                                            <td>
                                                <span className={`badge-category ${getCategoryClass(expense.category)}`}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: "#0F172A" }}>
                                                ₹{Number(expense.amount).toLocaleString('en-IN')}
                                            </td>
                                            <td>{expense.date}</td>
                                            <td className="btns">
                                                <button 
                                                    className="edit"
                                                    onClick={() => navigate(`/editexpense/${expense._id}`)}
                                                    title="Edit Expense"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                                </button>
                                                <button 
                                                    className="delete"
                                                    onClick={() => handleDelete(expense._id, expense.title)}
                                                    title="Delete Expense"
                                                >
                                                    <i className="fa-solid fa-trash"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Footer/>      
        </>
    );
}

export default ViewExpense;