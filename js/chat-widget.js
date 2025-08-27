// Simple Brad Pitt AI Chat Widget (No Authentication Required)
class BradPittChatWidget {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.isLoading = false;
        
        this.init();
    }

    init() {
        // Create chat widget elements
        this.createChatWidget();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    createChatWidget() {
        // Chat button
        const chatButton = document.createElement('div');
        chatButton.id = 'brad-chat-button';
        chatButton.innerHTML = `
            <div class="chat-button">
                <div class="chat-avatar">🎬</div>
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
                        <div class="header-avatar">🎬</div>
                        <div class="header-info">
                            <h3>Brad Pitt</h3>
                            <p class="status">Online</p>
                        </div>
                    </div>
                    <button class="close-button" id="close-chat">✕</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message brad-message">
                        <div class="message-content">
                            <p>Hey there! Welcome to my website. What would you like to know about my career, movies, or life? I'm here to chat! 🎬</p>
                            <span class="message-time">${this.formatTime(new Date())}</span>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-area" id="chat-input-area">
                        <input type="text" id="chat-input" placeholder="Type your message to Brad..." maxlength="500">
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
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 300);
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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
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
            this.showError(error.message || 'Sorry, I had trouble responding. Please try again!');
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

        // Animate new message
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    showLoading(show) {
        this.isLoading = show;
        const loadingIndicator = document.getElementById('loading-indicator');
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        loadingIndicator.style.display = show ? 'block' : 'none';
        sendBtn.disabled = show;
        chatInput.disabled = show;
        
        if (show) {
            sendBtn.textContent = '...';
            chatInput.placeholder = 'Brad is thinking...';
        } else {
            sendBtn.textContent = 'Send';
            chatInput.placeholder = 'Type your message to Brad...';
            chatInput.focus();
        }
    }

    showError(message) {
        this.addMessage(`${message}`, 'brad');
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