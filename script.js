// Global Variables
let playerLoaded = false;
let chatCollapsed = false;
let currentUser = null;
let isLoggedIn = false;
let activeUsers = 0;
let sessionId = null;
let userRef = null;
let database = null;

const playerUrl = 'https://playerch2t24.pages.dev/ch?id=yayin1';

// Initialize when page loads
window.addEventListener('load', function() {
    // Initialize database reference
    database = window.firebaseDB || firebase.database();
    
    // Initialize page
    initializePage();
    
    // Focus username input
    setTimeout(() => {
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.focus();
        }
    }, 500);
});

function initializePage() {
    // Fade in animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start listening to general user count (even without login)
    listenToUserCount();
}

function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Don't trigger shortcuts when typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!playerLoaded) {
                loadPlayer();
            }
        } else if (e.key === 'r' || e.key === 'R') {
            reloadPlayer();
        } else if (e.key === 'c' || e.key === 'C') {
            if (isLoggedIn) {
                document.getElementById('chatInput').focus();
            }
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (userRef) {
            userRef.remove();
        }
    });
    
    // Visibility change handler
    document.addEventListener('visibilitychange', function() {
        if (userRef) {
            if (document.visibilityState === 'visible') {
                userRef.update({
                    lastSeen: firebase.database.ServerValue.TIMESTAMP
                });
            }
        }
    });
}

// User Management Functions
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function initializeUserSession() {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    sessionId = generateSessionId();
    
    // Add user to Firebase
    userRef = database.ref('activeUsers/' + sessionId);
    userRef.set({
        username: currentUser,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log('✅ Kullanıcı Firebase\'e eklendi:', currentUser);
    }).catch((error) => {
        console.error('❌ Kullanıcı ekleme hatası:', error);
    });

    // Remove user when disconnected
    userRef.onDisconnect().remove();
    
    // Update last seen periodically
    const heartbeatInterval = setInterval(() => {
        if (userRef && isLoggedIn) {
            userRef.update({
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            clearInterval(heartbeatInterval);
        }
    }, 30000); // Every 30 seconds
}

function listenToUserCount() {
    if (!database) {
        console.log('Database henüz hazır değil, tekrar denenecek...');
        setTimeout(listenToUserCount, 1000);
        return;
    }
    
    database.ref('activeUsers').on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const currentTime = Date.now();
        const userArray = [];
        
        // Filter out old users (inactive for more than 2 minutes)
        Object.keys(users).forEach(key => {
            const user = users[key];
            const lastSeen = user.lastSeen || user.joinedAt;
            if (currentTime - lastSeen < 120000) { // 2 minutes
                userArray.push({
                    sessionId: key,
                    ...user
                });
            } else {
                // Remove inactive user
                database.ref('activeUsers/' + key).remove();
            }
        });
        
        activeUsers = userArray.length;
        document.getElementById('userCount').textContent = activeUsers;
        document.getElementById('onlineTitle').textContent = `Çevrimiçi Kullanıcılar (${activeUsers})`;
        
        updateUserList(userArray);
    }, (error) => {
        console.error('User count listener hatası:', error);
    });
}

function updateUserList(users) {
    const userListElement = document.getElementById('userList');
    if (!userListElement) return;
    
    userListElement.innerHTML = '';
    
    users.forEach(user => {
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.title = user.username;
        avatar.textContent = user.username.substring(0, 2).toUpperCase();
        
        // Highlight current user
        if (user.sessionId === sessionId) {
            avatar.style.background = 'linear-gradient(135deg, var(--success-green), #10b981)';
        }
        
        userListElement.appendChild(avatar);
    });
}

// Login Functions
function login() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    
    if (username === '' || username.length < 2) {
        alert('Lütfen en az 2 karakter uzunluğunda bir kullanıcı adı girin.');
        usernameInput.focus();
        return;
    }

    if (username.length > 20) {
        alert('Kullanıcı adı en fazla 20 karakter olabilir.');
        usernameInput.focus();
        return;
    }
    
    // Check for inappropriate words
    const inappropriateWords = ['admin', 'bot', 'system', 'null', 'undefined'];
    if (inappropriateWords.some(word => username.toLowerCase().includes(word))) {
        alert('Bu kullanıcı adını kullanamazsınız.');
        usernameInput.focus();
        return;
    }
    
    currentUser = username;
    isLoggedIn = true;
    
    // Hide login modal with animation
    const loginModal = document.getElementById('loginModal');
    loginModal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        loginModal.style.display = 'none';
    }, 300);
    
    // Initialize Firebase user session
    initializeUserSession();
    
    // Load initial chat messages
    setTimeout(() => {
        loadInitialMessages();
        
        // Add welcome message
        setTimeout(() => {
            addWelcomeMessage();
        }, 1000);
    }, 500);
    
    console.log('✅ Giriş başarılı:', username);
}

function handleLoginKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        login();
    }
}

