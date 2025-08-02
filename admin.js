// Admin panel configuration
const adminConfig = {
    roles: ['user', 'agent', 'admin'],
    categories: [],
    users: [],
    analytics: {
        timeRanges: ['today', 'week', 'month', 'year'],
        metrics: ['ticketsCreated', 'ticketsResolved', 'averageResolutionTime']
    }
};

// Admin dashboard functionality
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

    // Load tickets on page load
    loadTickets();

    // Add event listeners for filters
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const searchInput = document.getElementById('searchInput');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterTickets);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterTickets);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterTickets);
    }

    // Tab functionality
    const ticketsTab = document.getElementById('ticketsTab');
    const categoriesTab = document.getElementById('categoriesTab');
    const usersTab = document.getElementById('usersTab');
    const analyticsTab = document.getElementById('analyticsTab');

    if (ticketsTab) {
        ticketsTab.addEventListener('click', function() {
            setActiveTab('tickets');
            loadTickets();
        });
    }

    if (categoriesTab) {
        categoriesTab.addEventListener('click', function() {
            setActiveTab('categories');
            loadCategories();
        });
    }

    if (usersTab) {
        usersTab.addEventListener('click', function() {
            setActiveTab('users');
            loadUsers();
        });
    }

    if (analyticsTab) {
        analyticsTab.addEventListener('click', function() {
            setActiveTab('analytics');
            loadAnalytics();
        });
    }

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
});

// Load tickets from backend or offline storage
async function loadTickets() {
    try {
        const authToken = localStorage.getItem('authToken');
        const isOfflineMode = localStorage.getItem('isOfflineMode') === 'true';
        
        let tickets = [];
        
        if (!isOfflineMode && authToken) {
            // Try to load from backend
            try {
                const response = await fetch('/api/tickets', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (response.ok) {
                    tickets = await response.json();
                    console.log('Tickets loaded from backend:', tickets);
                } else {
                    throw new Error('Backend not available');
                }
            } catch (error) {
                console.log('Backend not available, loading offline tickets');
                // Fall back to offline tickets
                tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
            }
        } else {
            // Load offline tickets
            tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
        }
        
        // Admins can see all tickets (no filtering needed)
        console.log('All tickets for admin:', tickets);
        renderTickets(tickets);
        updateTicketCount(tickets.length);
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        showError('Failed to load tickets');
    }
}

// Set active tab
function setActiveTab(tabType) {
    const ticketsTab = document.getElementById('ticketsTab');
    const categoriesTab = document.getElementById('categoriesTab');
    const usersTab = document.getElementById('usersTab');
    const analyticsTab = document.getElementById('analyticsTab');
    
    // Reset all tabs
    [ticketsTab, categoriesTab, usersTab, analyticsTab].forEach(tab => {
        if (tab) {
            tab.classList.remove('text-blue-600', 'border-blue-600');
            tab.classList.add('text-gray-500', 'hover:text-gray-700');
        }
    });
    
    // Set active tab
    const activeTab = document.getElementById(tabType + 'Tab');
    if (activeTab) {
        activeTab.classList.remove('text-gray-500', 'hover:text-gray-700');
        activeTab.classList.add('text-blue-600', 'border-blue-600');
    }
    
    // Show/hide sections
    const sections = ['tickets', 'categories', 'users', 'analytics'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(section + 'Section');
        if (sectionElement) {
            sectionElement.classList.toggle('hidden', section !== tabType);
        }
    });
}

// Render tickets in the table
function renderTickets(tickets) {
    const tableBody = document.getElementById('ticketsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (tickets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                    No tickets found.
                </td>
            </tr>
        `;
        return;
    }
    
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const statusColor = getStatusColor(ticket.status);
        const priorityColor = getPriorityColor(ticket.priority);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                #${ticket.id || ticket._id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${ticket.subject}</div>
                <div class="text-sm text-gray-500">${ticket.description.substring(0, 50)}...</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                    ${ticket.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColor}">
                    ${ticket.priority}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${ticket.category || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${ticket.creator || 'Unknown'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${ticket.assignedTo || 'Unassigned'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(ticket.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewTicket('${ticket.id || ticket._id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                    View
                </button>
                <button onclick="editTicket('${ticket.id || ticket._id}')" class="text-green-600 hover:text-green-900 mr-2">
                    Edit
                </button>
                <button onclick="deleteTicket('${ticket.id || ticket._id}')" class="text-red-600 hover:text-red-900">
                    Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filter tickets based on search and filters
function filterTickets() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (!statusFilter || !priorityFilter || !searchInput) return;
    
    const status = statusFilter.value;
    const priority = priorityFilter.value;
    const search = searchInput.value.toLowerCase();
    
    // Get all tickets
    const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
    
    // Apply filters
    let filteredTickets = tickets.filter(ticket => {
        const matchesStatus = status === 'all' || ticket.status === status;
        const matchesPriority = priority === 'all' || ticket.priority === priority;
        const matchesSearch = search === '' || 
            ticket.subject.toLowerCase().includes(search) ||
            ticket.description.toLowerCase().includes(search) ||
            (ticket.creator && ticket.creator.toLowerCase().includes(search));
        
        return matchesStatus && matchesPriority && matchesSearch;
    });
    
    renderTickets(filteredTickets);
    updateTicketCount(filteredTickets.length);
}

// Update ticket count
function updateTicketCount(count) {
    const countElement = document.querySelector('.ticket-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// View ticket details
function viewTicket(ticketId) {
    // Store ticket ID for detail page
    localStorage.setItem('viewingTicketId', ticketId);
    window.location.href = 'ticket-detail.html';
}

// Edit ticket
function editTicket(ticketId) {
    // Store ticket ID for edit page
    localStorage.setItem('editingTicketId', ticketId);
    window.location.href = 'create-ticket.html?edit=' + ticketId;
}

// Delete ticket
function deleteTicket(ticketId) {
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
        try {
            const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
            const filteredTickets = tickets.filter(ticket => ticket.id !== ticketId);
            localStorage.setItem('offlineTickets', JSON.stringify(filteredTickets));
            
            // Reload tickets
            loadTickets();
            
            showSuccess('Ticket deleted successfully!');
        } catch (error) {
            console.error('Error deleting ticket:', error);
            showError('Failed to delete ticket');
        }
    }
}

// Load categories (placeholder)
function loadCategories() {
    console.log('Loading categories...');
    // Implementation for categories management
}

// Load users (placeholder)
function loadUsers() {
    console.log('Loading users...');
    // Implementation for users management
}

// Load analytics (placeholder)
function loadAnalytics() {
    console.log('Loading analytics...');
    // Implementation for analytics
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
