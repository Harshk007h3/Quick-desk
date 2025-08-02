import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardNavigation = () => {
    const { user } = useAuth();

    const navigation = {
        user: [
            { name: 'My Tickets', href: '/dashboard/user', icon: 'ticket' },
            { name: 'Create Ticket', href: '/dashboard/create', icon: 'plus' },
            { name: 'Notifications', href: '/dashboard/notifications', icon: 'bell' }
        ],
        agent: [
            { name: 'Assigned Tickets', href: '/dashboard/agent/assigned', icon: 'ticket' },
            { name: 'All Tickets', href: '/dashboard/agent/all', icon: 'tickets' },
            { name: 'My Stats', href: '/dashboard/agent/stats', icon: 'chart' }
        ],
        admin: [
            { name: 'Users', href: '/dashboard/admin/users', icon: 'users' },
            { name: 'Categories', href: '/dashboard/admin/categories', icon: 'folder' },
            { name: 'Analytics', href: '/dashboard/admin/analytics', icon: 'analytics' },
            { name: 'Settings', href: '/dashboard/admin/settings', icon: 'settings' }
        ]
    };

    return (
        <nav className="bg-gray-800 dark:bg-gray-900" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-xl font-bold text-white">
                                QuickDesk
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation[user.role]?.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-300 hover:border-gray-700 hover:text-white"
                                >
                                    <span className={`mr-2 h-5 w-5 ${getIconClass(item.icon)}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const getIconClass = (icon) => {
    const icons = {
        ticket: 'fas fa-ticket-alt',
        plus: 'fas fa-plus',
        bell: 'fas fa-bell',
        tickets: 'fas fa-tickets',
        chart: 'fas fa-chart-bar',
        users: 'fas fa-users',
        folder: 'fas fa-folder',
        analytics: 'fas fa-chart-line',
        settings: 'fas fa-cog'
    };
    return icons[icon] || 'fas fa-circle';
};

export default DashboardNavigation;
