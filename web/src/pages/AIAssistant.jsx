import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Wand2, BookOpen, ClipboardList, Lightbulb } from 'lucide-react';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I am your SmartSchool AI Assistant. How can I help you today? I can help you generate exam questions, evaluate student answers, or provide lesson plan ideas." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // For now, we'll use a generic prompt for the assistant
      // In a real scenario, you might have a dedicated assistant endpoint
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: input, 
          instructions: "Respond as a helpful school assistant. If the user asks for questions, generate them. Otherwise, provide educational advice or assistance.",
          count: 1 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Since generate-questions returns an array, we'll format it
        const botContent = Array.isArray(data) 
          ? `I've generated some questions for you about "${input}":\n\n${data.map(q => `• ${q.text} (${q.marks} marks)`).join('\n')}`
          : "I've processed your request. How else can I help?";
        
        setMessages(prev => [...prev, { role: 'bot', content: botContent }]);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || "Unknown error";
        setMessages(prev => [...prev, { role: 'bot', content: `Sorry, I encountered an error: ${errorMessage}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { icon: BookOpen, text: "Generate 5 questions about Photosynthesis" },
    { icon: Lightbulb, text: "Give me a lesson plan for Grade 5 Math" },
    { icon: ClipboardList, text: "How do I evaluate a short answer question?" },
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal shadow-inner">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">AI Assistant</h2>
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gemini 2.0 Flash Active
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-light-bg/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user' ? 'bg-primary-teal text-white' : 'bg-white text-primary-teal border border-gray-100'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${
                m.role === 'user' ? 'bg-primary-teal text-white' : 'bg-white text-dark-text border border-gray-50'
              }`}>
                {m.content.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-white text-primary-teal border border-gray-100 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-50 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-teal/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary-teal/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary-teal/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-light-bg/30 border-t border-gray-50">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s.text)}
              className="p-3 bg-white border border-gray-100 rounded-xl text-left hover:border-primary-teal/30 hover:bg-primary-teal/5 transition group"
            >
              <s.icon size={16} className="text-primary-teal mb-2" />
              <p className="text-[10px] font-black text-dark-text leading-tight group-hover:text-primary-teal transition-colors">{s.text}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything or generate questions..."
            className="w-full p-4 pr-14 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-2xl outline-none text-sm font-bold text-dark-text transition shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-teal text-white rounded-xl hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Wand2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-[9px] font-bold text-muted-text text-center mt-4 uppercase tracking-[0.2em] opacity-50">
          SmartSchool AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
