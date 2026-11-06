import React from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User as UserIcon, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function FinancialAssistant() {
  const { user } = useAuth();
  const {
    messages,
    input,
    setInput,
    loading,
    messagesEndRef,
    suggestedQueries,
    handleSendMessage
  } = useAssistant();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* ---------------- COMPANION HEADER ---------------- */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] flex items-center justify-center text-white shadow-glow-pink">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Pennywise Financial Companion
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-[#A5A5B8]">
              Autonomous intelligence powered by your live transaction telemetry
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101536] border border-[#7800B8]/40 text-xs text-[#FF69B4]">
          <ShieldCheck size={14} className="text-[#FF1493]" />
          <span>Real-time Ledger Grounding</span>
        </div>
      </div>

      {/* ---------------- CHAT MESSAGES CONTAINER ---------------- */}
      <Card className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-gradient-to-tr from-[#FF1493] to-[#7800B8] text-white shadow-sm'
                    : 'bg-[#101536] border border-[#FF1493]/40 text-[#FF69B4]'
                }`}
              >
                {isUser ? user?.first_name?.[0] || 'U' : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white rounded-tr-none shadow-md'
                    : 'bg-[#101536]/90 border border-white/10 text-gray-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-white/70' : 'text-[#A5A5B8]'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#101536] border border-[#FF1493]/40 flex items-center justify-center text-[#FF69B4]">
              <Bot size={16} />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#101536]/90 border border-white/10 text-xs text-[#FF69B4] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF1493] animate-ping" />
              <span>Pennywise is analyzing your transaction records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* ---------------- SUGGESTED PROMPTS PILLS ---------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] text-[#A5A5B8] uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle size={13} /> Quick Prompts:
        </span>
        {suggestedQueries.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-[#101536] border border-white/10 text-[#FF69B4] hover:border-[#FF1493]/50 hover:bg-[#7800B8]/20 transition-all whitespace-nowrap shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ---------------- INPUT MESSAGE FORM ---------------- */}
      <form onSubmit={handleFormSubmit} className="flex gap-2.5 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Pennywise: 'How much did I spend on groceries?' or 'Can I afford ₹4,000?'"
          className="flex-1 rounded-2xl bg-[#080B24]/90 border border-white/15 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF1493] shadow-inner"
        />

        <Button
          type="submit"
          disabled={!input.trim() || loading}
          isLoading={loading}
          icon={Send}
          className="px-5 rounded-2xl"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
