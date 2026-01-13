import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login({ setUser }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        console.log(e.target.value)
    }

    const handleSubmit= async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://admin-dashboard-pmr8.onrender.com/api/auth/login", {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const {token, user} = await response.json();
            console.log(response);

            setUser(user);

            
            localStorage.setItem("token", token);
            console.log(localStorage.getItem("token"));
            localStorage.setItem("user", JSON.stringify(user));
            console.log(localStorage.getItem("user"));


            if (user.role === "ADMIN") {
                navigate("/admin-dashboard");
            } else if (user.role === "OWNER") {
                navigate("/owner-dashboard")
            } else {
                navigate('/dashboard');
            }
            
        } catch (err) {
            console.error(err);
            setError("Invalid Email and Password");
        }
    }

    return (
        <div 
            className="d-flex justify-content-center align-items-center min-vh-100" 
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
        >
            <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
                <h3 className="text-center mb-4 fs-2 fw-bold text-primary">Login</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-12">
                        <label htmlFor="email" className="form-label fw-semibold">Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            name="email"
                            placeholder="Enter your email" 
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-12">
                        <label htmlFor="password" className="form-label fw-semibold">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="password"
                            name="password" 
                            placeholder="Enter your password" 
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-12 text-center">
                        <button type="submit" className="btn btn-primary w-100">
                            Login
                        </button>
                    </div>
                </form>
                <p className="text-center mt-3 mb-0">
                    <small>Don’t have an account? <Link to="/register" className="text-decoration-none fw-bolder">Sign up</Link></small>
                </p>
            </div>
        </div>
    );
}

export default Login;
