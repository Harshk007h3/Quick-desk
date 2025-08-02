// Ticket detail functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    let isDark = localStorage.getItem('theme') === 'dark';

    // Set initial theme
    if (isDark) {
        body.classList.add('dark');
        themeToggle.innerHTML = `
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
            </svg>
        `;
    } else {
        body.classList.remove('dark');
        themeToggle.innerHTML = `
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        `;
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        isDark = !isDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        body.classList.toggle('dark');
        
        // Update icon
        if (isDark) {
            themeToggle.innerHTML = `
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
                </svg>
            `;
        } else {
            themeToggle.innerHTML = `
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            `;
        }
    });

    // Profile dropdown functionality
    const profileBtn = document.getElementById('profile');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const profileDropdown = document.getElementById('profileDropdown');

    // Toggle dropdown on profile button click
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function() {
        profileDropdownMenu.classList.add('hidden');
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Clear any authentication state
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('isOfflineMode');
        // Redirect to login page
        window.location.href = 'index.html';
    });

    // Load ticket details
    loadTicketDetails();
});

// Load ticket details
async function loadTicketDetails() {
    try {
        const ticketId = localStorage.getItem('viewingTicketId');
        if (!ticketId) {
            showError('No ticket ID found');
            return;
        }

        const authToken = localStorage.getItem('authToken');
        const isOfflineMode = localStorage.getItem('isOfflineMode') === 'true';
        
        let ticket = null;
        
        if (!isOfflineMode && authToken) {
            // Try to load from backend
            try {
                const response = await fetch(`/api/tickets/${ticketId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (response.ok) {
                    ticket = await response.json();
                } else {
                    throw new Error('Backend not available');
                }
            } catch (error) {
                console.log('Backend not available, loading offline ticket');
                // Fall back to offline tickets
                const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
                ticket = tickets.find(t => t.id === ticketId);
            }
        } else {
            // Load offline ticket
            const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
            ticket = tickets.find(t => t.id === ticketId);
        }
        
        if (!ticket) {
            showError('Ticket not found');
            return;
        }
        
        renderTicketDetails(ticket);
        
    } catch (error) {
        console.error('Error loading ticket details:', error);
        showError('Failed to load ticket details');
    }
}

// Render ticket details
function renderTicketDetails(ticket) {
    const ticketDetails = document.getElementById('ticketDetails');
    if (!ticketDetails) return;
    
    const statusColor = getStatusColor(ticket.status);
    const priorityColor = getPriorityColor(ticket.priority);
    
    ticketDetails.innerHTML = `
        <div class="space-y-6">
            <!-- Ticket Header -->
            <div class="border-b pb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">#${ticket.id || ticket._id}</h1>
                        <h2 class="text-xl font-semibold text-gray-800 mt-2">${ticket.subject}</h2>
                        <div class="flex items-center mt-4 space-x-4">
                            <span class="px-3 py-1 text-sm font-semibold rounded-full ${statusColor}">
                                ${ticket.status}
                            </span>
                            <span class="px-3 py-1 text-sm font-semibold rounded-full ${priorityColor}">
                                ${ticket.priority}
                            </span>
                            <span class="text-sm text-gray-600">
                                Created: ${formatDate(ticket.createdAt)}
                            </span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editTicket('${ticket.id || ticket._id}')" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Edit Ticket
                        </button>
                        <button onclick="updateTicketStatus('${ticket.id || ticket._id}')" 
                            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Update Status
                        </button>
                    </div>
                </div>
            </div>

            <!-- Ticket Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-700 whitespace-pre-wrap">${ticket.description}</p>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Ticket Information</h3>
                    <div class="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                            <span class="font-medium text-gray-700">Category:</span>
                            <span class="ml-2 text-gray-600">${ticket.category || 'N/A'}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-700">Created by:</span>
                            <span class="ml-2 text-gray-600">${ticket.creator || 'Unknown'}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-700">Assigned to:</span>
                            <span class="ml-2 text-gray-600">${ticket.assignedTo || 'Unassigned'}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-700">Last updated:</span>
                            <span class="ml-2 text-gray-600">${formatDate(ticket.updatedAt || ticket.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Comments Section -->
            <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Comments</h3>
                <div id="comments" class="space-y-4 mb-6">
                    ${renderComments(ticket.comments || [])}
                </div>
                
                <!-- Add Comment Form -->
                <div class="border-t pt-4">
                    <h4 class="text-md font-medium text-gray-900 mb-2">Add Comment</h4>
                    <form id="commentForm" class="space-y-4">
                        <div>
                            <textarea id="commentContent" name="commentContent" rows="3"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Add a comment..." required></textarea>
                        </div>
                        <button type="submit"
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Post Comment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add comment form event listener
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', handleAddComment);
    }
}

// Render comments
function renderComments(comments) {
    if (comments.length === 0) {
        return '<p class="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>';
    }
    
    return comments.map(comment => `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-gray-900">${comment.user || 'Unknown'}</span>
                <span class="text-sm text-gray-500">${formatDate(comment.createdAt)}</span>
            </div>
            <p class="text-gray-700">${comment.content}</p>
        </div>
    `).join('');
}

// Handle adding comment
async function handleAddComment(e) {
    e.preventDefault();
    
    const commentContent = document.getElementById('commentContent').value.trim();
    if (!commentContent) return;
    
    const ticketId = localStorage.getItem('viewingTicketId');
    const userName = localStorage.getItem('userName') || 'User';
    
    const newComment = {
        content: commentContent,
        user: userName,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Add comment to offline storage
        const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
        const ticketIndex = tickets.findIndex(t => t.id === ticketId);
        
        if (ticketIndex !== -1) {
            if (!tickets[ticketIndex].comments) {
                tickets[ticketIndex].comments = [];
            }
            tickets[ticketIndex].comments.push(newComment);
            localStorage.setItem('offlineTickets', JSON.stringify(tickets));
            
            // Reload ticket details
            loadTicketDetails();
            
            // Clear form
            document.getElementById('commentContent').value = '';
            
            showSuccess('Comment added successfully!');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment');
    }
}

// Update ticket status
function updateTicketStatus(ticketId) {
    const statuses = ['open', 'in-progress', 'resolved', 'closed'];
    const currentStatus = prompt('Enter new status (open, in-progress, resolved, closed):');
    
    if (currentStatus && statuses.includes(currentStatus)) {
        try {
            const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
            const ticketIndex = tickets.findIndex(t => t.id === ticketId);
            
            if (ticketIndex !== -1) {
                tickets[ticketIndex].status = currentStatus;
                tickets[ticketIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('offlineTickets', JSON.stringify(tickets));
                
                // Reload ticket details
                loadTicketDetails();
                
                showSuccess('Ticket status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
            showError('Failed to update ticket status');
        }
    }
}

// Edit ticket
function editTicket(ticketId) {
    localStorage.setItem('editingTicketId', ticketId);
    window.location.href = 'create-ticket.html?edit=' + ticketId;
}

// Get status color class
function getStatusColor(status) {
    switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'in-progress': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Get priority color class
function getPriorityColor(priority) {
    switch (priority) {
        case 'low': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'urgent': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Show error message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'bg-red-500 text-white px-4 py-2 rounded-lg fixed bottom-4 right-4 z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show success message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'bg-green-500 text-white px-4 py-2 rounded-lg fixed bottom-4 right-4 z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 