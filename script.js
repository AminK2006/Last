// Message data - starts with sample messages that show realistic grouping (from server.js style)
let messages = [
    {
        text: "Hey! Are you free this weekend?",
        time: "2:14 PM",
        type: "sent"
    },
    {
        text: "Yeah, what's up? 😊", 
        time: "2:15 PM",
        type: "received"
    },
    {
        text: "Want to check out that new coffee place downtown?",
        time: "2:15 PM",
        type: "sent"
    },
    {
        text: "The one that just opened? I heard it's really good!",
        time: "2:16 PM",
        type: "received"
    },
    {
        text: "That's the one! How about Saturday morning?",
        time: "2:17 PM", 
        type: "sent"
    },
    {
        text: "Perfect! Let's meet there at 10:30? ☕️",
        time: "2:18 PM",
        type: "received"
    }
];

// App configuration
let config = {
    contactName: "Contact",
    notificationCount: 0
};

// Global variables for interaction handling
let currentEditIndex = -1;
let touchStartX = 0;
let touchStartY = 0;
let isScrolling = false;
let currentMessageEl = null;
let longPressTimer;
let isConfigMode = false;
let tapCount = 0;
let tapTimer = null;

/**
 * Toggle checkbox state
 */
function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.classList.toggle('checked');
}

/**
 * Update contact information and notification badge
 */
function updateContactInfo() {
    document.getElementById('contactName').textContent = config.contactName;
    const notificationEl = document.getElementById('notificationCount');
    notificationEl.textContent = config.notificationCount;
    
    // Hide notification badge if count is 0
    if (config.notificationCount === 0) {
        notificationEl.style.display = 'none';
    } else {
        notificationEl.style.display = 'inline-block';
    }
}

/**
 * Render all messages to the DOM
 */
function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((message, index) => {
        if (message.type === 'date') {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-separator';
            dateDiv.textContent = message.text;
            container.appendChild(dateDiv);
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        // Create message bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = message.text;
        
        // Add heart reaction if present
        if (message.hasHeart) {
            const heartDiv = document.createElement('div');
            heartDiv.className = 'heart-reaction';
            heartDiv.textContent = '💙';
            bubbleDiv.appendChild(heartDiv);
        }
        
        // Create timestamp
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = message.time;
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timestampDiv);

        // Add touch event listeners for swipe gestures
        messageDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
        messageDiv.addEventListener('touchmove', handleTouchMove, { passive: false });
        messageDiv.addEventListener('touchend', handleTouchEnd, { passive: true });

        container.appendChild(messageDiv);
    });

    // Auto-scroll to bottom
    scrollToBottom();
}

/**
 * Handle touch start for swipe gestures
 */
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
    currentMessageEl = e.currentTarget;
}

/**
 * Handle touch move for swipe gestures
 */
function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;

    // Detect if this is a vertical scroll
    if (Math.abs(diffY) > Math.abs(diffX)) {
        isScrolling = true;
        return;
    }

    // Prevent horizontal scrolling during swipe
    if (Math.abs(diffX) > 10) {
        e.preventDefault();
    }

    // Show timestamp on horizontal swipe
    if (Math.abs(diffX) > 30 && !isScrolling && currentMessageEl) {
        currentMessageEl.classList.add('show-timestamp');
        
        if (currentMessageEl.classList.contains('sent')) {
            currentMessageEl.classList.add('shifted-left');
        } else {
            currentMessageEl.classList.add('shifted-right');
        }
    }
}

/**
 * Handle touch end for swipe gestures
 */
function handleTouchEnd(e) {
    if (currentMessageEl) {
        // Auto-hide timestamp after 2.5 seconds
        setTimeout(() => {
            currentMessageEl.classList.remove('show-timestamp', 'shifted-left', 'shifted-right');
        }, 2500);
    }

    // Reset touch tracking
    touchStartX = 0;
    touchStartY = 0;
    isScrolling = false;
    currentMessageEl = null;
}

/**
 * Show edit panel for adding new messages
 */
function showEditPanel() {
    isConfigMode = false;
    showMessageMode();
    currentEditIndex = -1;
    
    // Reset form
    document.getElementById('messageText').value = '';
    document.getElementById('messageTime').value = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', 
        minute: '2-digit'
    });
    document.getElementById('messageSender').value = 'sent';
    document.getElementById('heartReaction').classList.remove('checked');
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Show panel
    document.getElementById('editPanel').classList.add('show');
}

/**
 * Show configuration mode
 */
function showConfigMode() {
    isConfigMode = true;
    document.getElementById('panelTitle').textContent = 'Settings';
    document.getElementById('configContactName').value = config.contactName;
    document.getElementById('configNotificationCount').value = config.notificationCount;
    
    // Show config fields, hide message fields
    document.getElementById('configSection').style.display = 'flex';
    document.getElementById('configSection2').style.display = 'flex';
    document.getElementById('messageSection').style.display = 'none';
    document.getElementById('messageSection2').style.display = 'none';
    document.getElementById('messageSection3').style.display = 'none';
    document.getElementById('messageSection4').style.display = 'none';
    document.getElementById('messageSection5').style.display = 'none';
    document.getElementById('configBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save Settings';
}

/**
 * Show message editing mode
 */
function showMessageMode() {
    isConfigMode = false;
    document.getElementById('panelTitle').textContent = currentEditIndex >= 0 ? 'Edit Message' : 'Add Message';
    
    // Show message fields, hide config fields
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('configSection2').style.display = 'none';
    document.getElementById('messageSection').style.display = 'flex';
    document.getElementById('messageSection2').style.display = 'flex';
    document.getElementById('messageSection3').style.display = 'flex';
    document.getElementById('messageSection4').style.display = 'flex';
    document.getElementById('messageSection5').style.display = 'flex';
    document.getElementById('configBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').textContent = 'Save';
}

/**
 * Hide edit panel
 */
function hideEditPanel() {
    document.getElementById('editPanel').classList.remove('show');
}

/**
 * Edit existing message
 */
function editMessage(index) {
    const message = messages[index];
    if (message.type === 'date') return;

    currentEditIndex = index;
    showMessageMode();
    
    // Populate form with message data
    document.getElementById('messageText').value = message.text;
    document.getElementById('messageTime').value = message.time;
    document.getElementById('messageSender').value = message.type;
    
    if (message.hasHeart) {
        document.getElementById('heartReaction').classList.add('checked');
    } else {
        document.getElementById('heartReaction').classList.remove('checked');
    }
    
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'block';
    