import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Dynamic import for OpenAI is handled inside the function to avoid ssr/initial load issues if not needed

export default function Diagnostics() {
    const [testing, setTesting] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<'success' | 'error' | null>(null);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const runDiagnostics = async () => {
        setTesting(true);
        setLogs([]);
        setResult(null);


        let hasSuccess = false;

        try {
            // ==========================================
            // TEST GEMINI
            // ==========================================
            addLog('\n=== TESTING GEMINI ===');
            const geminiKey = localStorage.getItem('gemini_api_key');
            if (geminiKey) {
                addLog(`Checking Gemini Key: ${geminiKey.substring(0, 10)}...`);
                const genAI = new GoogleGenerativeAI(geminiKey);
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    addLog(`Sending request to gemini-1.5-flash...`);
                    const result = await model.generateContent("Say 'OK'");
                    const text = result.response.text();
                    addLog(`✅ Gemini Success! Response: "${text}"`);
                    hasSuccess = true;
                } catch (e: any) {
                    addLog(`❌ Gemini Failed: ${e.message}`);
                }
            } else {
                addLog('⚠️ No Gemini API Key found in settings.');
            }

            // ==========================================
            // TEST OPENAI
            // ==========================================
            addLog('\n=== TESTING OPENAI ===');
            const openaiKey = localStorage.getItem('openai_api_key');
            if (openaiKey) {
                addLog(`Checking OpenAI Key: ${openaiKey.substring(0, 10)}...`);
                try {
                    const { default: OpenAI } = await import('openai');
                    const openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
                    const modelName = localStorage.getItem('openai_model') || 'gpt-4o';

                    addLog(`Sending request to ${modelName}...`);
                    const completion = await openai.chat.completions.create({
                        messages: [{ role: 'user', content: "Say 'OK'" }],
                        model: modelName,
                    });
                    const text = completion.choices[0].message.content;
                    addLog(`✅ OpenAI Success! Response: "${text}"`);
                    hasSuccess = true;
                } catch (e: any) {
                    addLog(`❌ OpenAI Failed: ${e.message}`);
                    if (e.status === 429) addLog('   -> QUOTA EXCEEDED or RATE LIMIT HIT');
                }
            } else {
                addLog('⚠️ No OpenAI API Key found in settings.');
            }

            // ==========================================
            // TEST DIRECT FETCH (No SDK)
            // ==========================================
            addLog('\n=== TESTING DIRECT FETCH (No SDK) ===');
            if (openaiKey) {
                addLog('Attempting direct fetch to https://api.openai.com/v1/models...');
                try {
                    const response = await fetch('https://api.openai.com/v1/models', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${openaiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    addLog(`Fetch Status: ${response.status} ${response.statusText}`);

                    if (!response.ok) {
                        const errorBody = await response.text();
                        addLog(`❌ Direct Fetch Failed Body: ${errorBody.substring(0, 200)}...`);
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    addLog(`✅ Direct Fetch Success! Found ${data.data?.length || 0} models.`);
                    hasSuccess = true; // Mark as success if at least direct fetch works
                } catch (e: any) {
                    addLog(`❌ Direct Fetch Exception: ${e.message}`);
                    if (e.message.includes('Failed to fetch')) {
                        addLog('   -> Likely CORS, Firewall, or Ad-blocker issue.');
                    }
                }
            } else {
                addLog('⚠️ Skipping direct fetch (no key).');
            }

            // ==========================================


            // Final Result Determination
            if (hasSuccess) {
                setResult('success');
            } else {
                setResult('error');
            }

        } catch (error: any) {
            addLog(`\n❌ FATAL ERROR: ${error.message}`);
            setResult('error');
        } finally {
            setTesting(false);
        }
    };

    const copyLogs = () => {
        navigator.clipboard.writeText(logs.join('\n'));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">API Diagnostics</h1>
                <p className="text-gray-500 mt-2">Debug your API connection and quota issues</p>
            </div>

            {/* Run Diagnostics Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <button
                    onClick={runDiagnostics}
                    disabled={testing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {testing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Running Diagnostics...
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5" />
                            Run Full Diagnostics
                        </>
                    )}
                </button>
            </div>

            {/* Result Banner */}
            {result && (
                <div className={`rounded-xl p-6 border-2 ${result === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                    }`}>
                    <div className="flex items-center gap-3">
                        {result === 'success' ? (
                            <>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <h3 className="text-lg font-bold text-green-900">✅ At least one provider is working!</h3>
                                    <p className="text-sm text-green-700">Check the logs below to see which providers succeeded.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <h3 className="text-lg font-bold text-red-900">❌ All Providers Failed</h3>
                                    <p className="text-sm text-red-700">No configured API providers are working. Check quotas or keys.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Logs Display */}
            {logs.length > 0 && (
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-200">Diagnostic Logs</h3>
                        <button
                            onClick={copyLogs}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-medium rounded hover:bg-gray-600 transition-colors"
                        >
                            <Copy className="w-3 h-3" />
                            Copy Logs
                        </button>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                            {logs.join('\n')}
                        </pre>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">📋 How to Use</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Click "Run Full Diagnostics" button above</li>
                    <li>Wait for the test to complete (10-15 seconds)</li>
                    <li>Read the diagnostic logs to see exactly what's failing</li>
                    <li>If you see "QUOTA EXCEEDED", you need a new API key</li>
                    <li>Click "Copy Logs" to share with support if needed</li>
                </ol>
            </div>

            {/* Solution */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-900 mb-3">💡 If Quota Exceeded</h3>
                <div className="text-sm text-amber-800 space-y-2">
                    <p className="font-semibold">You need a new API key:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-900 underline font-semibold">Google AI Studio</a></li>
                        <li>Sign in with a <strong>different Google account</strong> (important!)</li>
                        <li>Click "Create API Key"</li>
                        <li>Copy the new key</li>
                        <li>Go to Settings page and paste it</li>
                        <li>Run diagnostics again - should show ✅ success</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
