import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function EditExpense(){
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [userBudget, setUserBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [originalAmount, setOriginalAmount] = useState(0);

    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (!id) {
            setServerError("No expense ID provided.");
            setLoading(false);
            return;
        }

        // Load user budget
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const budget = user && user.budget ? Number(user.budget) : 0;
        setUserBudget(budget);

        const fetchExpenseDetails = async () => {
            try {
                // Fetch expense being edited
                const response = await axios.get(`http://localhost:5000/api/expenses/${id}`);
                const data = response.data;
                setTitle(data.title || "");
                setCategory(data.category || "");
                setAmount(data.amount || "");
                setDate(data.date || "");
                setOriginalAmount(Number(data.amount) || 0);

                // Fetch all expenses for the user to get total spent
                if (user && user.id) {
                    const allRes = await axios.get(`http://localhost:5000/api/expenses?userId=${user.id}`);
                    const total = allRes.data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    setTotalSpent(total);
                }
            } catch (err) {
                setServerError(err.response?.data?.message || "Failed to load expense details.");
            } finally {
                setLoading(false);
            }
        };

        fetchExpenseDetails();
    }, [id]);

    const validateFrontend = () => {
        const errors = {};

        if (!title.trim()) {
            errors.title = "Title cannot be blank.";
        }

        if (!category) {
            errors.category = "Please select a category.";
        }

        const numAmount = Number(amount);
        if (amount === "" || amount === null || isNaN(numAmount)) {
            errors.amount = "Amount cannot be blank.";
        } else if (numAmount <= 0) {
            errors.amount = "Amount must be greater than 0.";
        } else if (userBudget > 0) {
            // Exclude the original amount of this expense so we only check net new spending
            const spentExcludingThis = totalSpent - originalAmount;
            const remaining = userBudget - spentExcludingThis;
            if (numAmount > remaining) {
                errors.amount = `Amount exceeds your remaining budget of ₹${remaining.toLocaleString('en-IN')} (Budget: ₹${userBudget.toLocaleString('en-IN')}, Spent: ₹${spentExcludingThis.toLocaleString('en-IN')}).`;
            }
        }

        if (!date) {
            errors.date = "Date cannot be blank.";
        } else if (date > todayStr) {
            errors.date = "Future dates are not allowed.";
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

        setSaving(true);

        try {
            const response = await axios.put(`http://localhost:5000/api/expenses/${id}`, {
                title: title.trim(),
                category,
                amount: Number(amount),
                date
            });

            setSuccessMsg(response.data.message || "Expense updated successfully!");
            setTimeout(() => {
                navigate("/viewexpense");
            }, 1200);
        } catch (err) {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            } else {
                setServerError(err.response?.data?.message || "Failed to update expense.");
            }
        } finally {
            setSaving(false);
        }
    };

    return(
        <>
            <Header/>

            <div className="edit-expense-container">
                <div className="edit-expense-box">
                    <h2><i className="fa-solid fa-pen-to-square" style={{ color: "#10B981" }}></i> Edit Expense</h2>

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

                    {loading ? (
                        <p className="no-data">Loading expense details...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-custom">
                                <label>Expense Title *</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Expense Title" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                {fieldErrors.title && (
                                    <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.title}</span>
                                )}
                            </div>

                            <div className="form-group-custom">
                                <label>Category *</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {fieldErrors.category && (
                                    <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.category}</span>
                                )}
                            </div>

                            <div className="form-group-custom">
                                <label>Amount (₹) *</label>
                                <input 
                                    type="number" 
                                    placeholder="Enter Amount in ₹" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                {fieldErrors.amount && (
                                    <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.amount}</span>
                                )}
                            </div>

                            <div className="form-group-custom">
                                <label>Date *</label>
                                <input 
                                    type="date" 
                                    value={date}
                                    max={todayStr}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                {fieldErrors.date && (
                                    <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.date}</span>
                                )}
                            </div>

                            <div style={{ marginTop: "24px" }}>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                >
                                    {saving ? "Updating Expense..." : "Update Expense"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <Footer/>
        </>
    );
}

export default EditExpense;