import axios from 'axios';
import { auth } from '../firebase';

// ============================================
// 1. AXIOS INSTANCE — TWO CLIENTS
// One for Firebase backend, one for AI backend
// ============================================

// Main app client (Firebase auth protected)
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 120000, // 2 minutes (AI responses take time)
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// 2. REQUEST INTERCEPTOR — Attach Firebase JWT
// ============================================
client.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Error getting auth token:", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// 3. RESPONSE INTERCEPTOR — Handle Errors
// ============================================
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized access:", error);
        }

        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

        const enhancedError = new Error(message);
        enhancedError.status = error.response?.status;
        enhancedError.data = error.response?.data;

        return Promise.reject(enhancedError);
    }
);

// ============================================
// 4. AUTH FUNCTIONS
// ============================================
export const loginUser = async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
};

// ============================================
// 5. DASHBOARD FUNCTIONS
// ============================================
export const getDashboardStats = async () => {
    const response = await client.get('/dashboard/stats');
    return response.data;
};

// ============================================
// 6. TOPICS FUNCTIONS
// ============================================
export const getTopics = async () => {
    const response = await client.get('/topics');
    return response.data;
};

// ============================================
// 7. AI CHAT — Main Function ChatBox Uses
// ============================================
export const askQuestion = async (question, topic = null) => {
    // Calls your FastAPI /rag/generate endpoint
    const response = await client.post('/rag/generate', {
        question: question,
        topic: topic,       // optional topic filter
        top_k: 3,           // number of syllabus chunks to retrieve
        max_tokens: 512,    // max answer length
        temperature: 0.1,   // low = factual answers
        stream: false
    });
    return response.data;
};

// Search without generating answer
export const searchSyllabus = async (query, topic = null) => {
    const response = await client.post('/rag/query', {
        query: query,
        topic: topic,
        top_k: 5
    });
    return response.data;
};

// ============================================
// 8. QUIZ FUNCTIONS
// ============================================
export const getQuizQuestions = async () => {
    const response = await client.get('/quiz/questions');
    return response.data;
};

export const submitQuiz = async (submissionData) => {
    const response = await client.post('/quiz/submit', submissionData);
    return response.data;
};

// ============================================
// 9. HEALTH CHECK — Verify AI is running
// ============================================
export const checkHealth = async () => {
    try {
        const response = await client.get('/health');
        return response.data;
    } catch {
        return { status: 'offline' };
    }
};

export default client;
