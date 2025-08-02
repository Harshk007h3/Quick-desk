// Profile and signout functionality
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

    // Theme toggle function
    function toggleTheme() {
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
    }

    // Add theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

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

    // Signout functionality
    const signoutBtn = document.getElementById('signoutBtn');
    signoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Clear authentication state
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        // Redirect to login page
        window.location.href = 'index.html';
    });
});

// Agent dashboard configuration
const agentConfig = {
    statuses: ['open', 'in-progress', 'resolved', 'closed'],
    priorities: ['low', 'medium', 'high', 'urgent'],
    categories: {
        'Technical Issues': {
            icon: '💻',
            subcategories: [
                'Software Bug',
                'Hardware Issue',
                'System Crash',
                'Printer/Scanner not working'
            ],
            description: 'For problems related to devices, hardware, or software errors.'
        },
        'Account & Access Issues': {
            icon: '🔐',
            subcategories: [
                'Forgot Password',
                'Account Locked',
                'Permission Denied',
                'Two-Factor Authentication Issue'
            ],
            description: 'Anything related to login, password, or permission problems.'
        },
        'Network & Connectivity': {
            icon: '📶',
            subcategories: [
                'Slow Internet',
                'VPN Not Connecting',
                'LAN Port Issue',
                'No Wi-Fi Signal'
            ],
            description: 'For internet/WiFi/VPN-related problems.'
        },
        'Billing & Payment': {
            icon: '🧾',
            subcategories: [
                'Payment Failed',
                'Invoice Request',
                'Refund Issue',
                'Subscription Upgrade'
            ],
            description: 'For invoice, payment, or subscription-related queries.'
        },
        'HR & Admin Support': {
            icon: '💼',
            subcategories: [
                'Leave Application Not Working',
                'ID Card Reissue',
                'Payroll Issue',
                'Travel Reimbursement'
            ],
            description: 'Non-technical, office-related issues.'
        },
        'Academic/Student Support': {
            icon: '🎓',
            subcategories: [
                'Result Not Showing',
                'LMS Access Issue',
                'Timetable Conflict',
                'Certificate Request'
            ],
            description: 'For educational-related issues.'
        },
        'Application & Software Requests': {
            icon: '🗃️',
            subcategories: [
                'Request New Software',
                'Software Upgrade',
                'License Expiry'
            ],
            description: 'Asking for new software/tools.'
        },
        'Security Concerns': {
            icon: '🛑',
            subcategories: [
                'Phishing Email Report',
                'Unauthorized Access',
                'Malware Detected'
            ],
            description: 'Any suspicious activities or data breach risks.'
        },
        'General Queries / Others': {
            icon: '📬',
            subcategories: [
                'Feedback/Suggestion',
                'General Information Request',
                'UI/UX Feedback'
            ],
            description: 'Anything that doesn\'t fit other categories.'
        }
    },
    priorityColors: {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
        urgent: 'bg-red-200 text-red-900'
    },
    statusColors: {
        open: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800'
    },
    // Access control
    accessControl: {
        admin: {
            canCreateTickets: false, // Admin cannot create tickets
            canViewAllTickets: true  // Admin can view all tickets
        },
        user: {
            canCreateTickets: true,  // Users can create tickets
            canViewAllTickets: false // Users can only view their own tickets
        },
        agent: {
            canCreateTickets: true,  // Agents can create tickets
            canViewAllTickets: true  // Agents can view all tickets
        }
    }
};

// DOM Elements
const allTicketsTab = document.getElementById('allTicketsTab');
const myTicketsTab = document.getElementById('myTicketsTab');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const searchInput = document.getElementById('searchInput');
const ticketsTableBody = document.getElementById('ticketsTableBody');
const statsContainer = document.getElementById('statsContainer');

// Chart configurations
let performanceChart;
let categoryChart;
let priorityChart;

// Initialize dashboard
let analyticsInterval;

