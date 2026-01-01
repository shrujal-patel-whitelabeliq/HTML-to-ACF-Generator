
const apiKey = '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';

async function checkModels() {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        console.log('Successfully connected!');

        // Filter for chat models
        const chatModels = data.data.filter(m => m.id.includes('gpt'));
        console.log('Available GPT Models:');
        chatModels.forEach(m => console.log(`- ${m.id}`));
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

checkModels();
