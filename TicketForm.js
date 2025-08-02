import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaTicketAlt, FaTags, FaClock, FaUser, FaPaperclip, FaCheckCircle } from 'react-icons/fa';
import { useEmojiPicker } from '../../hooks/useEmojiPicker';

const TicketForm = ({ onSubmit, categories, initialData }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        subject: initialData?.subject || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        priority: initialData?.priority || 'medium',
        attachments: initialData?.attachments || []
    });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { onEmojiClick } = useEmojiPicker();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.description.trim() || !form.category) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await onSubmit(form);
            setForm({
                subject: '',
                description: '',
                category: '',
                priority: 'medium',
                attachments: []
            });
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to create ticket. Please try again.');
        }
    };

    const handleFileUpload = (e) => {
        const files = e.target.files;
        const newAttachments = [...form.attachments];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onloadend = () => {
                newAttachments.push({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
                setForm(prev => ({
                    ...prev,
                    attachments: newAttachments
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiClick = (emoji) => {
        setForm(prev => ({
            ...prev,
            description: prev.description + emoji
        }));
        setShowEmojiPicker(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                    {/* Subject */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Subject
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="subject"
                                value={form.subject}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    subject: e.target.value
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <div className="mt-1 relative">
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="4"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="absolute bottom-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                            >
                                😊
                            </button>
                        </div>
                        {showEmojiPicker && (
                            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                                <div className="grid grid-cols-6 gap-2 p-2">
                                    {['😊', '😂', '🤔', '😢', '😍', '🥰', '🤔', '😎', '🎉', '🔥'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <div className="mt-1">
                            <select
                                id="category"
                                value={form.category}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    category: e.target.value
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Priority
                        </label>
                        <div className="mt-1">
                            <select
                                id="priority"
                                value={form.priority}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    priority: e.target.value
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attachments
                        </label>
                        <div className="mt-1 flex justify-between items-center">
                            <input
                                type="file"
                                id="attachments"
                                multiple
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                            />
                            {form.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {form.attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                                        >
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FaTicketAlt className="h-5 w-5 mr-2" />
                            Create Ticket
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default TicketForm;
