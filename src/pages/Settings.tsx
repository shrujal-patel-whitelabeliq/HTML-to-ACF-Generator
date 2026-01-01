import { useState, useEffect } from 'react';
import { Save, Key, ShieldCheck, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';


type Provider = 'gemini' | 'openai';

export default function Settings() {
    const [provider, setProvider] = useState<Provider>('gemini');

    // Gemini State
    const [apiKey, setApiKey] = useState('');



    // OpenAI State
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [openaiModel, setOpenaiModel] = useState('gpt-4o');

    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        // Load saved settings
        const savedProvider = localStorage.getItem('ai_provider') as Provider;
        if (savedProvider) setProvider(savedProvider);

        const key = localStorage.getItem('gemini_api_key');
        if (key) setApiKey(key);



        const oKey = localStorage.getItem('openai_api_key');
        if (oKey) setOpenaiApiKey(oKey);

        const oModel = localStorage.getItem('openai_model');
        if (oModel) setOpenaiModel(oModel);
    }, []);

    const handleSave = () => {
        localStorage.setItem('ai_provider', provider);

        if (provider === 'gemini') {
            localStorage.setItem('gemini_api_key', apiKey);
        } else {
            localStorage.setItem('openai_api_key', openaiApiKey);
            localStorage.setItem('openai_model', openaiModel);
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);
        setTestMessage('');

        try {
            if (provider === 'gemini') {
                if (!apiKey) throw new Error('Please enter an API key first');

                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent("Say 'test successful' in 2 words");
                const text = result.response.text();

                setTestResult('success');
                setTestMessage(`✅ Gemini is working! Response: "${text}"`);

            } else {
                // Test OpenAI
                if (!openaiApiKey) throw new Error('Please enter an OpenAI API key first');

                // Dynamic import to avoid issues if package isn't loaded yet
                const { default: OpenAI } = await import('openai');
                const openai = new OpenAI({ apiKey: openaiApiKey, dangerouslyAllowBrowser: true });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: "Say 'test successful' in 2 words" }],
                    model: openaiModel,
                });
                const text = completion.choices[0].message.content;

                setTestResult('success');
                setTestMessage(`✅ OpenAI is working! Response: "${text}"`);
            }
        } catch (error: any) {
            setTestResult('error');
            setTestMessage(`❌ Error: ${error.message}`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-2">Manage your AI provider and preferences.</p>
            </div>

            {/* Provider Selection */}
            <div className="bg-gray-100/50 rounded-xl p-1.5 border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setProvider('gemini')}
                        className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${provider === 'gemini'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 scale-[1.02]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <Key className={`w-4 h-4 ${provider === 'gemini' ? 'fill-current' : ''}`} />
                        Gemini (Google)
                    </button>

                    <button
                        onClick={() => setProvider('openai')}
                        className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${provider === 'openai'
                            ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5 scale-[1.02]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                            }`}
                    >
                        <ShieldCheck className={`w-4 h-4 ${provider === 'openai' ? 'fill-current' : ''}`} />
                        OpenAI (GPT-4o)
                    </button>
                </div>
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${provider === 'gemini' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                            {provider === 'gemini' ? <Key className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {provider === 'gemini' ? 'Gemini Configuration' : 'OpenAI Configuration'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {provider === 'gemini'
                                    ? 'Enter your Google AI Studio API key.'
                                    : 'Enter your OpenAI API key.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {provider === 'gemini' ? (
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                                {apiKey && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : provider === 'openai' ? (
                        <>
                            <div>
                                <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                                    OpenAI API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        id="openaiApiKey"
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    />
                                    {openaiApiKey && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="openaiModel" className="block text-sm font-medium text-gray-700 mb-1">
                                    Model
                                </label>
                                <select
                                    id="openaiModel"
                                    value={openaiModel}
                                    onChange={(e) => setOpenaiModel(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="gpt-4o">GPT-4o (Best)</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                                </select>
                            </div>
                        </>
                    ) : null}

                    {/* Test Result */}
                    {testResult && (
                        <div className={`p-4 rounded-lg border ${testResult === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                {testResult === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <p className={`text-sm ${testResult === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {testMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 gap-3">
                        <button
                            onClick={testConnection}
                            disabled={testing || (provider === 'gemini' && !apiKey) || (provider === 'openai' && !openaiApiKey)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Test Connection
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-lg shadow-sm transition-all focus:ring-4 ${provider === 'gemini'
                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-100'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-100'
                                }`}
                        >
                            <Save className="w-4 h-4" />
                            {saved ? 'Saved!' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            {provider === 'openai' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-green-900 mb-3">🧠 OpenAI GPT-4o</h3>
                    <div className="text-sm text-green-800 space-y-2">
                        <p>The industry standard for reasoning and code generation.</p>
                        <p>Make sure you have a valid API key with credits.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-amber-900 mb-2">⚠️ API Quota Limits</h3>
                            <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                                <li>15 requests per minute</li>
                                <li>1,500 requests per day</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
