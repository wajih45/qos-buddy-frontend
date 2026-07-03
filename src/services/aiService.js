import axios from "axios";

const API_URL = "http://localhost:8080/api/ai";

export const getAIStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};