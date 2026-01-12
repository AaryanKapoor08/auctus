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
      const welcomeResponse = getAIResponse("", {
        currentBusiness,
        currentPage: pathname,
      });
      
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content: welcomeResponse.message,
          suggestions: welcomeResponse.suggestions,
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
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center group"
          aria-label="Open AI Chatbot"
        >
          <div className="relative">
            <Sparkles className="h-7 w-7 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-secondary-500 rounded-full flex items-center justify-center text-xs font-bold">
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
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Auctus AI Advisor</h3>
                <p className="text-xs text-white/80">Here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                          ? "bg-primary-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      )}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200 border border-gray-200"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    {suggestion.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {suggestion.description}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 rounded-lg p-3 shadow-sm border border-gray-200">
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
                    <Sparkles className="h-3 w-3 text-primary-600 flex-shrink-0" />
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(action.action)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors duration-200 whitespace-nowrap border border-primary-200"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200",
                      inputValue.trim() && !isTyping
                        ? "bg-primary-600 text-white hover:bg-primary-700"
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
