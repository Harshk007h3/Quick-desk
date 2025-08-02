import { useState, useCallback, useEffect } from 'react';
import chatbotService from '../services/chatbotService';

const useChatbot = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const getResponse = useCallback(async (message) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get analytics context
            const analytics = await chatbotService.getAnalytics();
            
            // Get response from chatbot service
            const response = await chatbotService.getResponse(message, analytics);
            
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getFaqTopics = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get analytics context
            const analytics = await chatbotService.getAnalytics();
            
            // Get FAQ topics from chatbot service
            const topics = await chatbotService.getFaqTopics(analytics);
            
            return topics;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getFaqAnswer = useCallback(async (topic) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get analytics context
            const analytics = await chatbotService.getAnalytics();
            
            // Get FAQ answer from chatbot service
            const answer = await chatbotService.getFaqAnswer(topic, analytics);
            
            return answer;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchKnowledgeBase = useCallback(async (query) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get analytics context
            const analytics = await chatbotService.getAnalytics();
            
            // Search knowledge base from chatbot service
            const results = await chatbotService.getKnowledgeBaseSearch(query, analytics);
            
            return results;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        getResponse,
        getFaqTopics,
        getFaqAnswer,
        searchKnowledgeBase
    };
};

export { useChatbot };
