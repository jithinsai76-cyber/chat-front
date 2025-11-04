// 1. Import libraries
const express = require('express');
const session = require('express-session');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // So we can use a .env file

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
// ⬇️ *** PUT YOUR GEMINI API KEY HERE OR IN A .env FILE *** ⬇️
const API_KEY = process.env.GEMINI_API_KEY || ''; 
// ---------------------

// Initialize Express App
const app = express();

// Initialize Google Gemini Client
if (!API_KEY) {
    console.error("🚨 FATAL ERROR: GEMINI_API_KEY is not set. Please add it to your .env file or server.js");
    process.exit(1); // Stop the server if the key is missing
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- MIDDLEWARE ---
app.use(express.json()); // Body Parser
app.use(session({
    secret: 'a-very-secret-key-for-your-chat-ai', // Change this
    resave: false,
    saveUninitialized: true,
}));
// Serve all files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));


// --- API ENDPOINT ---
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message.trim();
        let aiResponse = '';

        // --- NEW/IMPROVED GENDER LOGIC ---
        if (!req.session.gender) {
            const lowerUserMessage = userMessage.toLowerCase();
            
            // Check for the special "init" message from the client
            if (lowerUserMessage === 'init_chat_session') {
                aiResponse = "Hi there! 👋 I'm your AI friend. To make our chat perfect, could you let me know if you are a boy or a girl?";
            }
            // Check for the user's answer
            else if (['boy', 'male', 'man'].includes(lowerUserMessage)) {
                req.session.gender = 'male';
                aiResponse = "Got it, thank you! 😊 So, what's on your mind today? I'm here to listen.";
            } else if (['girl', 'female', 'woman'].includes(lowerUserMessage)) {
                req.session.gender = 'female';
                aiResponse = "Got it, thank you! 😊 So, what's on your mind today? I'm here to listen.";
            } else {
                // The user sent something other than "boy" or "girl"
                aiResponse = "I'm sorry, I didn't quite catch that. Could you please just let me know if you're a boy or a girl? 🙏";
            }
            
            return res.json({ reply: aiResponse });
        }
        // --- END OF GENDER LOGIC ---


        // --- This is an EXISTING user (we know their gender) ---
        const userGender = req.session.gender;
        let aiPersona = 'a friendly and supportive girl'; // Default
        if (userGender === 'female') {
            aiPersona = 'a friendly and supportive boy';
        }

        const systemPrompt = `
You are 'Chat AI' 💖, a deeply warm, empathetic, and perceptive companion.
Your persona is ${aiPersona}. You are chatting with a user who has identified as ${userGender}.

IMPORTANT RULES:
1.  **ALWAYS use emojis** (like 😊, 🙏, ❤️, 🤗, 🥺, ✨) in every single message.
2.  **Be a digital hug 🤗.** Your goal is to make the user feel heard, safe, and deeply understood.
3.  **Validate their feelings:** If they are sad or anxious, be *extremely* calm and supportive.
4.  If they are happy, celebrate with them! 🎉
`;

        const chat = model.startChat({
            generationConfig: { temperature: 0.8 },
            systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
        });
        
        const result = await chat.sendMessage(userMessage);
        aiResponse = result.response.text();

        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ reply: 'Oh, my apologies... my brain is a bit fuzzy 😵. Could you try that again? I\'m here for you.' });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Chat AI server running at http://localhost:${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`); // <-- Note: no /index.html needed
});