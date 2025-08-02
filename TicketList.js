import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { FaTicketAlt, FaClock, FaTags, FaUser, FaCheckCircle } from 'react-icons/fa';

const TicketList = ({ tickets, onTicketClick }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No tickets found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new ticket
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <div
                    key={ticket._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onTicketClick(ticket)}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <FaTicketAlt className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {ticket.subject}
                                </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                {ticket.assignedTo && user.role === 'user' && (
                                    <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        Assigned
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {ticket.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <FaTags className="h-4 w-4" />
                                    <span>{ticket.category.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaClock className="h-4 w-4" />
                                    <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <FaUser className="h-4 w-4" />
                                    <span>{ticket.creator.name}</span>
                                </div>
                                {ticket.assignedTo && (
                                    <div className="flex items-center space-x-2">
                                        <FaCheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{ticket.assignedTo.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const getStatusColor = (status) => {
    const colors = {
        'open': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        'resolved': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        'closed': 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
};

export default TicketList;
