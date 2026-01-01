import { useState } from 'react';
import { Wand2, Sparkles, Copy, Check, AlertCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateAcf, type AcfConfig } from '../lib/openai';
import ConfigurationPanel from '../components/ConfigurationPanel';

export default function Generator() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'json' | 'php'>('json');
    const [result, setResult] = useState<{ json: any; php: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [config, setConfig] = useState<AcfConfig>({
        locationType: 'page',
        useCase: 'component'
    });

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await generateAcf(prompt, 'text', config);
            setResult({
                json: JSON.stringify(data.json, null, 2),
                php: data.php
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const content = activeTab === 'json' ? result.json : result.php;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadJson = () => {
        if (!result) return;
        const content = activeTab === 'json' ? result.json : result.php;
        const filename = activeTab === 'json' ? 'acf-fields.json' : 'acf-template.php';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
            {/* Input Section */}
            <div className="flex flex-col h-full space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Generator</h1>
                    <p className="text-gray-500 mt-2">Describe your section and let AI build the fields.</p>
                </div>

                <ConfigurationPanel config={config} onChange={setConfig} />

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Input Prompt</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPrompt('Hero section with title, subtitle, image, and CTA button')}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                            >
                                Example 1
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A testimonial slider with client name, photo, review text, and star rating..."
                        className="flex-1 p-6 resize-none focus:outline-none text-gray-700 placeholder-gray-400 text-lg leading-relaxed"
                    />

                    {error && (
                        <div className="px-6 py-2 bg-red-50 text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg",
                                loading || !prompt
                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate Assets
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Output Section */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between h-[88px]">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('json')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'json'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            ACF JSON
                        </button>
                        <button
                            onClick={() => setActiveTab('php')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'php'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            PHP Template
                        </button>
                    </div>
                    {result && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={handleDownloadJson}
                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden flex flex-col relative group">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Code2 className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-400">Ready to Generate</p>
                            <p className="text-sm mt-2 max-w-xs">Enter a prompt and hit generate to see the magic happen.</p>
                        </div>
                    ) : (
                        <pre className="flex-1 p-6 overflow-auto text-sm font-mono text-gray-300 leading-relaxed custom-scrollbar">
                            <code>
                                {activeTab === 'json' ? result.json : result.php}
                            </code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}

function Code2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}
