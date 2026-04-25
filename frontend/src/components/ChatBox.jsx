import React, { useState, useRef, useEffect } from 'react';
import useChat from '../../hooks/useChat';
import './ChatBox.css';

/**
 * ChatBox Component
 * Handles user input, displays messages, and shows loader states
 * Integrates with backend topic detection for syllabus gating
 */
const ChatBox = () => {
    const { messages, loading, sendMessage, clearMessages } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inputValue.trim() || loading) {
            return;
        }

        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="chatbox-container">
            {/* Header */}
            <div className="chatbox-header">
                <h2>GCE Chemistry Tutor</h2>
                {messages.length > 0 && (
                    <button
                        onClick={clearMessages}
                        className="clear-button"
                        disabled={loading}
                    >
                        Clear Chat
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="chatbox-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <p>Ask me anything about GCE Chemistry!</p>
                        <p className="hint">I can only answer questions within the official syllabus.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))
                )}

                {/* Loader */}
                {loading && (
                    <div className="loader-container">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p className="loader-text">Analyzing your question...</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="chatbox-input-form">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your chemistry question here..."
                    className="chatbox-input"
                    rows="2"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="chatbox-submit"
                    disabled={loading || !inputValue.trim()}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

/**
 * MessageBubble Component
 * Renders individual chat messages with appropriate styling
 */
const MessageBubble = ({ message }) => {
    const { sender, text, status, topics, isError } = message;

    return (
        <div className={`message-bubble ${sender} ${isError ? 'error' : ''}`}>
            <div className="message-content">
                <p>{text}</p>

                {/* Show matched topics for ambiguous responses */}
                {status === 'ambiguous' && topics && topics.length > 0 && (
                    <div className="topics-list">
                        <p className="topics-header">Possible topics:</p>
                        <ul>
                            {topics.map((topic, idx) => (
                                <li key={idx}>
                                    {topic.topic} (confidence: {Math.round(topic.confidence * 100)}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Show status badge */}
                {status && (
                    <span className={`status-badge ${status}`}>
                        {status === 'out_of_syllabus' && '❌ Out of Syllabus'}
                        {status === 'matched' && '✓ Matched'}
                        {status === 'ambiguous' && '⚠ Ambiguous'}
                    </span>
                )}
            </div>
            <span className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
            </span>
        </div>
    );
};

export default ChatBox;
