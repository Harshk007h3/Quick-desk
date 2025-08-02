import React, { useState, useEffect } from 'react';
import { FaRobot, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useChatbot } from '../../hooks/useChatbot';
import { useAnalytics } from '../../hooks/useAnalytics';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { getResponse } = useChatbot();
    const { analytics } = useAnalytics();

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            setIsLoading(true);
            
            // Add user message
            setMessages(prev => [...prev, {
                content: input,
                sender: 'user',
                timestamp: new Date()
            }]);

            // Get AI response
            const response = await getResponse(input);
            
            // Add AI message
            setMessages(prev => [...prev, {
                content: response,
                sender: 'bot',
                timestamp: new Date()
            }]);

            setInput('');
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                content: 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initialize with welcome message
        if (isOpen && messages.length === 0) {
            setMessages(prev => [...prev, {
                content: `Hi ${user?.name || 'there'}! I'm here to help with your support questions. Here's a quick overview:
                - Total tickets: ${analytics?.totalTickets || 'N/A'}
                - Open tickets: ${analytics?.openTickets || 'N/A'}
                - Priority distribution: ${analytics?.priorityDistribution?.map(p => `${p.priority}: ${p.percentage}%`).join(', ') || 'N/A'}
                How can I assist you today?`,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [isOpen, user?.name, messages.length, analytics]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={toggleChatbot}
                className="bg-blue-600 dark:bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <FaRobot className="h-6 w-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Support Assistant
                        </h3>
                        <button
                            onClick={toggleChatbot}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <FaRobot className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.sender === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                                        message.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                    }`}
                                >
                                    <p>{message.content}</p>
                                    <div className="text-xs mt-1 flex items-center">
                                        {message.sender === 'bot' && analytics && (
                                            <div className="mr-2">
                                                <span className="text-xs font-medium">Performance: {analytics.performanceScore}%</span>
                                            </div>
                                        )}
                                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center">
                                <FaSpinner className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
