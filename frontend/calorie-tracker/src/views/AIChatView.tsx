import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiService } from '../api/ai.service';
import type { AIChatMessage } from '../api/ai.service';
import { cn } from '../utils/cn';
import { PageHeader } from '../components/PageHeader';

export const AIChatView: React.FC = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();

        // Snapshot history BEFORE adding the new user message
        const historySnapshot = [...messages];

        const newUserMessage: AIChatMessage = { role: 'user', parts: [{ text: userQuery }] };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        // Add an empty placeholder so the typing indicator shows immediately
        const placeholder: AIChatMessage = { role: 'model', parts: [{ text: '' }] };
        setMessages(prev => [...prev, placeholder]);

        try {
            const responseText = await aiService.chat(userQuery, historySnapshot);

            setMessages(prev => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                if (next[lastIdx]?.role === 'model') {
                    next[lastIdx] = { role: 'model', parts: [{ text: responseText }] };
                }
                return next;
            });
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                if (next[lastIdx]?.role === 'model') {
                    next[lastIdx] = {
                        role: 'model',
                        parts: [{ text: "I'm having trouble connecting right now. Please check your API key or try again." }],
                    };
                }
                return next;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-4">
                <PageHeader
                    title="Vitality AI"
                    subtitle="Your personal nutrition & wellness assistant"
                    actions={
                        <button
                            onClick={clearChat}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Clear Conversation"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    }
                />
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pb-44 scrollbar-hide"
            >
                <div className="max-w-3xl mx-auto space-y-4 px-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-vitality-50 dark:bg-vitality-900/20 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-vitality-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">What nutritional guidance can I provide today?</h3>
                            <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                                I'm here to help with meal planning, nutrient analysis, and fitness goals.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
                                {[
                                    "Is caffeine good for fat loss?",
                                    "Quick high-protein snack?",
                                    "Explain complex carbs",
                                    "Daily water intake goal?"
                                ].map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-5 py-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:border-vitality-300 dark:hover:border-vitality-500 hover:text-vitality-600 transition-all text-left shadow-sm active:scale-95"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                msg.role === 'user'
                                    ? "bg-slate-900 dark:bg-zinc-800"
                                    : "bg-vitality-100 dark:bg-vitality-900/30"
                            )}>
                                {msg.role === 'user' ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (
                                    <Bot className="w-5 h-5 text-vitality-600" />
                                )}
                            </div>
                            <div className={cn(
                                "max-w-[85%] px-1 py-1 text-[15px] leading-relaxed",
                                msg.role === 'user'
                                    ? "text-slate-900 dark:text-white font-medium text-right"
                                    : "text-slate-700 dark:text-zinc-200"
                            )}>
                                <div className={cn(
                                    "rounded-2xl p-4",
                                    msg.role === 'user'
                                        ? "bg-vitality-500 text-white rounded-tr-none shadow-lg shadow-vitality-500/10"
                                        : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-tl-none shadow-sm"
                                )}>
                                    {msg.role === 'user' ? (
                                        msg.parts[0].text
                                    ) : (
                                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-code:text-vitality-500 dark:prose-code:text-vitality-400">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.parts[0].text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                    {!msg.parts[0].text && msg.role === 'model' && (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 text-vitality-500 animate-spin" />
                                            <span className="text-xs text-slate-400">Streaming...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Input Area with Gradient Mask */}
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-slate-50/95 dark:via-zinc-950/95 to-transparent pointer-events-none flex flex-col justify-end pb-0 px-4">
                <form
                    onSubmit={handleSend}
                    className="max-w-3xl mx-auto w-full pointer-events-auto"
                >
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="w-full pl-6 pr-16 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] text-[15px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-vitality-500/50 focus:border-vitality-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-opacity-95 backdrop-blur-sm"
                        />
                        <button
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900 dark:bg-vitality-500 text-white rounded-full hover:bg-slate-800 dark:hover:bg-vitality-600 transition-all disabled:opacity-30 disabled:hover:scale-100 active:scale-90"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-zinc-600 font-medium">
                        Vitality AI can make mistakes. Please check important nutritional info.
                    </p>
                </form>
            </div>
        </div>
    );
};
