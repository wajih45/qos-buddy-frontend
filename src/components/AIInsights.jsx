import { useEffect, useState } from "react";
import { getAIStats } from "../services/aiService";

function AIInsights() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getAIStats();
            setStats(data);
        } catch (error) {
            console.error("Erreur lors du chargement des stats IA :", error);
        }
    };

    if (!stats) {
        return <p>Chargement...</p>;
    }

    const riskScore = Math.min(stats.highAnomalies * 10, 100);

    const riskColor =
        riskScore >= 70
            ? "#ef4444"
            : riskScore >= 30
                ? "#f59e0b"
                : "#22c55e";

    return (
        <div className="ai-card">
            <h2>🤖 AI Insights</h2>

            <p>
                <strong>Model :</strong> {stats.model}
            </p>

            <p>
                <strong>Total anomalies :</strong>{" "}
                {stats.totalAnomalies}
            </p>

            <p>
                <strong>Status :</strong>{" "}
                <span style={{ color: riskColor }}>
          {stats.highAnomalies > 0
              ? "🔴 Anomalies Detected"
              : "🟢 System Healthy"}
        </span>
            </p>

            <div className="risk-badge">
                Risk Score : {riskScore}%
            </div>
            <button
                className="ai-button"
                onClick={() => {
                    alert(
                        `Model : ${stats.model}
Total anomalies : ${stats.totalAnomalies}
High anomalies : ${stats.highAnomalies}
Risk Score : ${riskScore}%`
                    );
                }}
            >
                🤖 Analyser avec l'IA
            </button>
            <div className="risk-bar">
                <div
                    className="risk-fill"
                    style={{
                        width: `${riskScore}%`,
                        background: riskColor,
                    }}
                ></div>
            </div>

            <p>
                <strong>Recommendation :</strong>
                <br />
                {stats.highAnomalies > 0
                    ? "Check server load, running processes and system resources."
                    : "No action required. System operating normally."}
            </p>

            <p>
                <strong>High anomalies :</strong>{" "}
                {stats.highAnomalies}
            </p>
            <p style={{ opacity: 0.8 }}>
                Intelligent anomaly detection using Isolation Forest
            </p>
            <p className="last-update">
                Last update : {new Date().toLocaleString()}
            </p>
        </div>
    );
}

export default AIInsights;