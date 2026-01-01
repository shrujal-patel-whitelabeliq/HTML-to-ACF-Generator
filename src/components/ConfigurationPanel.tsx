import { ChevronDown, Info, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export interface AcfConfig {
    locationType: 'page' | 'post' | 'custom';
    pageTemplate?: string;
    useCase: 'component' | 'section' | 'full-page';
}

interface ConfigurationPanelProps {
    config: AcfConfig;
    onChange: (config: AcfConfig) => void;
}

export default function ConfigurationPanel({ config, onChange }: ConfigurationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateConfig = (updates: Partial<AcfConfig>) => {
        onChange({ ...config, ...updates });
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200/80 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/60 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Settings2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Configuration Options</span>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                            Optional
                        </span>
                    </div>
                </div>
                <div className={cn(
                    "transition-transform duration-300",
                    isExpanded && "rotate-180"
                )}>
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                </div>
            </button>

            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-5 border-t border-gray-200/50 space-y-6 bg-white/40">
                    {/* Location Rules Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                            <h3 className="text-sm font-bold text-gray-900">Location Rules</h3>
                            <div className="group relative">
                                <Info className="w-4 h-4 text-indigo-400 cursor-help hover:text-indigo-600 transition-colors" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="font-semibold mb-1">WordPress Location</div>
                                    Define where these ACF fields should appear in your WordPress site
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pl-3">
                            {/* Post Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Post Type
                                </label>
                                <select
                                    value={config.locationType}
                                    onChange={(e) => updateConfig({ locationType: e.target.value as AcfConfig['locationType'] })}
                                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-gray-300 font-medium text-gray-700"
                                >
                                    <option value="page">📄 Page</option>
                                    <option value="post">📝 Post</option>
                                    <option value="custom">⚙️ Custom Post Type</option>
                                </select>
                            </div>

                            {/* Page Template */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Page Template <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={config.pageTemplate || ''}
                                    onChange={(e) => updateConfig({ pageTemplate: e.target.value })}
                                    placeholder="e.g., page-hero.php or default"
                                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400 bg-white hover:border-gray-300"
                                />
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Leave empty to apply to all templates
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Use Case Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                            <h3 className="text-sm font-bold text-gray-900">Use Case Focus</h3>
                            <div className="group relative">
                                <Info className="w-4 h-4 text-purple-400 cursor-help hover:text-purple-600 transition-colors" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="font-semibold mb-1">Field Complexity</div>
                                    Controls the number and complexity of generated ACF fields
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 pl-3">
                            {/* Single Component */}
                            <label className={cn(
                                "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                config.useCase === 'component'
                                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50"
                            )}>
                                {config.useCase === 'component' && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
                                )}
                                <input
                                    type="radio"
                                    name="useCase"
                                    value="component"
                                    checked={config.useCase === 'component'}
                                    onChange={(e) => updateConfig({ useCase: e.target.value as AcfConfig['useCase'] })}
                                    className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <div className="flex-1 relative z-10">
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        🎯 Single Component
                                        {config.useCase === 'component' && (
                                            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Active</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Hero section, card, button, etc. • <span className="font-semibold">3-5 focused fields</span>
                                    </div>
                                </div>
                            </label>

                            {/* Template Section */}
                            <label className={cn(
                                "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                config.useCase === 'section'
                                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50"
                            )}>
                                {config.useCase === 'section' && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
                                )}
                                <input
                                    type="radio"
                                    name="useCase"
                                    value="section"
                                    checked={config.useCase === 'section'}
                                    onChange={(e) => updateConfig({ useCase: e.target.value as AcfConfig['useCase'] })}
                                    className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <div className="flex-1 relative z-10">
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        📋 Template Section
                                        {config.useCase === 'section' && (
                                            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Active</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Services page, team section, etc. • <span className="font-semibold">5-10 fields with repeaters</span>
                                    </div>
                                </div>
                            </label>

                            {/* Full Page Layout */}
                            <label className={cn(
                                "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                                config.useCase === 'full-page'
                                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50"
                            )}>
                                {config.useCase === 'full-page' && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
                                )}
                                <input
                                    type="radio"
                                    name="useCase"
                                    value="full-page"
                                    checked={config.useCase === 'full-page'}
                                    onChange={(e) => updateConfig({ useCase: e.target.value as AcfConfig['useCase'] })}
                                    className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <div className="flex-1 relative z-10">
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        🚀 Full Page Layout
                                        {config.useCase === 'full-page' && (
                                            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Active</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Complete homepage, landing page, etc. • <span className="font-semibold">10+ fields with flexible content</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
