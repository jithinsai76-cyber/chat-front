document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');

    // --- NEW: Smart API URL ---
    // This code checks if you are on localhost or a live server
    
    // !! IMPORTANT !!
    // Change this to your REAL backend URL from Render
    const productionApiUrl = 'https://server-ai-3.onrender.com'; 
    const localApiUrl = 'http://localhost:5001';

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = isLocal ? localApiUrl : productionApiUrl;

    console.log(`API is set to: ${API_BASE_URL}`);
    // --- End of NEW ---


    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the page from reloading
        
        const message = messageInput.value.trim();
        if (!message) return; // Don't send empty messages

        // 1. Display the user's message immediately
        displayMessage(message, 'user');

        // 2. Clear the input
        messageInput.value = '';

        // 3. Send the message to the backend and get a response
        try {
            // --- UPDATED: Use the full API_BASE_URL ---
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // --- UPDATED: Added 'mood' as required by your server ---
                body: JSON.stringify({ 
                    message: message,
                    mood: 'neutral' // Your server requires a 'mood'. We'll default to 'neutral'.
                }),
            });

            if (!response.ok) {
                // Try to get a more helpful error from the server
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData ? errorData.reply : `Network response was not ok (${response.status})`;
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            // 4. Display the AI's response
            displayMessage(data.reply, 'ai');

        } catch (error) {
            console.error('Fetch Error:', error);
            // Display the specific error message
            displayMessage(`Sorry, an error occurred: ${error.message}`, 'ai');
        }
    });

    // Function to add a new message to the chat window
    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        
        // This will render newlines correctly
        messageElement.innerText = message; 
        
        chatWindow.appendChild(messageElement);
        
        // Auto-scroll to the bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});