import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User as UserIcon, 
  TrendingDown, 
  Lightbulb, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';

const SUGGESTED_QUERIES = [
  "How much did I spend this month?",
  "Where am I spending the most?",
  "Can I afford a purchase of ₹5,000?",
  "How much money did I save?",
  "Am I spending too much on shopping?",
  "How can I reduce my expenses?",
  "What should my budget be next month?",
  "How can I manage my finances better?"
];

export default function FinancialAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const history = await api.getAssistantHistory();
      if (history && history.length > 0) {
        setMessages(history.map(h => ({
          sender: h.sender,
          text: h.message,
          time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        // Initial greeting
        setMessages([
          {
            sender: 'assistant',
            text: `Hello ${user?.first_name || 'there'}! I am your **Pennywise Financial Companion**.\n\nI have real-time access to your personal transaction ledger, active banking balances, and category budgets. Ask me anything about your cashflow, spending reduction, or purchase affordability!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('History load error', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAssistant(query);
      const botMsg = {
        sender: 'assistant',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: `⚠️ I encountered an issue analyzing your records: ${err.message}. Please try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-panel rounded-3xl overflow-hidden border border-[#FF1493]/35 shadow-glow-purple relative">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-[#D900A8]/20 bg-[#080B24]/90 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] flex items-center justify-center text-white shadow-glow-pink">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Pennywise Financial Companion
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Grounded
              </span>
            </div>
            <p className="text-[11px] text-[#A5A5B8]">
              Empowered with real financial records • Personalized Fintech Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([]);
            loadHistory();
          }}
          title="Reset conversation"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser 
                  ? 'bg-gradient-to-tr from-[#35004F] to-[#7800B8] text-white border border-[#FF69B4]/30' 
                  : 'bg-gradient-to-tr from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink'
              }`}>
                {isUser ? (user?.first_name ? user.first_name[0] : 'U') : <Bot size={16} />}
              </div>

              <div className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-r from-[#7800B8] to-[#D900A8] text-white rounded-tr-none shadow-md'
                  : 'bg-[#080B24]/90 border border-white/10 text-gray-200 rounded-tl-none shadow-sm'
              }`}>
                {/* Render formatted markdown-like text */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.text}
                </div>
                <div className={`text-[9px] mt-2 ${isUser ? 'text-white/70' : 'text-[#A5A5B8]'} text-right`}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] flex items-center justify-center text-white shrink-0 shadow-glow-pink">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#080B24]/90 border border-[#FF1493]/30 flex items-center gap-2 text-xs text-[#FF69B4]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF1493] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#FF1493] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#FF1493] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Auditing ledger records & computing recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#050509]/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-[#FF69B4] shrink-0 flex items-center gap-1">
          <Sparkles size={11} /> Suggested:
        </span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="shrink-0 px-3 py-1 rounded-full bg-[#101536] border border-[#FF1493]/25 hover:border-[#FF1493] text-gray-300 hover:text-white text-[11px] font-medium transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 border-t border-[#D900A8]/20 bg-[#080B24]/90 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Pennywise about your expenses, budgets, savings, or purchase affordability..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl bg-[#050509]/80 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF1493]"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

