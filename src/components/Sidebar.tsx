import { NavLink } from 'react-router-dom';
import { Wand2, FileCode, Code2, Settings, LayoutDashboard, FileJson, Sparkles, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { to: '/', icon: Wand2, label: 'Generator', gradient: 'from-indigo-500 to-purple-600' },
    { to: '/html-to-acf', icon: FileCode, label: 'HTML to ACF', gradient: 'from-blue-500 to-cyan-600' },
    { to: '/php-to-acf', icon: Code2, label: 'PHP to ACF', gradient: 'from-violet-500 to-purple-600' },
    { to: '/acf-to-php', icon: FileJson, label: 'ACF to PHP', gradient: 'from-pink-500 to-rose-600' },
    { to: '/diagnostics', icon: Activity, label: 'Diagnostics', gradient: 'from-orange-500 to-red-600' },
    { to: '/settings', icon: Settings, label: 'Settings', gradient: 'from-gray-500 to-slate-600' },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200/80 h-screen flex flex-col fixed left-0 top-0 z-10 shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="flex items-center gap-3 text-white relative z-10">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold tracking-tight block">ACF Generator</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r text-white shadow-lg shadow-indigo-500/30 scale-[1.02]"
                                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:scale-[1.01]",
                                isActive && item.gradient
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r opacity-100 animate-pulse" style={{ animationDuration: '3s' }}></div>
                                )}
                                <div className={cn(
                                    "relative z-10 p-1.5 rounded-lg transition-all duration-300",
                                    isActive ? "bg-white/20 shadow-sm" : "bg-gray-100 group-hover:bg-white"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform duration-300",
                                        isActive ? "text-white" : "text-gray-600 group-hover:text-indigo-600",
                                        "group-hover:scale-110"
                                    )} />
                                </div>
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <Sparkles className="w-4 h-4 ml-auto relative z-10 animate-pulse" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Tip */}
            <div className="p-4 border-t border-gray-200/50">
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-xl border border-indigo-200/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <p className="text-xs text-indigo-700 font-bold">Pro Tip</p>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                            Use specific prompts for better AI-generated results.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
