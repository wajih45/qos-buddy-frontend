import { useEffect, useState } from "react";
import Chatbot from "./Chatbot";
import {
    getMetrics,
    getRules,
    getAnomalies,
    getAlerts,
    createMetric,
    loginUser,
    registerUser,
    forgotPassword,
    resetPassword,
} from "./services/api";
import "./App.css";

function App() {
    const [alertSearch, setAlertSearch] = useState("");
    const [alertStatusFilter, setAlertStatusFilter] = useState("ALL");
    const [metrics, setMetrics] = useState([]);
    const [rules, setRules] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const [metricType, setMetricType] = useState("CPU");
    const [metricValue, setMetricValue] = useState("");
    const [metricSource, setMetricSource] = useState("frontend-test");

    const [currentUser, setCurrentUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [forgotMode, setForgotMode] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [authError, setAuthError] = useState("");
    const [metricSearch, setMetricSearch] = useState("");
    const [anomalySearch, setAnomalySearch] = useState("");
    const [anomalySeverityFilter, setAnomalySeverityFilter] = useState("ALL");

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    const loadData = () => {
        getMetrics().then(setMetrics);
        getRules().then(setRules);
        getAnomalies().then(setAnomalies);
        getAlerts().then(setAlerts);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setAuthError("");

            const user = await loginUser({
                email: loginEmail,
                password: loginPassword,
            });

            setCurrentUser(user);
        } catch (error) {
            setAuthError("Invalid email or password");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            setAuthError("");

            const user = await registerUser({
                username: registerUsername,
                email: registerEmail,
                password: registerPassword,
                role: "ADMIN",
            });

            setCurrentUser(user);
        } catch (error) {
            setAuthError("Registration failed. Email may already exist.");
        }
    };
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        try {
            setAuthError("");
            const code = await forgotPassword(resetEmail);
            setGeneratedCode(code);
        } catch (error) {
            setAuthError("Email not found");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        try {
            setAuthError("");

            await resetPassword({
                email: resetEmail,
                code: resetCode,
                newPassword: newPassword,
            });

            alert("Password updated successfully");
            setForgotMode(false);
            setAuthMode("login");
            setLoginEmail(resetEmail);
            setLoginPassword("");
        } catch (error) {
            setAuthError("Invalid code");
        }
    };
    const handleLogout = () => {
        setCurrentUser(null);
        setLoginEmail("");
        setLoginPassword("");
        setAuthMode("login");
    };

    const handleSubmitMetric = async (e) => {
        e.preventDefault();

        const metric = {
            type: metricType,
            value: Number(metricValue),
            source: metricSource,
        };

        await createMetric(metric);

        setMetricValue("");
        setMetricSource("frontend-test");

        loadData();
    };
    const filteredMetrics = metrics.filter((metric) => {
        const search = metricSearch.trim().toLowerCase();

        if (search === "") {
            return true;
        }

        return (
            String(metric.id ?? "") === search ||
            String(metric.type ?? "").toLowerCase().includes(search) ||
            String(metric.value ?? "").toLowerCase().includes(search) ||
            String(metric.source ?? "").toLowerCase().includes(search)
        );
    });
    const filteredAnomalies = anomalies.filter((anomaly) => {
        const search = anomalySearch.trim().toLowerCase();

        const matchesSearch =
            search === "" ||
            String(anomaly.id ?? "") === search ||
            String(anomaly.severity ?? "").toLowerCase().includes(search) ||
            String(anomaly.description ?? "").toLowerCase().includes(search);

        const matchesSeverity =
            anomalySeverityFilter === "ALL" ||
            anomaly.severity === anomalySeverityFilter;

        return matchesSearch && matchesSeverity;
    });
    const filteredAlerts = alerts.filter((alert) => {
        const search = alertSearch.trim().toLowerCase();

        if (search === "") {
            return alertStatusFilter === "ALL" || alert.status === alertStatusFilter;
        }

        const isNumberSearch = /^\d+$/.test(search);

        const matchesSearch = isNumberSearch
            ? String(alert.id ?? "") === search
            : (
                String(alert.message ?? "").toLowerCase().includes(search) ||
                String(alert.status ?? "").toLowerCase().includes(search) ||
                String(alert.anomaly?.severity ?? "").toLowerCase().includes(search)
            );

        const matchesStatus =
            alertStatusFilter === "ALL" ||
            alert.status === alertStatusFilter;

        return matchesSearch && matchesStatus;
    });
    const cpuMetrics = metrics.filter((metric) => metric.type === "CPU");
    const ramMetrics = metrics.filter((metric) => metric.type === "RAM");
    const latencyMetrics = metrics.filter((metric) => metric.type === "LATENCY");

    const average = (items) => {
        if (items.length === 0) return 0;

        const sum = items.reduce(
            (total, item) => total + Number(item.value || 0),
            0
        );

        return (sum / items.length).toFixed(2);
    };

    const averageCpu = average(cpuMetrics);
    const averageRam = average(ramMetrics);
    const averageLatency = average(latencyMetrics);

    const highAnomalies = anomalies.filter(
        (anomaly) => anomaly.severity === "HIGH"
    ).length;

    const activeAlerts = alerts.filter(
        (alert) => alert.status === "ACTIVE"
    ).length;
    if (!currentUser) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h1>QoS Buddy</h1>
                    <p className="subtitle">Smart QoS Monitoring Platform</p>

                    <div className="auth-tabs">
                        <button
                            className={authMode === "login" ? "active-tab" : ""}
                            onClick={() => setAuthMode("login")}
                        >
                            Login
                        </button>

                        <button
                            className={authMode === "register" ? "active-tab" : ""}
                            onClick={() => setAuthMode("register")}
                        >
                            Register
                        </button>
                    </div>

                    {authError && <p className="auth-error">{authError}</p>}

                    {authMode === "login" && !forgotMode ? (
                        <form className="auth-form" onSubmit={handleLogin}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="admin@qos.com"
                                required
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="admin123"
                                required
                            />

                            <button type="submit">Login</button>

                            <p
                                style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                    color: "#2563eb",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setForgotMode(true);
                                    setResetEmail(loginEmail);
                                    setGeneratedCode("");
                                    setAuthError("");
                                }}
                            >
                                Forgot Password?
                            </p>
                        </form>
                    ) : authMode === "login" && forgotMode ? (
                        <div>
                            <form className="auth-form" onSubmit={handleForgotPassword}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />

                                <button type="submit">Generate Reset Code</button>
                            </form>

                            {generatedCode && (
                                <p style={{ color: "green", textAlign: "center" }}>
                                    Reset code: <strong>{generatedCode}</strong>
                                </p>
                            )}

                            <form className="auth-form" onSubmit={handleResetPassword}>
                                <label>Reset Code</label>
                                <input
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    placeholder="Enter reset code"
                                    required
                                />

                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                    required
                                />

                                <button type="submit">Reset Password</button>
                            </form>

                            <p
                                style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                    color: "#2563eb",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setForgotMode(false);
                                    setAuthError("");
                                }}
                            >
                                Back to Login
                            </p>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleRegister}>
                            <label>Username</label>
                            <input
                                type="text"
                                value={registerUsername}
                                onChange={(e) => setRegisterUsername(e.target.value)}
                                placeholder="admin"
                                required
                            />

                            <label>Email</label>
                            <input
                                type="email"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                placeholder="admin@qos.com"
                                required
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="admin123"
                                required
                            />

                            <button type="submit">Create Account</button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="logo-icon">Q</span>
                    <div>
                        <h2>QoS Buddy</h2>
                        <p>Monitoring AI</p>
                    </div>
                    <Chatbot />
                </div>

                <nav className="sidebar-menu">
                    <a href="#overview" className="active">
                        Dashboard
                    </a>
                    <a href="#send-metric">Send Metric</a>
                    <a href="#rules">QoS Rules</a>
                    <a href="#metrics">Metrics</a>
                    <a href="#anomalies">Anomalies</a>
                    <a href="#alerts">Alerts</a>
                </nav>

                <div className="sidebar-footer">
                    <span className="status-dot"></span>
                    Backend Online
                </div>
            </aside>

            <main className="app">
                <div className="topbar">
                    <div>
                        <strong>QoS Buddy</strong>
                        <span>Network Monitoring Console</span>
                    </div>

                    <div className="user-box">
            <span>
              {currentUser.username} ({currentUser.role})
            </span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <section id="overview">
                    <h1>QoS Monitoring Dashboard</h1>
                    <p className="subtitle">
                        Real-time supervision of metrics, anomalies and alerts
                    </p>

                    <div className="cards">
                        <div className="card">
                            <h2>{metrics.length}</h2>
                            <p>Metrics</p>
                        </div>
                        <div className="card">
                            <h2>{averageCpu}</h2>
                            <p>Avg CPU</p>
                        </div>

                        <div className="card">
                            <h2>{averageRam}</h2>
                            <p>Avg RAM</p>
                        </div>

                        <div className="card">
                            <h2>{highAnomalies}</h2>
                            <p>HIGH Anomalies</p>
                        </div>

                        <div className="card">
                            <h2>{activeAlerts}</h2>
                            <p>Active Alerts</p>
                        </div>

                        <div className="card">
                            <h2>{rules.length}</h2>
                            <p>QoS Rules</p>
                        </div>

                        <div className="card">
                            <h2>{anomalies.length}</h2>
                            <p>Anomalies</p>
                        </div>

                        <div className="card">
                            <h2>{alerts.length}</h2>
                            <p>Alerts</p>
                        </div>
                    </div>

                    <button className="refresh-btn" onClick={loadData}>
                        Refresh Data
                    </button>
                </section>

                <section className="section" id="send-metric">
                    <h2>Send New Metric</h2>

                    <form className="metric-form" onSubmit={handleSubmitMetric}>
                        <div className="form-group">
                            <label>Metric Type</label>
                            <select
                                value={metricType}
                                onChange={(e) => setMetricType(e.target.value)}
                            >
                                <option value="CPU">CPU</option>
                                <option value="RAM">RAM</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Value</label>
                            <input
                                type="number"
                                value={metricValue}
                                onChange={(e) => setMetricValue(e.target.value)}
                                placeholder="Example: 95"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Source</label>
                            <input
                                type="text"
                                value={metricSource}
                                onChange={(e) => setMetricSource(e.target.value)}
                                placeholder="Example: server-1"
                                required
                            />
                        </div>

                        <button className="submit-btn" type="submit">
                            Send Metric
                        </button>
                    </form>
                </section>

                <section className="section" id="rules">
                    <h2>QoS Rules</h2>

                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Metric Type</th>
                            <th>Condition</th>
                            <th>Threshold</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rules.map((rule) => (
                            <tr key={rule.id}>
                                <td>{rule.id}</td>
                                <td>{rule.metricType}</td>
                                <td>{rule.condition}</td>
                                <td>{rule.threshold}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <section className="section" id="metrics">
                    <h2>Metrics</h2>

                    <input
                        type="text"
                        placeholder="Search by type, value or source..."
                        value={metricSearch}
                        onChange={(e) => setMetricSearch(e.target.value)}
                        className="search-input"
                    />

                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Source</th>
                            <th>Timestamp</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredMetrics.map((metric) => (
                            <tr key={metric.id}>
                                <td>{metric.id}</td>
                                <td>{metric.type}</td>
                                <td>{metric.value}</td>
                                <td>{metric.source}</td>
                                <td>{metric.timestamp}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <section className="section" id="anomalies">
                    <h2>Anomalies</h2>
                    <div className="filters-row">
                        <input
                            type="text"
                            placeholder="Search anomaly by id, severity or description..."
                            value={anomalySearch}
                            onChange={(e) => setAnomalySearch(e.target.value)}
                            className="search-input"
                        />

                        <select
                            value={anomalySeverityFilter}
                            onChange={(e) => setAnomalySeverityFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ALL">All severities</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Severity</th>
                            <th>Description</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAnomalies.map((anomaly) => (
                            <tr key={anomaly.id}>
                                <td>{anomaly.id}</td>
                                <td>
                    <span
                        className={
                            anomaly.severity === "HIGH"
                                ? "badge high"
                                : "badge medium"
                        }
                    >
                      {anomaly.severity}
                    </span>
                                </td>
                                <td>{anomaly.description}</td>
                                <td>{anomaly.date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <section className="section" id="alerts">
                    <h2>Alerts</h2>

                    <div className="filters-row">
                        <input
                            type="text"
                            placeholder="Search alert by id, message, status or severity..."
                            value={alertSearch}
                            onChange={(e) => setAlertSearch(e.target.value)}
                            className="search-input"
                        />

                        <select
                            value={alertStatusFilter}
                            onChange={(e) => setAlertStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ALL">All status</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="RESOLVED">RESOLVED</option>
                        </select>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Anomaly Severity</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAlerts.map((alert) => (
                            <tr key={alert.id}>
                                <td>{alert.id}</td>
                                <td>{alert.message}</td>
                                <td>{alert.status}</td>
                                <td>{alert.date}</td>
                                <td>{alert.anomaly?.severity}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
}

export default App;