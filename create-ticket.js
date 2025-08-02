// Ticket creation configuration
const ticketConfig = {
    priorities: ['low', 'medium', 'high', 'urgent'],
    categories: [], // Will be populated dynamically from backend
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf']
};

// DOMContentLoaded wrapper for all UI logic
window.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const ticketForm = document.getElementById('ticketForm');
    const categorySelect = document.getElementById('category');
    const prioritySelect = document.getElementById('priority');
    const fileUpload = document.getElementById('file-upload');
    const submitButton = ticketForm.querySelector('button[type="submit"]');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Initialize form
    initializeForm();

    // Dark theme logic
    let isDark = localStorage.getItem('theme') === 'dark';
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

    // Event Listeners
    ticketForm.addEventListener('submit', handleSubmit);
    fileUpload.addEventListener('change', handleFileChange);

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
        // Redirect to login page
        window.location.href = 'index.html';
    });

    // Notification button functionality
    const notificationsBtn = document.getElementById('notifications');
    notificationsBtn.addEventListener('click', function() {
        // Implement notification functionality here
        alert('Notification functionality will be implemented soon!');
    });
});

// Form Initialization
function initializeForm() {
    // Load categories from backend
    loadCategories();
    
    // Set up priority options
    ticketConfig.priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        prioritySelect.appendChild(option);
    });
}

// Load categories from backend
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('Failed to load categories from server');
        }
        const categories = await response.json();
        ticketConfig.categories = categories;
        
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category';
        categorySelect.appendChild(defaultOption);
        
        // Populate category select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id || category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        
        // Fallback to static categories if backend is not available
        const fallbackCategories = [
            { id: 'technical', name: 'Technical Issue' },
            { id: 'account', name: 'Account & Access Issue' },
            { id: 'network', name: 'Network & Connectivity' },
            { id: 'billing', name: 'Billing & Payment' },
            { id: 'hr', name: 'HR & Admin Support' },
            { id: 'academic', name: 'Academic/Student Support' },
            { id: 'general', name: 'General Query' }
        ];
        
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category';
        categorySelect.appendChild(defaultOption);
        
        // Add fallback categories
        fallbackCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        showError('Using fallback categories. Some features may be limited.');
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';
    
    try {
        // Get authentication token
        const authToken = localStorage.getItem('authToken');
        const isOfflineMode = localStorage.getItem('isOfflineMode') === 'true';
        
        if (!authToken && !isOfflineMode) {
            throw new Error('Please login to create a ticket');
        }

        // Prepare ticket data
        const ticketData = {
            subject: document.getElementById('subject').value,
            description: document.getElementById('description').value,
            category: categorySelect.value,
            priority: prioritySelect.value,
            status: 'open',
            createdAt: new Date().toISOString()
        };

        // Try to create ticket with backend first
        if (!isOfflineMode) {
            try {
                const formData = new FormData();
                formData.append('subject', ticketData.subject);
                formData.append('description', ticketData.description);
                formData.append('category', ticketData.category);
                formData.append('priority', ticketData.priority);
                
                // Add files as 'attachments' to match backend API
                const files = fileUpload.files;
                for (let i = 0; i < files.length; i++) {
                    formData.append('attachments', files[i]);
                }

                console.log('Sending ticket to backend:', ticketData);
                
                // Send request with authentication
                const response = await fetch('/api/tickets', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Ticket created successfully:', data);
                    showSuccess('Ticket created successfully!');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                    return;
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } catch (error) {
                console.log('Backend not available, using offline mode:', error.message);
                // Fall back to offline mode
            }
        }

        // Offline mode ticket creation
        const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
        const newTicket = {
            id: Date.now().toString(),
            ...ticketData,
            creator: localStorage.getItem('userName') || 'User',
            assignedTo: null,
            comments: []
        };
        
        tickets.push(newTicket);
        localStorage.setItem('offlineTickets', JSON.stringify(tickets));
        
        console.log('Ticket created in offline mode:', newTicket);
        showSuccess('Ticket created successfully! (Offline Mode)');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        showError(error.message);
    } finally {
        // Reset loading state
        submitButton.disabled = false;
        submitButton.textContent = 'Create Ticket';
    }
}

// Handle file upload
async function handleFileChange(e) {
    const files = e.target.files;
    const fileList = document.createElement('div');
    fileList.className = 'mt-2 space-y-2';
    
    // Clear existing preview if any
    const existingPreview = fileUpload.parentElement.parentElement.querySelector('.file-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Validate files
    const validFiles = [];
    for (let file of files) {
        if (file.size > ticketConfig.maxFileSize) {
            showError(`File ${file.name} is too large. Maximum size is 10MB`);
            continue;
        }
        if (!ticketConfig.allowedFileTypes.includes(file.type)) {
            showError(`File ${file.name} has unsupported type. Allowed types: ${ticketConfig.allowedFileTypes.join(', ')}`);
            continue;
        }
        validFiles.push(file);
        
        // Create file preview
        const filePreview = document.createElement('div');
        filePreview.className = 'flex items-center space-x-2 p-2 bg-gray-50 rounded file-preview';
        filePreview.innerHTML = `
            <span>${file.name}</span>
            <span class="text-sm text-gray-500">${(file.size / 1024).toFixed(1)} KB</span>
            <button onclick="removeFile(this)" class="text-red-500 hover:text-red-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        fileList.appendChild(filePreview);
    }
    
    // Update file input with only valid files
    if (validFiles.length > 0) {
        fileUpload.files = new FileList(validFiles);
    }
    
    // Add to form
    const attachmentsDiv = fileUpload.parentElement.parentElement;
    attachmentsDiv.insertBefore(fileList, attachmentsDiv.lastElementChild);
}

// Form validation
function validateForm() {
    const subject = document.getElementById('subject').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;
    
    if (!subject) {
        showError('Please enter a subject');
        return false;
    }
    
    if (!description) {
        showError('Please enter a description');
        return false;
    }
    
    if (!category) {
        showError('Please select a category');
        return false;
    }
    
    if (!priority) {
        showError('Please select a priority');
        return false;
    }
    
    // Check file size and type if files are attached
    const files = fileUpload.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > ticketConfig.maxFileSize) {
                showError(`File ${file.name} is too large. Maximum size is 10MB`);
                return false;
            }
            if (!ticketConfig.allowedFileTypes.includes(file.type)) {
                showError(`File ${file.name} has unsupported type. Allowed types: ${ticketConfig.allowedFileTypes.join(', ')}`);
                return false;
            }
        }
    }
    
    // Create FormData for preview
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('category', category);
    formData.append('priority', priority);
    
    // Add files to FormData
    for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
    }
    
    // Preview FormData
    console.log('Form Data Preview:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    return true;
}

// Show success message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-banner bg-green-500 text-white px-4 py-2 rounded-lg fixed bottom-4 right-4 z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-banner bg-red-500 text-white px-4 py-2 rounded-lg fixed bottom-4 right-4 z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
