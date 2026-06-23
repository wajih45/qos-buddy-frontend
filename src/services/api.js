const BASE_URL = "http://localhost:8080";

export async function getMetrics() {
    const response = await fetch(`${BASE_URL}/metrics`);
    return response.json();
}

export async function getRules() {
    const response = await fetch(`${BASE_URL}/qos-rules`);
    return response.json();
}

export async function getAnomalies() {
    const response = await fetch(`${BASE_URL}/anomalies`);
    return response.json();
}

export async function getAlerts() {
    const response = await fetch(`${BASE_URL}/alerts`);
    return response.json();
}

export async function createMetric(metric) {
    const response = await fetch(`${BASE_URL}/metrics`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(metric),
    });

    return response.json();
}
export async function loginUser(credentials) {
    const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error("Invalid email or password");
    }

    return response.json();
}

export async function registerUser(user) {
    const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
}
export const forgotPassword = async (email) => {
    const response = await fetch(
        `http://localhost:8080/users/forgot-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
    );

    if (!response.ok) throw new Error("Email not found");
    return response.text();
};

export const resetPassword = async ({ email, code, newPassword }) => {
    const response = await fetch(
        `http://localhost:8080/users/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(newPassword)}`,
        { method: "POST" }
    );

    if (!response.ok) throw new Error("Reset failed");
    return response.text();
};