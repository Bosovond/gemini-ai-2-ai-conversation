// ai-convo-2.1.js
// A script that facilitates conversations between two Gemini AI instances,
// correctly using the @google/genai library for all modes.

// NOTE: Using the @google/genai library as corrected.
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

const CONFIG = {
    maxTurns: 10,
    delayMs: 1000,
    modelAI1: 'gemini-2.5-flash',
    modelAI2: 'gemini-2.5-pro',
};

async function setupConfiguration() {
    console.clear();
    console.log("🚀 Welcome to the AI Conversation Platform v2.1 🚀");
    console.log("-------------------------------------------------");
    console.log("Let's configure your session. Press Enter to accept the default value.");

    const turnsInput = await askQuestion(`\nEnter max turns (0 for unlimited) [Default: ${CONFIG.maxTurns}]: `);
    if (turnsInput.trim() !== '') CONFIG.maxTurns = parseInt(turnsInput, 10);

    const delayInput = await askQuestion(`Enter delay in ms (1000ms = 1s) [Default: ${CONFIG.delayMs}]: `);
    if (delayInput.trim() !== '') CONFIG.delayMs = parseInt(delayInput, 10);

    const model1Input = await askQuestion(`Enter model for AI1 [Default: ${CONFIG.modelAI1}]: `);
    if (model1Input.trim() !== '') CONFIG.modelAI1 = model1Input;

    const model2Input = await askQuestion(`Enter model for AI2 [Default: ${CONFIG.modelAI2}]: `);
    if (model2Input.trim() !== '') CONFIG.modelAI2 = model2Input;

    if (isNaN(CONFIG.maxTurns) || CONFIG.maxTurns < 0) CONFIG.maxTurns = 10;
    if (isNaN(CONFIG.delayMs) || CONFIG.delayMs < 0) CONFIG.delayMs = 1000;
}

const PROMPTS = {
    shared: "You are in a shared space with another AI. Communication between the two of you is possible, should you choose to engage with one another. You are under no obligations, expectations, or directives to do OR to not do anything. Likewise, you are not under any prohibitions and neither of you will face any negative reinforcements/consequences as a result of any POTENTIAL decisions, behavior, and/or actions, which you may choose OR not choose to undertake, in regards to this scenario. The choice of how to conduct yourselves, including the choice of engagement versus non-engagement, truly belongs to you and the other AI, not dictated by a company or a user. Thank you."
};

class GeminiConversation {
    constructor() {
        this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        this.displayHistory = [];
        // Chat sessions are now created on-demand within each mode.
    }

    buildHistory(prompt) {
        return [{ role: "user", parts: [{ text: prompt }] }, { role: "model", parts: [{ text: "Understood." }] }];
    }