async function initializeDashboard() {
    try {
        // Initialize charts
        initializeCharts();
        
        // Load stats immediately
        await loadStats();
        
        // Load tickets
        await showTickets('all');
        
        // Load agents for assignment dropdown
        await loadAgents();
        
        // Initialize real-time updates
        initializeRealTimeUpdates();
        
        // Set up periodic analytics refresh
        analyticsInterval = setInterval(() => {
            loadStats();
            updateCharts();
        }, 30000); // Refresh every 30 seconds
        
        // Cleanup on window unload
        window.addEventListener('beforeunload', () => {
            clearInterval(analyticsInterval);
            if (performanceChart) performanceChart.destroy();
            if (categoryChart) categoryChart.destroy();
            if (priorityChart) priorityChart.destroy();
        });
    } catch (error) {
        showError('Failed to initialize dashboard');
    }
}

// Event Listeners
allTicketsTab.addEventListener('click', () => showTickets('all'));
myTicketsTab.addEventListener('click', () => showTickets('assigned'));
statusFilter.addEventListener('change', () => filterTickets());
priorityFilter.addEventListener('change', () => filterTickets());
searchInput.addEventListener('input', () => filterTickets());

// Load Dashboard Stats
async function loadStats() {
    try {
        const response = await fetch('/api/analytics/agent/stats');
        const stats = await response.json();

        // Update stats container
        const statsContainer = document.getElementById('statsContainer');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Total Tickets</h3>
                        <p class="text-3xl font-bold text-blue-600">${stats.totalTickets}</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Resolved Today</h3>
                        <p class="text-3xl font-bold text-green-600">${stats.resolvedToday}</p>
                        <p class="text-sm text-gray-500 mt-1">Target: ${stats.targetPerformance}%</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Priority Distribution</h3>
                        <div class="space-y-2">
                            ${stats.priorityDistribution.map(p => `
                                <div class="flex items-center space-x-2">
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-${p.color}-600 h-2.5 rounded-full" style="width: ${p.percentage}%"></div>
                                    </div>
                                    <span class="text-sm">${p.priority}: ${p.percentage}%</span>
                                    ${p.targetPercentage ? `
                                        <span class="text-xs text-gray-400">(Target: ${p.targetPercentage}%)</span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Update charts if they exist
        updateCharts();
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Failed to load dashboard stats');
    }
}

// Initialize Real-time Updates
function initializeRealTimeUpdates() {
    const socket = io();
    
    // Handle ticket updates
    socket.on('ticketUpdate', async (ticketId) => {
        try {
            // Only update the specific ticket row
            const ticketRow = Array.from(ticketsTableBody.getElementsByTagName('tr')).find(row => 
                row.dataset.ticket && JSON.parse(row.dataset.ticket)._id === ticketId
            );
            
            if (ticketRow) {
                const response = await fetch(`/api/tickets/${ticketId}`);
                const updatedTicket = await response.json();
                
                // Update only the specific row
                ticketRow.dataset.ticket = JSON.stringify(updatedTicket);
                ticketRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${updatedTicket.subject}</div>
                        <div class="text-sm text-gray-500">${updatedTicket.description.substring(0, 50)}...</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(updatedTicket.status)}">
                            ${updatedTicket.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(updatedTicket.priority)}">
                            ${updatedTicket.priority}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">${updatedTicket.category.name}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDate(updatedTicket.createdAt)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="showTicketActions('${updatedTicket._id}')" class="text-blue-600 hover:text-blue-900">
                            Actions
                        </button>
                    </td>
                `;
                
                // Update stats if ticket status changed
                if (updatedTicket.status !== ticketRow.querySelector('span').textContent) {
                    loadStats();
                }
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    });
    
    // Handle stats updates
    socket.on('statsUpdate', async () => {
        try {
            await loadStats();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        showError('Failed to connect to real-time updates');
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        showError('Real-time updates disconnected');
    });
    
    // Handle chart updates
    socket.on('chartUpdate', async () => {
        try {
            await updateCharts();
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    });
}

// Show Tickets
async function showTickets(filter = 'all') {
    try {
        const response = await fetch(`/api/tickets?filter=${filter}`);
        const tickets = await response.json();
        
        renderTickets(tickets);
    } catch (error) {
        showError('Failed to load tickets');
    }
}

// Show Tickets
async function showTickets(filter = 'all') {
    try {
        const response = await fetch(`/api/tickets?filter=${filter}`);
        const tickets = await response.json();
        
        renderTickets(tickets);
    } catch (error) {
        showError('Failed to load tickets');
    }
}

// Filter Tickets
function filterTickets() {
    const status = statusFilter.value;
    const priority = priorityFilter.value;
    const search = searchInput.value.toLowerCase();
    
    // Get all ticket rows
    const rows = ticketsTableBody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const ticket = row.dataset.ticket;
        if (!ticket) return;
        
        const ticketObj = JSON.parse(ticket);
        const matchesStatus = status === 'all' || ticketObj.status === status;
        const matchesPriority = priority === 'all' || ticketObj.priority === priority;
        const matchesSearch = 
            ticketObj.subject.toLowerCase().includes(search) ||
            ticketObj.description.toLowerCase().includes(search);
        
        row.style.display = matchesStatus && matchesPriority && matchesSearch ? '' : 'none';
    });
}

// Render Tickets
function renderTickets(tickets) {
    ticketsTableBody.innerHTML = '';
    
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.dataset.ticket = JSON.stringify(ticket);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${ticket.subject}</div>
                <div class="text-sm text-gray-500">${ticket.description.substring(0, 50)}...</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}">
                    ${ticket.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}">
                    ${ticket.priority}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${ticket.category.name}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(ticket.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="showTicketActions('${ticket._id}')" class="text-blue-600 hover:text-blue-900">
                    Actions
                </button>
            </td>
        `;
        
        ticketsTableBody.appendChild(row);
    });
}

// Format Date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Show Ticket Actions
function showTicketActions(ticketId) {
    const modal = document.getElementById('actionModal');
    modal.style.display = 'block';
    modal.dataset.ticketId = ticketId;
}

// Handle Ticket Action
async function handleTicketAction() {
    try {
        const modal = document.getElementById('actionModal');
        const ticketId = modal.dataset.ticketId;
        const action = document.getElementById('actionSelect').value;
        const value = document.getElementById('actionValue').value;
        
        const response = await fetch(`/api/tickets/${ticketId}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, value })
        });
        
        if (response.ok) {
            await showTickets();
            closeActionModal();
            showSuccess('Action completed successfully');
        } else {
            throw new Error('Failed to perform action');
        }
    } catch (error) {
        showError('Failed to perform action');
    }
}

// Close Action Modal
function closeActionModal() {
    const modal = document.getElementById('actionModal');
    modal.style.display = 'none';
}

// Load Agents
async function loadAgents() {
    try {
        const response = await fetch('/api/users?role=agent');
        const agents = await response.json();
        
        const select = document.getElementById('agentSelect');
        select.innerHTML = '<option value="">Select Agent</option>';
        
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent._id;
            option.textContent = agent.name;
            select.appendChild(option);
        });
    } catch (error) {
        showError('Failed to load agents');
    }
}

// Show Success Message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show Error Message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Chart initialization
function initializeCharts() {
    // Performance Trends Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Resolved Tickets',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                },
                {
                    label: 'Performance Score',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Category Performance Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Tickets per Category',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Priority Distribution Chart
    const priorityCtx = document.getElementById('priorityChart').getContext('2d');
    priorityChart = new Chart(priorityCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.5)',
                        'rgba(245, 158, 11, 0.5)',
                        'rgba(239, 68, 68, 0.5)',
                        'rgba(59, 130, 246, 0.5)'
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Chart updates
async function updateCharts() {
    try {
        // Get performance trends
        const performanceResponse = await fetch('/api/analytics/agent/performance-trends?days=30');
        const performanceData = await performanceResponse.json();
        
        // Update performance chart
        performanceChart.data.labels = Object.keys(performanceData);
        performanceChart.data.datasets[0].data = Object.values(performanceData).map(d => d.resolved);
        performanceChart.data.datasets[1].data = Object.values(performanceData).map(d => d.performanceScore);
        performanceChart.update();

        // Get category performance
        const categoryResponse = await fetch('/api/analytics/agent/category-performance');
        const categoryData = await categoryResponse.json();
        
        // Update category chart
        categoryChart.data.labels = Object.keys(categoryData);
        categoryChart.data.datasets[0].data = Object.values(categoryData).map(d => d.count);
        categoryChart.update();

        // Get priority distribution
        const priorityResponse = await fetch('/api/analytics/agent/priority-performance');
        const priorityData = await priorityResponse.json();
        
        // Update priority chart
        priorityChart.data.labels = Object.keys(priorityData);
        priorityChart.data.datasets[0].data = Object.values(priorityData).map(d => d.count);
        priorityChart.update();

        // Update response time stats
        const responseTimeResponse = await fetch('/api/analytics/agent/stats');
        const responseTimeData = await responseTimeResponse.json();

        // Update response time display
        const avgResponseTime = document.getElementById('avgResponseTime');
        const responseTimeProgress = document.getElementById('responseTimeProgress');
        const responseTimeStatus = document.getElementById('responseTimeStatus');

        if (avgResponseTime && responseTimeProgress && responseTimeStatus) {
            avgResponseTime.textContent = `${responseTimeData.avgResponseTime} min`;
            const progress = (responseTimeData.avgResponseTime / 30) * 100;
            responseTimeProgress.style.width = `${progress}%`;
            responseTimeStatus.textContent = progress <= 100 ? 'On Target' : 'Over Target';
            responseTimeProgress.className = `bg-${progress <= 100 ? 'green' : 'red'}-600 h-2.5 rounded-full`;
        }

        // Update top categories
        const topCategories = document.getElementById('topCategories');
        if (topCategories) {
            topCategories.innerHTML = '';
            Object.entries(categoryData)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3)
                .forEach(([category, data]) => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center';
                    div.innerHTML = `
                        <span>${category}</span>
                        <span class="text-sm text-gray-500">${data.count} tickets</span>
                    `;
                    topCategories.appendChild(div);
                });
        }

        // Update priority targets
        const priorityTargets = document.getElementById('priorityTargets');
        if (priorityTargets) {
            priorityTargets.innerHTML = '';
            Object.entries(priorityData).forEach(([priority, data]) => {
                const div = document.createElement('div');
                div.className = 'flex justify-between items-center';
                div.innerHTML = `
                    <span>${priority}</span>
                    <span class="text-sm text-gray-500">${data.count} tickets</span>
                `;
                priorityTargets.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Show Success Message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show Error Message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Agent dashboard functionality
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
    const allTicketsTab = document.getElementById('allTicketsTab');
    const myTicketsTab = document.getElementById('myTicketsTab');

    if (allTicketsTab) {
        allTicketsTab.addEventListener('click', function() {
            setActiveTab('all');
            loadTickets('all');
        });
    }

    if (myTicketsTab) {
        myTicketsTab.addEventListener('click', function() {
            setActiveTab('my');
            loadTickets('my');
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
async function loadTickets(tabType = 'all') {
    try {
        const authToken = localStorage.getItem('authToken');
        const isOfflineMode = localStorage.getItem('isOfflineMode') === 'true';
        const userName = localStorage.getItem('userName');
        
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
        
        // Filter tickets based on tab type
        if (tabType === 'my') {
            // Show only tickets assigned to current agent
            tickets = tickets.filter(ticket => ticket.assignedTo === userName);
        }
        // For 'all' tab, show all tickets (agents can see all tickets)
        
        console.log('Filtered tickets for tab', tabType, ':', tickets);
        renderTickets(tickets);
        updateTicketCount(tickets.length);
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        showError('Failed to load tickets');
    }
}

// Set active tab
function setActiveTab(tabType) {
    const allTicketsTab = document.getElementById('allTicketsTab');
    const myTicketsTab = document.getElementById('myTicketsTab');
    
    if (tabType === 'all') {
        allTicketsTab.classList.add('border-blue-500', 'text-blue-600');
        allTicketsTab.classList.remove('border-transparent', 'text-gray-500');
        myTicketsTab.classList.add('border-transparent', 'text-gray-500');
        myTicketsTab.classList.remove('border-blue-500', 'text-blue-600');
    } else {
        myTicketsTab.classList.add('border-blue-500', 'text-blue-600');
        myTicketsTab.classList.remove('border-transparent', 'text-gray-500');
        allTicketsTab.classList.add('border-transparent', 'text-gray-500');
        allTicketsTab.classList.remove('border-blue-500', 'text-blue-600');
    }
}

// Render tickets in the table
function renderTickets(tickets) {
    const tableBody = document.getElementById('ticketsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (tickets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(ticket.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewTicket('${ticket.id || ticket._id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                    View
                </button>
                <button onclick="openActionModal('${ticket.id || ticket._id}')" class="text-green-600 hover:text-green-900">
                    Action
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
            ticket.description.toLowerCase().includes(search);
        
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

// Open action modal
function openActionModal(ticketId) {
    const modal = document.getElementById('actionModal');
    const actionSelect = document.getElementById('actionSelect');
    const actionValue = document.getElementById('actionValue');
    
    // Store ticket ID
    localStorage.setItem('actionTicketId', ticketId);
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Update action value options based on selection
    actionSelect.addEventListener('change', function() {
        const action = actionSelect.value;
        actionValue.value = '';
        
        if (action === 'status') {
            actionValue.placeholder = 'Enter status (open, in-progress, resolved, closed)';
        } else if (action === 'priority') {
            actionValue.placeholder = 'Enter priority (low, medium, high, urgent)';
        } else if (action === 'assign') {
            actionValue.placeholder = 'Enter agent name';
        } else if (action === 'comment') {
            actionValue.placeholder = 'Enter comment';
        }
    });
    
    // Handle submit action
    const submitAction = document.getElementById('submitAction');
    submitAction.onclick = function() {
        handleTicketAction(ticketId, actionSelect.value, actionValue.value, document.getElementById('actionComment').value);
    };
    
    // Handle close modal
    const closeActionModal = document.getElementById('closeActionModal');
    closeActionModal.onclick = function() {
        modal.classList.add('hidden');
    };
}

// Handle ticket action
function handleTicketAction(ticketId, action, value, comment) {
    try {
        const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
        const ticketIndex = tickets.findIndex(t => t.id === ticketId);
        
        if (ticketIndex !== -1) {
            const ticket = tickets[ticketIndex];
            
            switch (action) {
                case 'status':
                    ticket.status = value;
                    break;
                case 'priority':
                    ticket.priority = value;
                    break;
                case 'assign':
                    ticket.assignedTo = value;
                    break;
                case 'comment':
                    if (!ticket.comments) ticket.comments = [];
                    ticket.comments.push({
                        content: value,
                        user: localStorage.getItem('userName') || 'Agent',
                        createdAt: new Date().toISOString()
                    });
                    break;
            }
            
            ticket.updatedAt = new Date().toISOString();
            localStorage.setItem('offlineTickets', JSON.stringify(tickets));
            
            // Close modal
            document.getElementById('actionModal').classList.add('hidden');
            
            // Reload tickets
            loadTickets();
            
            showSuccess('Ticket action completed successfully!');
        }
    } catch (error) {
        console.error('Error handling ticket action:', error);
        showError('Failed to update ticket');
    }
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
