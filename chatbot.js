// Chatbot configuration
const chatbotConfig = {
    faqs: {
        'upload-attachment': {
            question: 'How do I upload an attachment?',
            answer: 'Use the Attachments section in the ticket form to upload PNG, JPG, GIF, or PDF files up to 10MB.'
        },
        'reset-password': {
            question: 'How do I reset my password?',
            answer: 'Click "Forgot Password" on the login page and follow the instructions.'
        },
        'user-roles': {
            question: 'What are the different user roles?',
            answer: 'There are three roles: User (can create/view their tickets), Agent (can manage and resolve tickets), and Admin (can manage users, agents, categories, and view all tickets).'
        },
        'logout': {
            question: 'How do I log out?',
            answer: 'Click on your profile icon in the top right corner and select "Logout" from the dropdown menu.'
        },
        'how-to-create-ticket': {
            question: 'How do I create a new ticket?',
            answer: 'To create a new ticket, click on the "Create New Ticket" button on your dashboard. Fill in the subject, description, and select a category. You can also attach files if needed. Click submit to create your ticket.'
        },
        'track-ticket': {
            question: 'How can I track my ticket?',
            answer: 'You can track your ticket on the dashboard. Each ticket shows its current status and progress. Click on a ticket to see its full details and conversation history.'
        },
        'ticket-statuses': {
            question: 'What do different ticket statuses mean?',
            answer: 'Here are the ticket statuses:\n\n- Open: Ticket is awaiting initial response\n- In Progress: Agent is working on your issue\n- Resolved: Issue has been fixed\n- Closed: Ticket is closed and resolved\n\nYou can track these status changes on your dashboard.'
        }
    },
    defaultResponses: {
        greeting: 'Hi there! I\'m here to help you with QuickDesk. How can I assist you today?',
        notFound: 'I\'m sorry, I don\'t have information about that. Here are some common questions I can help with:\n\n• How to create a ticket\n• How to track tickets\n• Ticket status meanings\n• How to upload attachments\n\nWould you like to know more about any of these topics?',
        thanks: 'You\'re welcome! If you have any other questions, feel free to ask!'
    }
};

// Wait for DOM to be fully loaded before accessing elements
window.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotModal = document.getElementById('chatbot-modal');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');

    // Add a language selector
    let selectedLang = 'en';
    let languageSelector = document.getElementById('chatbot-language');
    if (!languageSelector) {
        languageSelector = document.createElement('select');
        languageSelector.id = 'chatbot-language';
        languageSelector.className = 'ml-2 p-1 rounded border';
        languageSelector.innerHTML = `
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
        `;
        chatbotModal.querySelector('h1, .font-bold, .text-2xl')?.after(languageSelector);
    }
    languageSelector.addEventListener('change', (e) => {
        selectedLang = e.target.value;
    });

    // Event Listeners
    chatbotWidget.addEventListener('click', toggleChatbot);
    closeChatbot.addEventListener('click', toggleChatbot);
    sendMessage.addEventListener('click', handleMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMessage();
        }
    });

    // Make selectedLang available globally for other functions
    window.selectedLang = selectedLang;
    window.chatInput = chatInput;
    window.chatMessages = chatMessages;
});


// Translation function using LibreTranslate
async function translate(text, from, to) {
    if (from === to) return text;
    try {
        const res = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            body: JSON.stringify({
                q: text,
                source: from,
                target: to,
                format: "text"
            }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        return data.translatedText;
    } catch (e) {
        return text; // fallback
    }
}

// Match FAQ by keyword (simple contains match, can be improved)
function matchFAQ(messageEn) {
    const lowerMsg = messageEn.toLowerCase();
    for (const key in chatbotConfig.faqs) {
        if (
            lowerMsg.includes(key.replace(/-/g, ' ')) ||
            lowerMsg.includes(chatbotConfig.faqs[key].question.toLowerCase().split(' ')[0])
        ) {
            return chatbotConfig.faqs[key].answer;
        }
    }
    // Try fallback: match by question contains
    for (const key in chatbotConfig.faqs) {
        if (lowerMsg.includes(chatbotConfig.faqs[key].question.toLowerCase().split(' ')[1] || '')) {
            return chatbotConfig.faqs[key].answer;
        }
    }
    return null;
}

// Main multilingual processing
async function processMessageWithTranslation(message, userLang) {
    // 1. Translate user input to English if needed
    let inputEn = message;
    if (userLang !== 'en') {
        inputEn = await translate(message, userLang, 'en');
    }
    // 2. Match FAQ
    let answer = matchFAQ(inputEn);
    if (!answer) answer = chatbotConfig.defaultResponses.notFound;
    // 3. Translate answer back to user's language if needed
    if (userLang !== 'en') {
        answer = await translate(answer, 'en', userLang);
    }
    return answer;
}

// Chatbot Functions
function toggleChatbot() {
    chatbotWidget.classList.toggle('hidden');
    chatbotModal.classList.toggle('hidden');
    
    if (!chatbotModal.classList.contains('hidden')) {
        // Show greeting message when opening
        addMessage(chatbotConfig.defaultResponses.greeting, false);
        chatInput.focus();
    }
}

async function handleMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    
    // Process message with translation
    const reply = await processMessageWithTranslation(message, selectedLang);
    addMessage(reply, false);
    chatInput.value = '';
}
    // Clear input
    chatInput.value = '';
    
    // Process message
    processMessage(message);
}

function processMessage(message) {
    // Check for keywords in FAQs
    const keywords = Object.keys(chatbotConfig.faqs);
    let matchedFaq = null;
    
    for (const key of keywords) {
        if (message.toLowerCase().includes(key)) {
            matchedFaq = key;
            break;
        }
    }
    
    if (matchedFaq) {
        addMessage(chatbotConfig.faqs[matchedFaq].answer, false);
    } else {
        // Default response for unknown queries
        addMessage(chatbotConfig.defaultResponses.notFound, false);
    }
}

function addMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
    
    const messageContent = document.createElement('div');
    messageContent.className = `px-4 py-2 rounded-lg max-w-[80%] ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
    }`;
    messageContent.textContent = text;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-show chatbot widget after 5 seconds
setTimeout(() => {
    chatbotWidget.classList.remove('hidden');
}, 5000);
