const emojis = {
    categories: {
        smileys: [
            { name: 'grinning', emoji: '😀' },
            { name: 'smiling', emoji: '😊' },
            { name: 'laughing', emoji: '😂' },
            { name: 'sweating', emoji: '😅' },
            { name: 'crying', emoji: '😭' },
            { name: 'heart_eyes', emoji: '😍' },
            { name: 'kissing', emoji: '😘' },
            { name: 'thinking', emoji: '🤔' },
            { name: 'suspicious', emoji: '😏' },
            { name: 'angry', emoji: '😠' }
        ],
        people: [
            { name: 'thumbs_up', emoji: '👍' },
            { name: 'thumbs_down', emoji: '👎' },
            { name: 'clapping', emoji: '👏' },
            { name: 'praying', emoji: '🙏' },
            { name: 'waving', emoji: '👋' },
            { name: 'pointing', emoji: '👉' },
            { name: 'confused', emoji: '😕' },
            { name: 'sunglasses', emoji: '😎' },
            { name: 'mask', emoji: '😷' },
            { name: 'zombie', emoji: '🧟' }
        ],
        nature: [
            { name: 'sun', emoji: '☀️' },
            { name: 'cloud', emoji: '☁️' },
            { name: 'rain', emoji: '🌧️' },
            { name: 'snowflake', emoji: '❄️' },
            { name: 'leaf', emoji: '🍃' },
            { name: 'flower', emoji: '🌸' },
            { name: 'tree', emoji: '🌳' },
            { name: 'mountain', emoji: '⛰️' },
            { name: 'beach', emoji: '🏖️' },
            { name: 'moon', emoji: '🌙' }
        ],
        food: [
            { name: 'pizza', emoji: '🍕' },
            { name: 'hamburger', emoji: '🍔' },
            { name: 'sushi', emoji: '🍣' },
            { name: 'ice_cream', emoji: '🍦' },
            { name: 'cake', emoji: '🎂' },
            { name: 'coffee', emoji: '☕' },
            { name: 'tea', emoji: '🍵' },
            { name: 'wine', emoji: '🍷' },
            { name: 'beer', emoji: '🍺' },
            { name: 'chocolate', emoji: '🍫' }
        ],
        objects: [
            { name: 'computer', emoji: '💻' },
            { name: 'phone', emoji: '📱' },
            { name: 'camera', emoji: '📸' },
            { name: 'clock', emoji: '⏰' },
            { name: 'key', emoji: '🔑' },
            { name: 'lightbulb', emoji: '💡' },
            { name: 'book', emoji: '📚' },
            { name: 'pen', emoji: '🖊️' },
            { name: 'umbrella', emoji: '☂️' },
            { name: 'lock', emoji: '🔒' }
        ],
        symbols: [
            { name: 'star', emoji: '⭐' },
            { name: 'heart', emoji: '❤️' },
            { name: 'fire', emoji: '🔥' },
            { name: 'sparkles', emoji: '✨' },
            { name: 'check', emoji: '✅' },
            { name: 'cross', emoji: '❌' },
            { name: 'warning', emoji: '⚠️' },
            { name: 'arrow_up', emoji: '↑' },
            { name: 'arrow_down', emoji: '↓' },
            { name: 'question', emoji: '❓' }
        ]
    }
};

// Get all emojis
function getAllEmojis() {
    return Object.values(emojis.categories).flat();
}

// Get emojis by category
function getEmojisByCategory(category) {
    return emojis.categories[category] || [];
}

// Search emojis
function searchEmojis(query) {
    const searchTerms = query.toLowerCase().split(' ');
    return getAllEmojis().filter(emoji => {
        const matchesName = searchTerms.some(term => emoji.name.includes(term));
        const matchesEmoji = searchTerms.some(term => emoji.emoji.toLowerCase().includes(term));
        return matchesName || matchesEmoji;
    });
}

// Get emoji by name
function getEmojiByName(name) {
    const allEmojis = getAllEmojis();
    return allEmojis.find(emoji => emoji.name === name);
}

// Get emoji by emoji string
function getEmojiByString(emojiString) {
    const allEmojis = getAllEmojis();
    return allEmojis.find(emoji => emoji.emoji === emojiString);
}

// Get emoji categories
function getEmojiCategories() {
    return Object.keys(emojis.categories);
}

// Get category by emoji
function getCategoryByEmoji(emojiString) {
    const allEmojis = getAllEmojis();
    const emoji = allEmojis.find(e => e.emoji === emojiString);
    if (!emoji) return null;
    
    for (const [category, emojis] of Object.entries(emojis.categories)) {
        if (emojis.includes(emoji)) return category;
    }
    return null;
}

// Get random emoji
function getRandomEmoji() {
    const allEmojis = getAllEmojis();
    return allEmojis[Math.floor(Math.random() * allEmojis.length)];
}

// Get random emoji from category
function getRandomEmojiFromCategory(category) {
    const categoryEmojis = getEmojisByCategory(category);
    return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
}

module.exports = {
    getAllEmojis,
    getEmojisByCategory,
    searchEmojis,
    getEmojiByName,
    getEmojiByString,
    getEmojiCategories,
    getCategoryByEmoji,
    getRandomEmoji,
    getRandomEmojiFromCategory
};