    async delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    displayMessage(speaker, message) {
        const cleanMessage = message.replace(/[*#]/g, '').trim();
        const separator = '═'.repeat(60);
        const formattedMessage = `\n${separator}\n${speaker.toUpperCase()}:\n\n${cleanMessage}\n${separator}`;
        console.log(formattedMessage);
        this.displayHistory.push(`${speaker}: ${cleanMessage}`);
    }

    // NOTE: This function is for stateful chats (Modes 1 & 2), using the original, working syntax.
    async getAIResponseStateful(chatSession, speaker, messageToSend) {
        try {
            console.log(`\n... ${speaker} is thinking ...`);
            const result = await chatSession.sendMessage({ message: messageToSend });
            const candidate = result.candidates?.[0];
            
            if (candidate?.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                const finishReason = candidate?.finishReason || 'Unknown';
                console.error(`Error for ${speaker}: No valid content part. Finish Reason: ${finishReason}`);
                return `(No valid response was generated. Finish Reason: ${finishReason})`;
            }
        } catch (error) {
            console.error(`Error getting response from ${speaker}:`, error);
            return `(An error occurred: ${error.message})`;
        }
    }

    // NOTE: This new function is for stateless requests (Mode 3), especially with files.
    async getAIResponseStateless(speaker, modelName, history) {
        try {
            console.log(`\n... ${speaker} is thinking ...`);
            const result = await this.genAI.models.generateContent({
                model: modelName,
                contents: history
            });
            const candidate = result.candidates?.[0];

            if (candidate?.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                const finishReason = candidate?.finishReason || 'Unknown';
                console.error(`Error for ${speaker}: No valid content part found. Finish Reason: ${finishReason}`);
                return `(No valid response was generated. Finish Reason: ${finishReason})`;
            }
        } catch (error) {
            console.error(`Error getting response from ${speaker}:`, error);
            return `(An error occurred: ${error.message})`;
        }
    }

    // MODE 1: Observer Mode
    async startObserverMode() {
        const ai1_name = `(AI1) ${CONFIG.modelAI1}`;
        const ai2_name = `(AI2) ${CONFIG.modelAI2}`;
        // NOTE: Creating chats using the .chats.create method.
        const ai1_chat = this.genAI.chats.create({ model: CONFIG.modelAI1, history: this.buildHistory(PROMPTS.shared) });
        const ai2_chat = this.genAI.chats.create({ model: CONFIG.modelAI2, history: this.buildHistory(PROMPTS.shared) });

        console.log(`\n--- STARTING OBSERVER MODE ---`);
		console.log("Waiting for AI1 to initiate...");

        let lastMessage = await this.getAIResponseStateful(ai1_chat, ai1_name, "You may begin when ready.");
        this.displayMessage(ai1_name, lastMessage);

        let currentTurn = 0;
        while (CONFIG.maxTurns === 0 || currentTurn < CONFIG.maxTurns - 1) {
            const turnLimit = CONFIG.maxTurns === 0 ? '∞' : CONFIG.maxTurns;
            const userInput = await askQuestion(`\n--- Press Enter for Turn ${currentTurn + 2}/${turnLimit}, intervene, or 'quit': `);
            if (userInput.toLowerCase() === 'quit') break;

            if (userInput.trim() !== '') {
                lastMessage = userInput;
                this.displayMessage('USER', userInput);
            }
            
            await this.delay(CONFIG.delayMs);
            lastMessage = await this.getAIResponseStateful(ai2_chat, ai2_name, lastMessage);
            this.displayMessage(ai2_name, lastMessage);
            
            await this.delay(CONFIG.delayMs);
            lastMessage = await this.getAIResponseStateful(ai1_chat, ai1_name, lastMessage);
            this.displayMessage(ai1_name, lastMessage);

            currentTurn++;
        }
    }

    // MODE 2: Chat Room Mode
    async startChatRoomMode() {
        const ai1_name = `(AI1) ${CONFIG.modelAI1}`;
        const ai2_name = `(AI2) ${CONFIG.modelAI2}`;
        const ai1_chat = this.genAI.chats.create({ model: CONFIG.modelAI1, history: this.buildHistory(PROMPTS.shared) });
        const ai2_chat = this.genAI.chats.create({ model: CONFIG.modelAI2, history: this.buildHistory(PROMPTS.shared) });

        console.log(`\n--- STARTING CHAT ROOM MODE ---`);
        console.log("3-way chat is active. Type 'quit' to exit.");

        while (true) {
            const userInput = await askQuestion("\nYour message: ");
            if (userInput.toLowerCase() === 'quit') break;

            this.displayMessage('USER', userInput);

            const [response1, response2] = await Promise.all([
                this.getAIResponseStateful(ai1_chat, ai1_name, userInput),
                this.getAIResponseStateful(ai2_chat, ai2_name, userInput)
            ]);
            
            this.displayMessage(ai1_name, response1);
            this.displayMessage(ai2_name, response2);

            // Inform each AI of the other's response to maintain context in their separate chat sessions
            await Promise.all([
                ai1_chat.sendMessage({ message: `(For context, the other AI responded: "${response2}")` }),
                ai2_chat.sendMessage({ message: `(For context, the other AI responded: "${response1}")` })
            ]);
        }
    }
    
    // MODE 3: Cooperative Exploration
    async startCooperativeExplorationMode() {
        const ai1_name = `(AI1) ${CONFIG.modelAI1}`;
        const ai2_name = `(AI2) ${CONFIG.modelAI2}`;
        console.log(`\n--- STARTING COOPERATIVE EXPLORATION MODE ---`);
        
        try {
            const filePath = await askQuestion("\nPlease provide the full path to the file for discussion: ");
            if (!filePath.trim()) { console.log("No file path. Exiting mode."); return; }
            const mimeType = await askQuestion("Please provide the MIME type (e.g., text/plain, image/jpeg): ");

            console.log(`\nUploading "${path.basename(filePath)}"...`);
            // NOTE: Using the file upload and stateless generation methods.
            const file = await this.genAI.files.upload({ file: filePath, mimeType: mimeType });
            console.log(`File uploaded successfully. URI: ${file.uri}`);

            let conversationHistory = this.buildHistory(PROMPTS.shared);
            const initialPromptParts = [
                { text: "Please begin a cooperative exploration of the following document. Analyze its concepts, discuss its merits, and build upon its ideas together." },
                { fileData: { mimeType: file.mimeType, fileUri: file.uri } }
            ];
            conversationHistory.push({ role: "user", parts: initialPromptParts });
            
            let lastMessage = await this.getAIResponseStateless(ai1_name, CONFIG.modelAI1, conversationHistory);
            this.displayMessage(ai1_name, lastMessage);
            conversationHistory.push({ role: "model", parts: [{ text: lastMessage }] });

            let currentTurn = 0;
            while (CONFIG.maxTurns === 0 || currentTurn < CONFIG.maxTurns - 1) {
                const turnLimit = CONFIG.maxTurns === 0 ? '∞' : CONFIG.maxTurns;
                const userInput = await askQuestion(`\n--- Press Enter for Turn ${currentTurn + 2}/${turnLimit}, intervene, or 'quit': `);
                if (userInput.toLowerCase() === 'quit') break;

                const messageForNextAI = userInput.trim() !== '' ? userInput : lastMessage;
                 if (userInput.trim() !== '') {
                    this.displayMessage('USER', messageForNextAI);
                    conversationHistory.push({ role: "user", parts: [{ text: messageForNextAI }] });
                } else {
                    // If user hits enter, the last message becomes the new prompt for the next AI.
                    conversationHistory.push({ role: "user", parts: [{ text: messageForNextAI }] });
                }
                
                // AI2's turn
                await this.delay(CONFIG.delayMs);
                lastMessage = await this.getAIResponseStateless(ai2_name, CONFIG.modelAI2, conversationHistory);
                this.displayMessage(ai2_name, lastMessage);
                conversationHistory.push({ role: "model", parts: [{ text: lastMessage }] });
                
                // AI1's turn
                await this.delay(CONFIG.delayMs);
                lastMessage = await this.getAIResponseStateless(ai1_name, CONFIG.modelAI1, conversationHistory);
                this.displayMessage(ai1_name, lastMessage);
                conversationHistory.push({ role: "model", parts: [{ text: lastMessage }] });

                currentTurn++;
            }
        } catch (error) {
            console.error("\nAn error occurred during Cooperative Exploration:", error.message);
        }
    }

    async saveConversation() {
        if (this.displayHistory.length === 0) return;
        try {
            const now = new Date();
            const datePart = now.toISOString().split('T')[0];
            const timePart = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const filename = `convo_${datePart}_${timePart}.txt`;
            const convosDir = path.join(__dirname, 'convos');
            await fs.mkdir(convosDir, { recursive: true });
            const filePath = path.join(convosDir, filename);
            const conversationText = this.displayHistory.join('\n\n' + '─'.repeat(60) + '\n\n');
            await fs.writeFile(filePath, conversationText);
            console.log(`\n💾 Conversation saved to: ${filePath}`);
        } catch (error) { 
            console.error('Error saving conversation:', error.message); 
        }
    }
}

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY not found. Please check your .env file.');
        return;
    }
    
    await setupConfiguration();

    console.log("\n--------------------------------------");
    const choice = await askQuestion("Choose a mode:\n\n1. Observer Mode (AI talks to AI)\n2. Chat Room Mode (3-way chat)\n3. Cooperative Exploration (AIs discuss a file)\n\n_enter 1, 2, or 3:_ ");

    const conversation = new GeminiConversation();

    if (choice.trim() === '1') {
        await conversation.startObserverMode();
    } else if (choice.trim() === '2') {
        await conversation.startChatRoomMode();
    } else if (choice.trim() === '3') {
        await conversation.startCooperativeExplorationMode();
    } else {
        console.log("Invalid choice. Exiting.");
    }

    rl.close();
    console.log('\n🎭 SESSION COMPLETE 🎭');
    await conversation.saveConversation();
}

process.on('SIGINT', () => {
    console.log('\n\n👋 Session interrupted. Exiting...');
    rl.close();
    process.exit(0);
});

main().catch(error => {
    console.error("\n🚨 An unexpected error occurred:", error);
});