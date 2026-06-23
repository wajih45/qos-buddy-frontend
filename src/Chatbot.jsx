import { useState } from "react";
import "./Chatbot.css";

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Bonjour 👋 Je suis QoS Assistant. Pose-moi une question sur CPU, RAM, latency, anomalies ou alerts.",
        },
    ]);

    const getBotResponse = (text) => {
        const msg = text.toLowerCase();

        if (msg.includes("cpu")) {
            return "Le CPU est surveillé avec une règle QoS. Exemple : si CPU > 80%, une anomalie et une alerte sont créées.";
        }

        if (msg.includes("ram") || msg.includes("memory")) {
            return "La RAM est surveillée. Exemple : si RAM > 85%, le système détecte une anomalie.";
        }

        if (msg.includes("latency") || msg.includes("latence")) {
            return "La latence mesure le temps de réponse. Exemple : si latency > 200 ms, une alerte peut être générée.";
        }

        if (msg.includes("alert") || msg.includes("alerte")) {
            return "Une alerte indique qu’une règle QoS a été dépassée. Elle peut avoir le statut ACTIVE.";
        }

        if (msg.includes("anomaly") || msg.includes("anomalie")) {
            return "Une anomalie est créée quand une métrique dépasse un seuil défini dans les règles QoS.";
        }

        return "Je peux t’aider avec CPU, RAM, latency, anomalies, alerts et règles QoS.";
    };

    const sendMessage = () => {
        if (!message.trim()) return;

        const userMsg = { sender: "user", text: message };
        const botMsg = { sender: "bot", text: getBotResponse(message) };

        setMessages((prev) => [...prev, userMsg, botMsg]);
        setMessage("");
    };

    return (
        <>
            <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
                💬
            </button>

            {open && (
                <div className="chatbot-box">
                    <div className="chatbot-header">
                        <span>QoS Assistant</span>
                        <button onClick={() => setOpen(false)}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Écrire un message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>Envoyer</button>
                    </div>
                </div>
            )}
        </>
    );
}