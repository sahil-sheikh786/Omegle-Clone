const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const skipButton = document.getElementById('skip');

let typingTimeout;

function autoScroll() {
    messages.scrollTop = messages.scrollHeight;
}

socket.on('status', (message) => {
    // Remove existing status messages
    document.querySelectorAll('.status').forEach(statusMessage => {
        statusMessage.remove();
    });

    const item = document.createElement('li');
    item.textContent = message;
    item.classList.add('status'); // Add a class to identify status messages
    messages.appendChild(item);
    autoScroll();
});

socket.on('message', (message) => {
    const item = document.createElement('li');
    item.textContent = `Stranger: ${message}`;
    messages.appendChild(item);
    autoScroll();
});

socket.on('typing', () => {
    let typingMessage = document.getElementById('typing-message');
    if (!typingMessage) {
        typingMessage = document.createElement('li');
        typingMessage.id = 'typing-message';
        typingMessage.textContent = 'Stranger is typing...';
        messages.appendChild(typingMessage);
        autoScroll();
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (typingMessage) {
            typingMessage.remove();
        }
    }, 1000);
});

socket.on('clearMessages', () => {
    messages.innerHTML = ''; // Clear all messages
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('message', input.value);
        const item = document.createElement('li');
        item.textContent = `You: ${input.value}`;
        messages.appendChild(item);
        input.value = '';
        autoScroll();
        input.focus();
    }
});

input.addEventListener('input', () => {
    socket.emit('typing');
});

skipButton.addEventListener('click', () => {
    if (skipButton.textContent === 'Skip') {
        skipButton.textContent = 'Skip?';
    } else if (skipButton.textContent === 'Skip?') {
        socket.emit('skip');
        skipButton.textContent = 'Skip'; // Reset the button text after skip
    } else if (skipButton.textContent === 'New') {
        socket.emit('new');
    }
});

socket.on('changeButton', (newText) => {
    console.log(`Button text changing to ${newText}`);
    skipButton.textContent = newText;
    if (newText === 'New') {
        // Handle any additional logic when the button is set to "New"
    }
});
