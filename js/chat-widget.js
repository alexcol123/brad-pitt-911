// Brad Pitt AI Chat Widget with Clerk Authentication
class BradPittChatWidget {
    constructor() {
        this.isOpen = false;
        this.isAuthenticated = false;
        this.user = null;
        this.clerk = null;
        this.chatHistory = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Initialize Clerk
        await this.initializeClerk();
        
        // Create chat widget elements
        this.createChatWidget();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.checkAuthStatus();
    }

    async initializeClerk() {
        // Load Clerk from CDN
        if (!window.Clerk) {
            const script = document.createElement('script');
            script.src = 'https://js.clerk.com/v4/clerk.js';
            script.async = true;
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }

        // Initialize Clerk with your publishable key
        const publishableKey = 'pk_test_your_clerk_publishable_key_here'; // Replace with actual key
        this.clerk = window.Clerk;
        await this.clerk.load();
        
        if (this.clerk.user) {
            this.isAuthenticated = true;
            this.user = this.clerk.user;
        }
    }

    createChatWidget() {
        // Chat button
        const chatButton = document.createElement('div');
        chatButton.id = 'brad-chat-button';
        chatButton.innerHTML = `
            <div class="chat-button">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E" alt="Brad Pitt" class="chat-avatar">
                <span class="chat-text">Chat with Brad</span>
            </div>
        `;

        // Chat modal
        const chatModal = document.createElement('div');
        chatModal.id = 'brad-chat-modal';
        chatModal.innerHTML = `
            <div class="chat-modal">
                <div class="chat-header">
                    <div class="chat-header-content">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E" alt="Brad Pitt" class="header-avatar">
                        <div class="header-info">
                            <h3>Brad Pitt</h3>
                            <p class="status">Online</p>
                        </div>
                    </div>
                    <button class="close-button" id="close-chat">✕</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <div class="message brad-message">
                            <div class="message-content">
                                <p>Hey there! Welcome to my website. Sign in to start chatting with me! 🎬</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="auth-required" id="auth-required">
                        <button class="sign-in-btn" id="sign-in-btn">Sign In to Chat</button>
                        <p class="auth-text">Sign in with Google, GitHub, or email to start your conversation with Brad Pitt</p>
                    </div>
                    <div class="chat-input-area" id="chat-input-area" style="display: none;">
                        <input type="text" id="chat-input" placeholder="Type your message to Brad...">
                        <button id="send-btn" class="send-button">Send</button>
                    </div>
                </div>
                <div class="loading-indicator" id="loading-indicator" style="display: none;">
                    <p>Brad is typing...</p>
                </div>
            </div>
        `;

        document.body.appendChild(chatButton);
        document.body.appendChild(chatModal);
    }

    setupEventListeners() {
        // Chat button click
        document.getElementById('brad-chat-button').addEventListener('click', () => {
            this.toggleChat();
        });

        // Close button click
        document.getElementById('close-chat').addEventListener('click', () => {
            this.closeChat();
        });

        // Sign in button click
        document.getElementById('sign-in-btn').addEventListener('click', () => {
            this.signIn();
        });

        // Send button click
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Click outside to close
        document.getElementById('brad-chat-modal').addEventListener('click', (e) => {
            if (e.target.id === 'brad-chat-modal') {
                this.closeChat();
            }
        });
    }

    checkAuthStatus() {
        if (this.isAuthenticated) {
            this.showAuthenticatedUI();
        } else {
            this.showUnauthenticatedUI();
        }
    }

    showAuthenticatedUI() {
        document.getElementById('auth-required').style.display = 'none';
        document.getElementById('chat-input-area').style.display = 'flex';
        
        // Update welcome message
        const welcomeMessage = document.querySelector('.welcome-message .message-content p');
        const firstName = this.user?.firstName || 'there';
        welcomeMessage.textContent = `Hey ${firstName}! Great to see you. What would you like to know about my career or life? 🎬`;
    }

    showUnauthenticatedUI() {
        document.getElementById('auth-required').style.display = 'block';
        document.getElementById('chat-input-area').style.display = 'none';
    }

    async signIn() {
        try {
            await this.clerk.openSignIn();
            
            // Listen for sign-in success
            this.clerk.addListener('session', (session) => {
                if (session) {
                    this.isAuthenticated = true;
                    this.user = session.user;
                    this.showAuthenticatedUI();
                }
            });
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('Failed to sign in. Please try again.');
        }
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        document.getElementById('brad-chat-modal').classList.add('open');
        document.getElementById('brad-chat-button').classList.add('hidden');
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('brad-chat-modal').classList.remove('open');
        document.getElementById('brad-chat-button').classList.remove('hidden');
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show loading
        this.showLoading(true);

        try {
            // Get session token from Clerk
            const sessionToken = await this.clerk.session.getToken();
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    message: message,
                    userId: this.user.id,
                    userName: this.user.firstName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            // Add Brad's response to chat
            this.addMessage(data.reply, 'brad');

        } catch (error) {
            console.error('Chat error:', error);
            this.showError('Sorry, I had trouble responding. Please try again!');
        } finally {
            this.showLoading(false);
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(content)}</p>
                <span class="message-time">${this.formatTime(new Date())}</span>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in chat history
        this.chatHistory.push({ content, sender, timestamp: new Date() });
    }

    showLoading(show) {
        this.isLoading = show;
        document.getElementById('loading-indicator').style.display = show ? 'block' : 'none';
        document.getElementById('send-btn').disabled = show;
    }

    showError(message) {
        this.addMessage(`Sorry, ${message}`, 'brad');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Initialize the chat widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BradPittChatWidget();
});