import { useState } from 'react';
import { askQuestion } from '../api/client';

/**
 * Custom hook for managing chat state and interactions
 * Handles message history, loading states, and API communication
 */
export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Send a question to the backend
     * @param {string} question - User's question
     */
    const sendMessage = async (question) => {
        if (!question || !question.trim()) {
            return;
        }

        // Add user message to chat
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: question,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            // Call backend API
            const response = await askQuestion(question);

            // Handle response based on status
            handleApiResponse(response);

        } catch (err) {
            // Network or server error
            const errorMessage = {
                id: Date.now() + 1,
                sender: 'system',
                text: err.message || 'Failed to connect to server. Please try again.',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
            setError(err.message);
            setLoading(false);
        }
    };

    /**
     * Handle API response based on status
     * @param {object} data - API response data
     */
    const handleApiResponse = (data) => {
        const systemMessage = {
            id: Date.now() + 1,
            sender: 'system',
            text: data.explanation || data.message || 'Processing your question...',
            timestamp: new Date().toISOString(),
            status: data.status,
            topics: data.matched_topics || []
        };

        setMessages(prev => [...prev, systemMessage]);

        // Control loader based on status
        switch (data.status) {
            case 'out_of_syllabus':
                // Question rejected - stop loader immediately
                setLoading(false);
                break;

            case 'matched':
                // Clear match - in production, loader continues until LLM response
                // For now, we stop it since there's no LLM integration yet
                setLoading(false);
                break;

            case 'ambiguous':
                // Ambiguous match - show topics and stop loader
                setLoading(false);
                break;

            default:
                // Unknown status
                setLoading(false);
        }
    };

    /**
     * Clear all messages
     */
    const clearMessages = () => {
        setMessages([]);
        setError(null);
        setLoading(false);
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearMessages
    };
};

export default useChat;
