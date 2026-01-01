
import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your key
const apiKey = 'YOUR_GEMINI_API_KEY';

async function main() {
    console.log('Testing Gemini Generation...');
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Generate a JSON object with a key 'message' and value 'Hello'");
        const text = result.response.text();
        console.log('Success! Response:', text);
    } catch (error) {
        console.error('Error Details:', error.message);
    }
}

main();
