
import OpenAI from 'openai';

const apiKey = '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';

const openai = new OpenAI({
    apiKey: apiKey,
});

async function main() {
    console.log('Testing OpenAI Generation (JSON Mode)...');
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Generate a JSON object with a key "message" and value "Hello".' }],
            model: 'gpt-4o',
            response_format: { type: "json_object" },
        });

        console.log('Success! Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Error Details:');
        if (error instanceof OpenAI.APIError) {
            console.error('Status:', error.status); // e.g. 401
            console.error('Message:', error.message);
            console.error('Code:', error.code);
            console.error('Type:', error.type);
        } else {
            console.error(error);
        }
    }
}

main();
