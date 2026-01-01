import { useState } from 'react';
import { FileJson, Sparkles, Copy, Check, AlertCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateAcf } from '../lib/openai';

export default function AcfToPhp() {
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            // Validate JSON first
            JSON.parse(jsonInput);

            const data = await generateAcf(jsonInput, 'acf_to_php');
            setResult(data.php);
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                setError('Invalid JSON format. Please check your input.');
            } else {
                setError(err.message || 'An error occurred while converting.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!result) return;
        const filename = 'acf-template.php';
        const blob = new Blob([result], { type: 'text/plain' });
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
                    <h1 className="text-3xl font-bold text-gray-900">ACF to PHP</h1>
                    <p className="text-gray-500 mt-2">Paste your ACF Field Group JSON to generate PHP.</p>
                </div>

                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">ACF JSON Input</span>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='{ "key": "group_...", "fields": [...] }'
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
                            disabled={loading || !jsonInput}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg",
                                loading || !jsonInput
                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    Generating PHP...
                                </>
                            ) : (
                                <>
                                    <FileJson className="w-5 h-5" />
                                    Convert to PHP
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
                            className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
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
                                <FileJson className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-400">Ready to Convert</p>
                            <p className="text-sm mt-2 max-w-xs">Paste your ACF JSON and we'll generate the PHP template.</p>
                        </div>
                    ) : (
                        <pre className="flex-1 p-6 overflow-auto text-sm font-mono text-gray-300 leading-relaxed custom-scrollbar">
                            <code>
                                {result}
                            </code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
