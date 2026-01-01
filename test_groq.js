
// Replace with your key
const apiKey = 'YOUR_GROQ_API_KEY';
const model = 'llama-3.3-70b-versatile';

async function main() {
    console.log('Testing Groq Generation...');
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: "Generate a JSON object with a key 'message' and value 'Hello'" }],
                model: model,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Groq API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Success! Response:', data.choices[0]?.message?.content);
    } catch (error) {
        console.error('Error Details:', error.message);
    }
}

main();
