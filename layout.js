import React from 'react';
import DashboardHeader from './header';
import DashboardNavigation from './navigation';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <div className="min-h-screen bg-gray-100 dark:bg-gray-900">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <DashboardHeader />
            <DashboardNavigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
