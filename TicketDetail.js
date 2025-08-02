import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaTicketAlt, FaClock, FaTags, FaUser, FaCheckCircle, FaThumbsUp, FaThumbsDown, FaComment, FaPaperclip } from 'react-icons/fa';
import { format } from 'date-fns';

const TicketDetail = ({ ticket, onCommentSubmit }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showTimeline, setShowTimeline] = useState(false);

    useEffect(() => {
        // Load attachments
        if (ticket.attachments?.length) {
            setAttachments(ticket.attachments);
        }
    }, [ticket]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await onCommentSubmit({
                content: newComment,
                attachments: attachments
            });
            setNewComment('');
            setAttachments([]);
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachments(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    data: reader.result
                }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVote = async (type) => {
        try {
            // Implement voting logic here
            console.log(`Vote ${type} for ticket ${ticket._id}`);
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FaTicketAlt className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                {ticket.subject}
                            </h2>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
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

            {/* Timeline */}
            {showTimeline && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Timeline
                    </h3>
                    <div className="space-y-4">
                        {ticket.timeline?.map((event, index) => (
                            <div key={index} className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <span className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                        {index + 1}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {event.action}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {event.description}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(event.at), 'MMM d, yyyy HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments */}
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Comments
                </h3>
                <div className="space-y-4">
                    {ticket.comments?.map((comment, index) => (
                        <div key={index} className="flex space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    {comment.user.name[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.user.name}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleVote('upvote')}
                                            className="text-gray-400 hover:text-blue-500"
                                        >
                                            <FaThumbsUp className="h-4 w-4" />
                                            <span className="ml-1">{comment.upvotes?.length || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote('downvote')}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <FaThumbsDown className="h-4 w-4" />
                                            <span className="ml-1">{comment.downvotes?.length || 0}</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {comment.content}
                                </p>
                                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                    {comment.attachments?.length > 0 && (
                                        <span>{comment.attachments.length} attachments</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="mt-6">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button
                                type="button"
                                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <FaPaperclip className="h-4 w-4" />
                                <span>Attach</span>
                            </button>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                multiple
                            />
                            <button
                                type="submit"
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <FaComment className="h-4 w-4" />
                                <span>Comment</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
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

export default TicketDetail;
