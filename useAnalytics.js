import { useState, useEffect } from 'react';
import { getAnalytics, getPriorityDistribution, getPerformanceAnalytics } from '../services/analyticsService';

const useAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all analytics data
            const [generalAnalytics, priorityDist, performance] = await Promise.all([
                getAnalytics(),
                getPriorityDistribution(),
                getPerformanceAnalytics()
            ]);

            // Combine analytics data
            const combinedAnalytics = {
                ...generalAnalytics,
                priorityDistribution: priorityDist,
                ...performance
            };

            setAnalytics(combinedAnalytics);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchAnalytics();

        // Set up interval for periodic updates
        const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds

        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, []);

    return {
        analytics,
        loading,
        error,
        refresh: fetchAnalytics
    };
};

export { useAnalytics };
