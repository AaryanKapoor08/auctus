"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBusiness } from "@/lib/BusinessContext";
import {
  getAIResponse,
  processQuickAction,
  getPageSpecificActions,
  AIResponse,
  Suggestion,
} from "@/lib/ai-responses";
import {
  MessageCircle,
  Send,
  Sparkles,
  X,
  Minimize2,
  ArrowRight,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./ui/Button";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  suggestions?: Suggestion[];
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const { currentBusiness } = useBusiness();
  const pathname = usePathname();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const businessName = currentBusiness?.name || "there";
      const welcomeMessage = `👋 **Welcome to Auctus AI!**

Hi ${businessName}! I'm your personal business advisor.

I can help you with:
• 💰 **Finding grants & funding** - Discover financial opportunities
• 🤝 **Business partnerships** - Connect with complementary businesses
• 💬 **Forum discussions** - Get advice from the community
• ⏰ **Tracking deadlines** - Stay on top of opportunities
• 📋 **Business guidance** - Registration, permits, and more

What would you like to explore today?`;
      
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, currentBusiness, pathname, messages.length]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI "thinking" delay
    setTimeout(() => {
      const aiResponse = getAIResponse(inputValue, {
        currentBusiness,
        currentPage: pathname,
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: aiResponse.message,
        suggestions: aiResponse.suggestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action: string) => {
    // If action is a navigation path, navigate
    if (action.startsWith("/")) {
      router.push(action);
      return;
    }

    // If action is a query, process it
    if (action.startsWith("query:")) {
      const query = action.replace("query:", "");
      setInputValue(query);
      
      // Auto-send the query
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse = getAIResponse(query, {
          currentBusiness,
          currentPage: pathname,
        });

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: aiResponse.message,
          suggestions: aiResponse.suggestions,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.link) {
      router.push(suggestion.link);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = getPageSpecificActions(pathname);

  return (
    <>
      {/* Floating Button - Dark Grey Theme */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-[#2F2F2F] to-[#1A1A1A] hover:from-[#3F3F3F] hover:to-[#2A2A2A] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Open AI Chatbot"
        >
          <div className="relative">
            <Sparkles className="h-7 w-7 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl transition-all duration-200",
            isMinimized
              ? "w-80 h-16"
              : "w-96 h-[600px] max-h-[calc(100vh-3rem)]",
            "flex flex-col",
            "md:w-96",
            "max-md:fixed max-md:inset-4 max-md:w-auto max-md:h-auto max-md:max-h-none"
          )}
        >
          {/* Header - White Theme */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white text-gray-900 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Auctus AI Advisor</h3>
                <p className="text-xs text-gray-600">Here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3 shadow-sm",
                        message.role === "user"
                          ? "bg-gray-100 text-gray-900 border border-gray-200"
                          : "bg-gray-50 text-gray-900 border border-gray-200"
                      )}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, idx) => {
                            // Extract match percentage if present
                            const matchPercentage = suggestion.description.match(/(\d+)%/)?.[1];
                            const matchBadgeColor = matchPercentage 
                              ? parseInt(matchPercentage) > 80 
                                ? "bg-green-100 text-green-800 border-green-200"
                                : parseInt(matchPercentage) > 60
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                              : "";
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 rounded-lg p-3 transition-all duration-200 border-2 border-gray-200 hover:border-primary-400 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                      {suggestion.title}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-xs text-gray-700">
                                        {suggestion.description.split('-')[0].trim()}
                                      </p>
                                      {matchPercentage && (
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-full text-xs font-bold border",
                                          matchBadgeColor
                                        )}>
                                          {matchPercentage}% match
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-primary-600 flex-shrink-0 mt-1" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 text-gray-900 rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Chips */}
              {messages.length > 0 && quickActions.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Sparkles className="h-3 w-3 text-gray-600 flex-shrink-0" />
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(action.action)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap border border-gray-300"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-end gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200",
                      inputValue.trim() && !isTyping
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Context-aware responses
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
