## **Context**

We have a working Auctus AI frontend with an AI chatbot widget. Currently, the chatbot doesn't respond to user messages. We need to implement **hardcoded question-answer matching** with **fuzzy/keyword matching** for a live demo presentation.

---

## **Goal**

Make the AI chatbot respond to **5 pre-defined questions** using keyword matching so that even if the user types slightly different wording during the live demo, it still returns the correct answer.

---

## **Step-by-Step Implementation Plan**

### **STEP 1: Locate the Chatbot Component**

* Find the AI chatbot component file (likely `/components/advisor/ChatbotWidget.tsx` or `/components/AIChatbot.tsx`)  
* Identify where user messages are captured (input field, send button handler)  
* Locate where AI responses are currently displayed (message history state)

---

### **STEP 2: Create Q\&A Knowledge Base**

Create a new file: `/lib/chatbotKnowledge.ts`

typescript  
export interface QAPair {  
  id: string;  
  keywords: string\[\]; *// Keywords to match against*  
  question: string; *// Example question (for reference)*  
  answer: string; *// Response to return*  
}

export const knowledgeBase: QAPair\[\] \= \[  
  {  
    id: "register-business",  
    keywords: \["register", "registration", "start", "setup", "create business", "incorporate"\],  
    question: "How do I register my business in Fredericton?",  
    answer: "To register a business in Fredericton, you need to: 1\) Choose a business structure (sole proprietorship, partnership, or corporation), 2\) Register with Service New Brunswick, 3\) Get a GST/HST number from CRA if revenue exceeds $30k, 4\) Apply for necessary permits through the City of Fredericton. The process typically takes 1-2 weeks. Would you like help finding grants to cover registration costs?"  
  },  
  {  
    id: "find-grants",  
    keywords: \["grant", "funding", "money", "financial", "loan", "subsidy", "eligible"\],  
    question: "What grants am I eligible for?",  
    answer: "Based on your business profile, I've found several grants you may qualify for. Check the Funding page to see your personalized matches with eligibility scores. The top matches include the Canada Small Business Financing Program, NB Small Business Grant, and Atlantic Canada Opportunities Agency funding. Would you like me to explain the application process?"  
  },  
  {  
    id: "find-partners",  
    keywords: \["partner", "collaboration", "connect", "network", "supplier", "collaborate"\],  
    question: "How can I find business partners?",  
    answer: "You can find potential partners through our Business Matchmaker feature\! It analyzes your needs and offerings to suggest compatible local businesses. Also check the 'Collaboration Opportunities' category in the Forum where businesses post partnership requests. Many successful partnerships have started through our platform\!"  
  },  
  {  
    id: "hire-talent",  
    keywords: \["hire", "hiring", "recruit", "employee", "staff", "talent", "student", "intern"\],  
    question: "How do I find local talent to hire?",  
    answer: "Our Talent Marketplace connects you with local students, freelancers, and part-time workers. You can post job listings, search by skills, and browse profiles of available talent from UNB and NBCC. It's specifically designed for project-based work and internships, making it perfect for small businesses."  
  },  
  {  
    id: "permits-licenses",  
    keywords: \["permit", "license", "legal", "requirement", "compliance", "regulations", "city"\],  
    question: "What permits do I need for my business?",  
    answer: "Permit requirements depend on your business type. Common permits in Fredericton include: Business Operating License (all businesses), Development Permit (renovations/signage), Food Service Permit (restaurants), and Home-Based Business Permit. Visit the City of Fredericton's website or contact their Business Development office at (506) 460-2020 for specific requirements."  
  }

\];

---

### **STEP 3: Create Keyword Matching Function**

In the same file `/lib/chatbotKnowledge.ts`, add:

typescript  
*/\*\**  
 \* Matches user input against knowledge base using keyword detection  
 \* Returns best matching answer or null if no match found  
 *\*/*  
export function matchQuestion(userInput: string): string | null {  
  const normalizedInput \= userInput.toLowerCase().trim();  
    
  *// Find best match based on keyword count*  
  let bestMatch: QAPair | null \= null;  
  let maxMatches \= 0;  
    
  for (const qa of knowledgeBase) {  
    let matchCount \= 0;  
      
    *// Count how many keywords appear in user input*  
    for (const keyword of qa.keywords) {  
      if (normalizedInput.includes(keyword.toLowerCase())) {  
        matchCount\++;  
      }  
    }  
      
    *// Update best match if this has more keyword matches*  
    if (matchCount \> maxMatches) {  
      maxMatches \= matchCount;  
      bestMatch \= qa;  
    }  
  }  
    
  *// Return answer if at least 1 keyword matched*  
  if (maxMatches \> 0 && bestMatch) {  
    return bestMatch.answer;  
  }  
    
  *// No match found \- return null*  
  return null;  
}

*/\*\**  
 \* Fallback response when no match found  
 *\*/*  
export function getFallbackResponse(): string {  
  return "I'm here to help with business registration, funding opportunities, finding partners, hiring talent, and permit requirements. Could you rephrase your question or ask about one of these topics?";

}

---

### **STEP 4: Update Chatbot Component Logic**

Find the chatbot's message send handler (likely in `ChatbotWidget.tsx` or similar) and update it:

**Before (current non-functional state):**

typescript  
const handleSendMessage \= (userMessage: string) \=\> {  
  *// Add user message to chat*  
  setMessages(\[...messages, { role: 'user', content: userMessage }\]);  
    
  *// TODO: Get AI response (currently does nothing)*

};

