import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';


export interface AcfConfig {
    locationType: 'page' | 'post' | 'custom';
    pageTemplate?: string;
    useCase: 'component' | 'section' | 'full-page';
}

// Helper function to wait/delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 3000
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error (429)
            if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
                const waitTime = initialDelay * Math.pow(2, i); // Exponential backoff
                console.log(`Rate limited. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${maxRetries})`);
                await delay(waitTime);
                continue;
            }

            // For other errors, throw immediately
            throw error;
        }
    }

    throw lastError;
}

// Gemini specific generation logic
async function generateWithGemini(prompt: string, apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    let lastError: Error | null = null;

    for (const modelName of models) {
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
            });

            const result = await retryWithBackoff(async () => model.generateContent(prompt));
            const response = result.response;
            const text = response.text();

            if (!text) throw new Error('Empty response from Gemini');
            return text;

        } catch (error: any) {
            console.warn(`Gemini model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model if available
        }
    }
    throw lastError || new Error('All Gemini models failed');
}

// Groq specific generation logic


// OpenAI specific generation logic
async function generateWithOpenAI(prompt: string, apiKey: string) {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    // Try gpt-4o first, then fallback to gpt-4-turbo or gpt-3.5-turbo if needed, though gpt-4o is standard now.
    // We'll stick to a single high-quality model default for now, can be configured later.
    const modelName = localStorage.getItem('openai_model') || 'gpt-4o';

    console.log(`Using OpenAI model: ${modelName}`);

    return await retryWithBackoff(async () => {
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: modelName,
                response_format: { type: "json_object" },
            });
            return completion.choices[0].message.content || '';
        } catch (error: any) {
            // Enhanced Error Handling
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('OpenAI Network Error:', error);
                throw new Error(
                    'Network connection failed. This is likely due to a firewall, ad-blocker, or CORS issue preventing access to OpenAI APIs from the browser.\n' +
                    'Try disabling ad-blockers or check your network settings.'
                );
            }
            throw error;
        }
    });
}




export const generateAcf = async (
    prompt: string,
    type: 'text' | 'html' | 'php' | 'acf_to_php',
    config?: AcfConfig
) => {
    // 1. DETERMINE PROVIDER
    const provider = localStorage.getItem('ai_provider') || 'gemini';

    // 2. PREPARE PROMPTS (Common to all providers)
    // Build location rules based on configuration
    const defaultConfig: AcfConfig = config || {
        locationType: 'page',
        useCase: 'component'
    };

    let locationRule = '';
    if (defaultConfig.locationType === 'page') {
        if (defaultConfig.pageTemplate) {
            locationRule = `"param": "page_template", "operator": "==", "value": "${defaultConfig.pageTemplate}"`;
        } else {
            locationRule = `"param": "post_type", "operator": "==", "value": "page"`;
        }
    } else if (defaultConfig.locationType === 'post') {
        locationRule = `"param": "post_type", "operator": "==", "value": "post"`;
    } else {
        locationRule = `"param": "post_type", "operator": "==", "value": "your_custom_post_type"`;
    }

    // Use case complexity guidance
    let complexityGuidance = '';
    if (defaultConfig.useCase === 'component') {
        complexityGuidance = 'Keep it simple with 3-5 focused fields. Avoid complex repeaters unless absolutely necessary.';
    } else if (defaultConfig.useCase === 'section') {
        complexityGuidance = 'Create 5-10 fields with moderate complexity. Use repeaters for lists and collections.';
    } else {
        complexityGuidance = 'Create 10+ fields with complex structure. Use flexible content or multiple repeaters for dynamic layouts.';
    }

    const systemPrompt = `
    You are an expert WordPress developer specializing in Advanced Custom Fields (ACF).
    Your task is to generate valid ACF Field Group JSON and a corresponding PHP template based on the user's input.
    
    CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations.
    
    Output Format:
    Return a JSON object with two keys: "json" and "php".
    
    The "json" key must contain an ARRAY of field groups in this EXACT format:
    [
        {
            "key": "group_[name]",
            "title": "[Group Title]",
            "fields": [
                {
                    "key": "field_[name]",
                    "label": "[Field Label]",
                    "name": "[field_name]",
                    "type": "text|textarea|image|repeater|etc"
                }
            ],
            "location": [
                [
                    {
                        ${locationRule}
                    }
                ]
            ],
            "position": "normal",
            "style": "default",
            "label_placement": "top",
            "instruction_placement": "label",
            "hide_on_screen": ""
        }
    ]
    
    Field Type Rules:
    - For text inputs: "type": "text"
    - For textareas: "type": "textarea"
    - For images: "type": "image", "return_format": "array", "preview_size": "medium", "library": "all"
    - For repeaters: "type": "repeater", "layout": "row" or "table", "sub_fields": [...]
    - For flexible content: "type": "flexible_content", "layouts": [...]
    
    Repeater Fields:
    - Use "layout": "row" for complex repeaters with multiple fields
    - Use "layout": "table" for simple repeaters with 1-2 fields
    - Add "collapsed": "field_[first_field_key]" to show which field to display when collapsed
    - Add "button_label": "Add [Item]" for custom button text
    
    Key Naming:
    - Group keys: "group_[descriptive_name]"
    - Field keys: "field_[descriptive_name]"
    - Field names: snake_case without "field_" prefix
    
    Handling Multiple Sections (CRITICAL):
    - DEFAULT RULE: Create ONE single Field Group for the entire input.
    - **USE TABS**: If the input contains multiple logical sections (e.g., Hero, About, Services), you MUST use **ACF Tabs** to separate them.
    - Structure:
      1. Create a field with "type": "tab", "label": "Section Name", "placement": "top".
      2. Follow it with all fields belonging to that section.
      3. Repeat for next section.
    - **NAMING**: Prefix ALL field names with the section/tab name to prevent collisions (e.g., 'hero_title', 'about_title', 'footer_title').
    - Do NOT create separate field groups. Use tabs within one group.
    
    COMPLEXITY GUIDANCE: ${complexityGuidance}
    
    The "php" key must contain a clean, production-ready PHP template snippet.
    
    PHP CODE STYLE GUIDE (CRITICAL - FOLLOW EXACTLY):
    
    1. **MANDATORY STRUCTURE (Variables First)**:
       - You MUST extract ALL fields using 'get_field()' at the VERY TOP of the file.
       - NEVER call 'get_field()' inside the HTML structure.
       - Group extractions by section using comments (e.g., '// === Hero Section === //').
    
    2. **Strict Escaping Rules**:
       - For Text Headers/Labels: Use 'esc_html( $var )'
       - For Links/Images: Use 'esc_url( $var )'
       - For WYSIWYG/Rich Content: Use 'wp_kses_post( $var )' (NEVER esc_html)
       - For Echoing Variables: Always separate logic and view.
         - Bad: '<?php echo get_field("title"); ?>'
         - Good: '<?php echo esc_html($title); ?>' (where $title was defined at top)
    
    3. **HTML Preservation**:
       - Keep ALL original CSS classes exactly as provided.
       - Maintain the exact nesting structure (divs, sections, spans).
       - Do NOT simplify or "clean up" the HTML unless it's to verify closing tags.
    
    4. **Repeater Loops**:
       - Extract sub-fields at the START of the foreach loop.
       - Example: Inside 'foreach($items as $item)', immediately do '$title = $item["title"];'
       - Use specific variable names, not generic ones.
    
    5. **Control Structure Syntax**:
       - Use 'alternative syntax' for all control structures mixed with HTML.
       - Use '<?php if($var): ?> ... <?php endif; ?>'
       - Use '<?php foreach($list as $item): ?> ... <?php endforeach; ?>'
     
    CRITICAL OUTPUT RULES:
     1. The "json" key (ACF Export) must NOT contain any PHP code. It is for structure only.
     2. The "php" key (Template) must NOT contain raw HTML outside of 'echo' statements or outside PHP tags.
     3. Ensure strictly ONE field group is generated unless specifically asked otherwise.
    
     Return ONLY the JSON object with "json" and "php" keys. No markdown, no backticks, no extra text.
    `;

    let userPrompt = '';
    if (type === 'text') {
        userPrompt = `Generate ACF fields and PHP template for: ${prompt} `;
    } else if (type === 'html') {
        userPrompt = `Analyze this HTML and generate ACF fields to match the content, along with a PHP template that recreates this structure using the fields.

    CRITICAL RULES FOR HTML CONVERSION:
        1. For ALL <p>tags: Use "type": "wysiwyg"(WYSIWYG Editor field)
2. For ALL heading tags(<h1>, <h2>, 3, 4, 5, 6): Use "type": "text"(Text field)
3. For images: Use "type": "image" with proper return format
4. For lists or repeated items: Use "type": "repeater"
5. In the PHP output, use "echo wp_kses_post( $variable );"(ensure variables are defined at top of file)
6. Do NOT use esc_html() - always use wp_kses_post() instead for proper HTML sanitization
        7. ** MULTI - SECTION DETECTED ?** If the HTML has multiple sections(e.g. < section > tags or distinct parts), insert a "type": "tab" field at the start of each section's fields. Prefix field names with the section name.

8. ** HTML PATTERN RECOGNITION **:
           - ** Sections **: Treat matching CSS classes like '.main-banner', '.lift-logos', '.projects-section' as distinct ACf Tabs.
           - ** Sliders **: Look for '.slider-card > .slider' structure.This ALWAYS implies a Repeater field.
           - ** Socials **: Look for '.socials' or lists of links with icons.Treat these as Repeater fields(Icon + Link).
           - ** Buttons **: Look for anchor tags with class '.view-btn'.These should be ACF Link fields.
           - ** Headings **: <h1>, <h2>etc.are almost always ACF Text fields, not WYSIWYG.

        HTML to analyze:
        ${prompt} `;
    } else if (type === 'php') {
        userPrompt = `Analyze this PHP code, extract the ACF fields used, and generate a valid ACF Field Group JSON for them.For the PHP output, just return the original PHP code cleaned up if necessary.\n\n${prompt} `;
    } else if (type === 'acf_to_php') {
        userPrompt = `Analyze this ACF Field Group JSON and generate a clean, production - ready PHP template snippet that implements these fields.Include proper checks(if/while), escaping, and comments.For the JSON output, just return the original JSON.\n\n${prompt} `;
    }

    const fullPrompt = `${systemPrompt} \n\n${userPrompt} `;

    // 3. EXECUTE REQUEST
    let rawText = '';

    try {

        if (provider === 'openai') {
            const apiKey = localStorage.getItem('openai_api_key');
            if (!apiKey) throw new Error('Please set your OpenAI API Key in Settings');
            rawText = await generateWithOpenAI(fullPrompt, apiKey);
        } else {
            // Default to Gemini
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error('Please set your Gemini API Key in Settings');
            rawText = await generateWithGemini(fullPrompt, apiKey);
        }

        // 4. PARSE RESPONSE
        // Clean up the response - remove markdown code blocks if present
        let text = rawText.trim();
        if (text.startsWith('```json')) {
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n?/g, '');
        }
        text = text.trim();

        // Parse and return JSON
        try {
            return JSON.parse(text);
        } catch (parseError: any) {
            console.error('JSON parse error:', parseError.message);
            console.error('Text received:', text.substring(0, 200));
            throw new Error(`Invalid JSON response from ${provider}: ${parseError.message}`);
        }

    } catch (error: any) {
        throw new Error(
            `⏱️ AI Generation Failed (${provider.toUpperCase()})\n\n` +
            `Error: ${error.message}\n\n` +
            '💡 Tips:\n' +
            '• Check your API key in Settings\n' +
            '• Check your internet connection\n' +
            '• Try switching providers if persistent'
        );
    }
};
