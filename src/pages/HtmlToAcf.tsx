import { useState } from 'react';
import { FileCode, Sparkles, Copy, Code2, AlertCircle, Check, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateAcf, type AcfConfig } from '../lib/openai';
import ConfigurationPanel from '../components/ConfigurationPanel';

export default function HtmlToAcf() {
    const [htmlInput, setHtmlInput] = useState('');
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
            // Validate that the input contains HTML tags
            const htmlTagPattern = /<[^>]+>/;
            if (!htmlTagPattern.test(htmlInput)) {
                throw new Error('Invalid input: Please paste valid HTML code with tags (e.g., <div>, <section>, etc.)');
            }

            const data = await generateAcf(htmlInput, 'html', config);
            setResult({
                json: JSON.stringify(data.json, null, 2),
                php: data.php
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred while converting.');
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

    const handleDownload = () => {
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
                    <h1 className="text-3xl font-bold text-gray-900">HTML to ACF</h1>
                    <p className="text-gray-500 mt-2">Paste your HTML structure to generate fields.</p>
                </div>

                <ConfigurationPanel config={config} onChange={setConfig} />

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">HTML Input</span>
                    </div>
                    <textarea
                        value={htmlInput}
                        onChange={(e) => setHtmlInput(e.target.value)}
                        placeholder="<section class='hero'>..."
                        className="flex-1 p-6 resize-none focus:outline-none text-gray-700 placeholder-gray-400 font-mono text-sm leading-relaxed"
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
                            disabled={loading || !htmlInput}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg",
                                loading || !htmlInput
                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    Analyzing HTML...
                                </>
                            ) : (
                                <>
                                    <FileCode className="w-5 h-5" />
                                    Convert to ACF
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
                                onClick={handleDownload}
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
                            <p className="text-lg font-medium text-gray-400">Ready to Convert</p>
                            <p className="text-sm mt-2 max-w-xs">Paste your HTML and we'll extract the fields.</p>
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