**After (with keyword matching):**

typescript  
import { matchQuestion, getFallbackResponse } from '@/lib/chatbotKnowledge';

const handleSendMessage \= (userMessage: string) \=\> {  
  *// Add user message to chat*  
  const newMessages \= \[...messages, { role: 'user', content: userMessage }\];  
  setMessages(newMessages);  
    
  *// Get AI response using keyword matching*  
  const aiResponse \= matchQuestion(userMessage) || getFallbackResponse();  
    
  *// Add AI response to chat (with slight delay for realism)*  
  setTimeout(() \=\> {  
    setMessages(\[...newMessages, { role: 'assistant', content: aiResponse }\]);  
  }, 500); *// 500ms delay to simulate "thinking"*

};

---

### **STEP 5: Add Typing Indicator (Optional but Recommended)**

To make it feel more realistic during the demo, add a typing indicator:

typescript  
const \[isTyping, setIsTyping\] \= useState(false);

const handleSendMessage \= (userMessage: string) \=\> {  
  const newMessages \= \[...messages, { role: 'user', content: userMessage }\];  
  setMessages(newMessages);  
    
  *// Show typing indicator*  
  setIsTyping(true);  
    
  const aiResponse \= matchQuestion(userMessage) || getFallbackResponse();  
    
  *// Simulate AI "thinking" time*  
  setTimeout(() \=\> {  
    setIsTyping(false);  
    setMessages(\[...newMessages, { role: 'assistant', content: aiResponse }\]);  
  }, 800); *// Adjust timing as needed*

};

Then in the JSX, display typing indicator:

tsx  
{isTyping && (  
  \<div className\="flex items-center gap-2 text-gray-500 p-3"\>  
    \<div className\="flex gap-1"\>  
      \<span className\="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style\={{ animationDelay: '0ms' }}\>\</span\>  
      \<span className\="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style\={{ animationDelay: '150ms' }}\>\</span\>  
      \<span className\="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style\={{ animationDelay: '300ms' }}\>\</span\>  
    \</div\>  
    \<span className\="text-sm"\>AI is thinking...\</span\>  
  \</div\>

)}

---

### **STEP 6: Test All 5 Questions**

Create a test checklist and verify each works:

**Test Cases:**

1. ✅ "How do I register my business?" → Returns registration answer  
2. ✅ "What grants can I get?" → Returns funding answer  
3. ✅ "Find me partners" → Returns matchmaker answer  
4. ✅ "Need to hire someone" → Returns talent marketplace answer  
5. ✅ "What permits do I need?" → Returns permits answer

**Fuzzy Test Cases (verify keyword matching works):**

1. ✅ "business registration help" → Should match question 1  
2. ✅ "show me funding" → Should match question 2  
3. ✅ "collaborate with other businesses" → Should match question 3  
4. ✅ "random unrelated text" → Should return fallback response

---

### **STEP 7: Add Quick Suggestion Chips (Optional)**

To guide the demo and prevent typing errors, add suggestion chips below the input:

typescript  
const quickSuggestions \= \[  
  "How do I register my business?",  
  "What grants am I eligible for?",  
  "Find me business partners",  
  "How do I hire local talent?",  
  "What permits do I need?"

\];

Display as clickable chips that auto-fill the input:

tsx  
\<div className\="flex flex-wrap gap-2 p-3"\>  
  {quickSuggestions.map((suggestion, idx) \=\> (  
    \<button  
      key\={idx}  
      onClick\={() \=\> handleSendMessage(suggestion)}  
      className\="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"  
    \>  
      {suggestion}  
    \</button\>  
  ))}

\</div\>

---

### **STEP 8: Clear Chat History Button (For Demo Reset)**

Add a button to clear the chat between demo runs:

typescript  
const handleClearChat \= () \=\> {  
  setMessages(\[\]);

};

tsx  
\<button   
  onClick\={handleClearChat}  
  className\="text-xs text-gray-400 hover:text-gray-600"  
\>  
  Clear Chat  
\</button\>  
\`\`\`

\---

\#\# \*\*File Structure Summary\*\*

After implementation, you should have:  
\`\`\`  
/lib/chatbotKnowledge.ts          \# New file \- Q&A data \+ matching logic

/components/advisor/ChatbotWidget.tsx  \# Modified \- wired to knowledge base

---

## **Validation Checklist**

Before the presentation, verify:

* ✅ All 5 questions return correct answers  
* ✅ Keyword matching works with variations  
* ✅ Typing indicator shows (makes it look real)  
* ✅ Fallback response appears for unmatched input  
* ✅ Chat clears properly for multiple demo runs  
* ✅ No console errors  
* ✅ Works on demo laptop/screen resolution

---

## **Demo Script Recommendation**

During presentation, say:

"Let me show you our AI advisor in action. I'll ask it about business registration..."

Then type (or click suggestion chip): **"How do I register my business?"**

The hardcoded response will appear instantly (after typing delay), making it look like a real AI.

---

## **Notes for Cline**

1. **Preserve existing chatbot UI** \- only modify the message handling logic  
2. **Don't break current functionality** \- if chatbot already has styling/animations, keep them  
3. **Test in the browser** after each step to ensure it works  
4. **Keep it simple** \- this is a demo hack, not production code  
5. **Add comments** in code explaining it's hardcoded for demo purposes

---

**This roadmap gives Cline everything needed to implement the hardcoded Q\&A chatbot with fuzzy matching. Hand this document to Cline and it should be able to complete the implementation.**

