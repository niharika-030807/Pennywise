import { useState, useEffect, useRef, useCallback } from 'react';
import { assistantApi } from '../api/assistant.api';
import { useAuth } from '../context/AuthContext';

export const SUGGESTED_QUERIES = [
  "How much did I spend this month?",
  "Where am I spending the most?",
  "Can I afford a purchase of ₹5,000?",
  "How much money did I save?",
  "Am I spending too much on shopping?",
  "How can I reduce my expenses?",
  "What should my budget be next month?",
  "How can I manage my finances better?"
];

export function useAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = useCallback(async () => {
    try {
      const history = await assistantApi.getHistory();
      if (history && history.length > 0) {
        setMessages(
          history.map((h) => ({
            sender: h.sender,
            text: h.message,
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        );
      } else {
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
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.chat(query.trim());
      const botMsg = {
        sender: 'assistant',
        text: res.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: `Sorry, I encountered an issue analyzing your request: ${err.message}. Please try asking again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    messagesEndRef,
    suggestedQueries: SUGGESTED_QUERIES,
    handleSendMessage,
    loadHistory
  };
}