// Player Functions
function loadPlayer() {
    const wrapper = document.getElementById('playerWrapper');
    if (!playerLoaded) {
        wrapper.innerHTML = `<iframe src="${playerUrl}" allowfullscreen allow="autoplay; fullscreen"></iframe>`;
        playerLoaded = true;
        
        // Success animation
        setTimeout(() => {
            wrapper.style.transform = 'scale(1.02)';
            setTimeout(() => {
                wrapper.style.transform = 'scale(1)';
            }, 300);
        }, 100);
    }
}

function reloadPlayer() {
    const wrapper = document.getElementById('playerWrapper');
    wrapper.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">Yeniden yükleniyor...</div>
        </div>
    `;
    
    setTimeout(() => {
        wrapper.innerHTML = `<iframe src="${playerUrl}" allowfullscreen allow="autoplay; fullscreen"></iframe>`;
        playerLoaded = true;
    }, 1500);
}

// Chat Functions
function toggleChat() {
    const chatContent = document.getElementById('chatContent');
    const chatToggleIcon = document.getElementById('chatToggleIcon');
    
    if (chatCollapsed) {
        chatContent.style.display = 'block';
        chatToggleIcon.className = 'fas fa-chevron-up';
        chatCollapsed = false;
    } else {
        chatContent.style.display = 'none';
        chatToggleIcon.className = 'fas fa-chevron-down';
        chatCollapsed = true;
    }
}

// Chat Functions with Firebase
function sendMessage() {
    if (!isLoggedIn) {
        alert('Mesaj göndermek için önce giriş yapmalısınız.');
        return;
    }
    
    if (!database) {
        alert('Bağlantı sorunu. Lütfen sayfayı yenileyin.');
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Prevent spam
    if (message.length > 500) {
        alert('Mesaj en fazla 500 karakter olabilir.');
        return;
    }
    
    // Disable send button temporarily
    const sendButton = document.getElementById('chatSend');
    sendButton.disabled = true;
    
    // Send message to Firebase
    database.ref('messages').push({
        author: currentUser,
        content: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        sessionId: sessionId
    }).then(() => {
        console.log('✅ Mesaj gönderildi');
        
        // Kendi mesajımızı hemen chat'e ekle (own message olarak)
        addMessage(currentUser, message, true);
        
    }).catch((error) => {
        console.error('❌ Mesaj gönderme hatası:', error);
        alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }).finally(() => {
        // Re-enable send button
        setTimeout(() => {
            sendButton.disabled = false;
        }, 1000);
    });
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
}

function addMessage(author, content, isOwn = false, timestamp = null) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : ''}`;
    
    let timeStr;
    if (timestamp) {
        const date = new Date(timestamp);
        timeStr = String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    } else {
        const now = new Date();
        timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    messageDiv.innerHTML = `
        <div class="message-author">${escapeHtml(author)}</div>
        <div class="message-content">${escapeHtml(content)}</div>
        <div class="message-time">${timeStr}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Auto-delete old messages to prevent memory issues
    const messages = chatMessages.children;
    if (messages.length > 50) {
        chatMessages.removeChild(messages[0]);
    }
}

function addWelcomeMessage() {
    addMessage('🤖 GTU Bot', `Hoş geldin ${currentUser}! GTU Medya Oynatıcı'ya hoş geldin! Keyifli seyirler! 🎉`, false);
}

function listenToMessages() {
    if (!database) return;
    
    // Listen to new messages (only new ones after login)
    const messagesRef = database.ref('messages').orderByChild('timestamp').startAt(Date.now());
    
    messagesRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message && message.author && message.sessionId !== sessionId) {
            // Only show messages from other users to avoid duplicates
            addMessage(message.author, message.content, false, message.timestamp);
        }
    });
}

function loadInitialMessages() {
    if (!database) return;
    
    // Load last 20 messages initially
    database.ref('messages').orderByChild('timestamp').limitToLast(20).once('value', (snapshot) => {
        const messages = snapshot.val() || {};
        const messageArray = Object.keys(messages).map(key => ({
            id: key,
            ...messages[key]
        })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        messageArray.forEach(msg => {
            if (msg.author && msg.content) {
                const isOwn = msg.sessionId === sessionId;
                addMessage(msg.author, msg.content, isOwn, msg.timestamp);
            }
        });
        
        // After loading initial messages, listen for new ones
        setTimeout(() => {
            listenToMessages();
        }, 1000);
    }).catch((error) => {
        console.error('Initial messages yükleme hatası:', error);
    });
}

function handleChatKeyDown(event) {
    const chatInput = event.target;
    
    // Auto resize textarea
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    
    // Send message on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Auto-cleanup inactive users periodically
setInterval(() => {
    if (database && isLoggedIn) {
        const currentTime = Date.now();
        database.ref('activeUsers').once('value', (snapshot) => {
            const users = snapshot.val() || {};
            Object.keys(users).forEach(key => {
                const user = users[key];
                const lastSeen = user.lastSeen || user.joinedAt;
                if (currentTime - lastSeen > 180000) { // 3 minutes
                    database.ref('activeUsers/' + key).remove();
                }
            });
        });
    }
}, 60000); // Every minute

// Set smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

console.log('🚀 GTU Medya Oynatıcı yüklendi!');