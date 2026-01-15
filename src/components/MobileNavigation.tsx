import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft, Utensils, GraduationCap, Dribbble, MapPin, X, Navigation2, Music } from 'lucide-react';
import { GraphNode, getNodeTypeInfo } from '@/lib/pathfinding';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
    locations: GraphNode[];
    onNavigate: (startId: string, endId: string) => void;
    onReset: () => void;
    isCalculating: boolean;
    selectedStart?: GraphNode | null;
    selectedEnd?: GraphNode | null;
}

export function MobileNavigation({
    locations,
    onNavigate,
    onReset,
    isCalculating,
    selectedStart,
    selectedEnd
}: MobileNavigationProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startLoc, setStartLoc] = useState<GraphNode | null>(null);
    const [endLoc, setEndLoc] = useState<GraphNode | null>(null);
    const [activeField, setActiveField] = useState<'start' | 'end'>('end');
    const [isFactsExpanded, setIsFactsExpanded] = useState(false);

    // Filter suggestions
    const suggestions = useMemo(() => {
        const query = activeField === 'start' ? startQuery : endQuery;
        if (!query) {
            // Show popular/featured locations when query is empty
            const popularIds = ['main_gate', 'admin_block', 'voc_auditorium', 'ruby_hall', 'nethaji_auditorium', 'kamaraj_auditorium', 'northsquare_food', 'mini_conf_hall'];
            return locations.filter(loc => popularIds.includes(loc.id)).slice(0, 10);
        }
        const lowerQuery = query.toLowerCase();
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(lowerQuery) ||
            loc.type.toLowerCase().includes(lowerQuery)
        ).slice(0, 8);
    }, [locations, startQuery, endQuery, activeField]);

    const handleSelectLocation = (loc: GraphNode) => {
        if (activeField === 'start') {
            setStartLoc(loc);
            setStartQuery(loc.name);
            setActiveField('end');
        } else {
            setEndLoc(loc);
            setEndQuery(loc.name);
        }
    };

    const handleStartNavigation = () => {
        if (startLoc && endLoc) {
            onNavigate(startLoc.id, endLoc.id);
            setIsSearchOpen(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        setIsSearchOpen(true);
        setActiveField('end');
        setEndQuery(category);
    };

    // Sync local state when selection is cleared globally
    useEffect(() => {
        if (!selectedStart && !selectedEnd) {
            setStartQuery('');
            setEndQuery('');
            setStartLoc(null);
            setEndLoc(null);
        }
    }, [selectedStart, selectedEnd]);

    // Close search on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <>
            {/* Home Screen Search Bar & Categories */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-40 p-4 pt-6 transition-all duration-500 ease-in-out bg-gradient-to-b from-background via-background/80 to-transparent",
                isSearchOpen ? "opacity-0 pointer-events-none -translate-y-10" : "opacity-100"
            )}>
                <div className="flex flex-col gap-6 max-w-sm mx-auto">
                    {/* Main Search Bar */}
                    <div className="relative group">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-full bg-card/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-card/80 transition-all text-left"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                {selectedEnd ? <Navigation2 className="w-5 h-5 text-primary" /> : <Search className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-foreground font-bold tracking-tight truncate">
                                    {selectedEnd ? `To ${selectedEnd.name}` : "Where to?"}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {selectedStart ? `From ${selectedStart.name}` : "Search campus buildings..."}
                                </span>
                            </div>
                        </button>
                        {(selectedStart || selectedEnd) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReset();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
                                title="Clear route"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Category Shortcuts */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mask-fade-right">
                        <CategoryCard
                            icon={<Music className="w-4 h-4" />}
                            label="Auditorium"
                            emoji=""
                            onClick={() => handleCategoryClick('Auditorium')}
                        />
                        <CategoryCard
                            icon={<Utensils className="w-4 h-4" />}
                            label="Food"
                            emoji=""
                            onClick={() => handleCategoryClick('Food')}
                        />
                        <CategoryCard
                            icon={<GraduationCap className="w-4 h-4" />}
                            label="Academics"
                            emoji=""
                            onClick={() => handleCategoryClick('Academic')}
                        />
                        <CategoryCard
                            icon={<Dribbble className="w-4 h-4" />}
                            label="Play"
                            emoji=""
                            onClick={() => handleCategoryClick('Sports')}
                        />
                    </div>
                </div>
            </div>

            {/* Full-screen Search Overlay */}
            <div className={cn(
                "fixed inset-0 z-50 bg-background transition-all duration-700 ease-out flex flex-col",
                isSearchOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Header with Inputs */}
                <div className="p-6 pt-12 bg-card/40 backdrop-blur-3xl border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold">Plan your route</h2>
                            <p className="text-xs text-muted-foreground">Select start and destination</p>
                        </div>
                    </div>

                    <div className="space-y-3 relative px-1">
                        {/* Visual connector line */}
                        <div className="absolute left-[24px] top-[48px] bottom-[48px] w-[2px] bg-gradient-to-b from-green-500 via-primary to-red-500 opacity-20" />

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-green-500 bg-background z-10" />
                            <input
                                placeholder="From: Current Location"
                                value={startQuery}
                                onFocus={() => setActiveField('start')}
                                onChange={(e) => setStartQuery(e.target.value)}
                                className={cn(
                                    "w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50",
                                    activeField === 'start' && "bg-white/[0.08] border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                )}
                            />
                            {startQuery && (
                                <button
                                    onClick={() => { setStartQuery(''); setStartLoc(null); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-red-500 bg-background z-10" />
                            <input
                                autoFocus
                                placeholder="Where to?"
                                value={endQuery}
                                onFocus={() => setActiveField('end')}
                                onChange={(e) => setEndQuery(e.target.value)}
                                className={cn(
                                    "w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50",
                                    activeField === 'end' && "bg-white/[0.08] border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                )}
                            />
                            {endQuery && (
                                <button
                                    onClick={() => { setEndQuery(''); setEndLoc(null); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Suggestions List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {suggestions.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-[0.2em] px-2">
                                {!activeField || (activeField === 'start' ? !startQuery : !endQuery) ? "Popular Locations" : "Suggestions"}
                            </p>
                            <div className="grid gap-2">
                                {suggestions.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => handleSelectLocation(loc)}
                                        className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-105">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {loc.floor ? `${loc.floor} • ` : ''}{getNodeTypeInfo(loc.type).label}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Navigation2 className="w-4 h-4 text-primary" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-6 opacity-40 animate-pulse">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">Search Buildings</p>
                                <p className="text-sm">Find your destination on campus</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/5 bg-background/80 backdrop-blur-xl">
                    <button
                        onClick={handleStartNavigation}
                        disabled={!startLoc || !endLoc || isCalculating}
                        className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 uppercase tracking-widest"
                    >
                        {isCalculating ? (
                            <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Navigation2 className="w-6 h-6 fill-current" />
                        )}
                        {isCalculating ? "Calculating..." : "Get Directions"}
                    </button>
                </div>
            </div>

            {/* Fun Facts Pull-up Box */}
            {selectedEnd && !isSearchOpen && (
                <div
                    className={cn(
                        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-40 transition-all duration-500 ease-in-out px-4 pb-6",
                        isFactsExpanded ? "h-[60vh]" : "h-24"
                    )}
                >
                    <div
                        className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-full shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col pt-2"
                        onClick={() => setIsFactsExpanded(!isFactsExpanded)}
                    >
                        {/* Pull Tab */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

                        <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">
                                        {selectedEnd.name}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Navigation2 className="w-5 h-5 text-primary fill-current" />
                                </div>
                            </div>

                            {selectedEnd.facts && selectedEnd.facts.length > 0 ? (
                                <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Fun Facts</p>
                                    <div className="grid gap-3">
                                        {selectedEnd.facts.map((fact, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <div className="text-xl">✨</div>
                                                <p className="text-sm text-foreground/80 leading-relaxed">{fact}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground opacity-40">
                                    <p className="text-sm">No fun facts available for this building yet!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CategoryCard({ icon, label, emoji, onClick }: { icon: React.ReactNode, label: string, emoji: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-3 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl whitespace-nowrap hover:bg-card/90 transition-all shadow-lg active:scale-95"
        >
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs opacity-60">{emoji}</span>
        </button>
    );
}
