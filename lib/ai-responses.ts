import {
  Business,
  Grant,
  Thread,
  Match,
  getMatchedGrants,
  getAllThreads,
  getMatchesForBusiness,
  getBusinessById,
  getDaysUntilDeadline,
  getAllGrants,
  getThreadsByCategory,
  getRelatedGrants,
  getRelatedThreads,
} from "./data-utils";

// AI Response Types
export interface AIResponse {
  message: string;
  suggestions?: Suggestion[];
  quickActions?: QuickAction[];
}

export interface Suggestion {
  type: "grant" | "thread" | "match" | "page";
  id?: string;
  title: string;
  description: string;
  link?: string;
}

export interface QuickAction {
  label: string;
  action: string;
}

export interface AIContext {
  currentBusiness: Business | null;
  currentPage: string;
}

/**
 * Main AI response function - processes user message and returns contextual response
 */
export function getAIResponse(userMessage: string, context: AIContext): AIResponse {
  const message = userMessage.toLowerCase().trim();

  // Empty message handler
  if (!message) {
    return {
      message: "How can I help you today? You can ask about grants, partnerships, forum discussions, or general business questions.",
      quickActions: getPageSpecificActions(context.currentPage),
    };
  }

  // No business context
  if (!context.currentBusiness) {
    return {
      message: "Please select a business from the navbar to get personalized recommendations.",
      quickActions: [
        { label: "Browse All Grants", action: "/funding" },
        { label: "Visit Forum", action: "/forum" },
      ],
    };
  }

  // Pattern matching - check in priority order
  
  // 1. Grant/Funding queries
  if (
    message.includes("grant") ||
    message.includes("funding") ||
    message.includes("money") ||
    message.includes("capital") ||
    message.includes("loan") ||
    message.includes("apply") ||
    message.includes("eligible")
  ) {
    return handleGrantQuery(message, context);
  }

  // 2. Partnership/Collaboration queries
  if (
    message.includes("partner") ||
    message.includes("collaboration") ||
    message.includes("supplier") ||
    message.includes("connect") ||
    message.includes("network") ||
    message.includes("business match")
  ) {
    return handlePartnershipQuery(message, context);
  }

  // 3. Deadline queries
  if (
    message.includes("deadline") ||
    message.includes("closing") ||
    message.includes("urgent") ||
    message.includes("soon") ||
    message.includes("expires") ||
    message.includes("due")
  ) {
    return handleDeadlineQuery(message, context);
  }

  // 4. Forum/Help queries
  if (
    message.includes("forum") ||
    message.includes("help") ||
    message.includes("question") ||
    message.includes("advice") ||
    message.includes("community") ||
    message.includes("post") ||
    message.includes("thread")
  ) {
    return handleForumQuery(message, context);
  }

  // 5. Registration/Setup queries
  if (
    message.includes("register") ||
    message.includes("start") ||
    message.includes("setup") ||
    message.includes("new business") ||
    message.includes("incorporate") ||
    message.includes("how do i start")
  ) {
    return handleRegistrationQuery(message, context);
  }

  // 5.5. Permits/License queries
  if (
    message.includes("permit") ||
    message.includes("license") ||
    message.includes("legal") ||
    message.includes("requirement") ||
    message.includes("compliance") ||
    message.includes("regulations") ||
    message.includes("city")
  ) {
    return handlePermitsQuery(message, context);
  }

  // 6. Match percentage explanation
  if (
    message.includes("match") ||
    message.includes("percentage") ||
    message.includes("score") ||
    message.includes("calculate") ||
    message.includes("how does")
  ) {
    return handleMatchExplanationQuery(message, context);
  }

  // 7. Navigation queries
  if (
    message.includes("where") ||
    message.includes("how do i") ||
    message.includes("find") ||
    message.includes("show me")
  ) {
    return handleNavigationQuery(message, context);
  }

  // 8. Talent/Hiring queries
  if (
    message.includes("hire") ||
    message.includes("talent") ||
    message.includes("job") ||
    message.includes("employee") ||
    message.includes("staff")
  ) {
    return handleTalentQuery(message, context);
  }

  // Default fallback response
  return handleDefaultQuery(message, context);
}

/**
 * Handle grant-related queries
 */
function handleGrantQuery(message: string, context: AIContext): AIResponse {
  const { currentBusiness } = context;
  if (!currentBusiness) return getDefaultResponse(context);

  const matchedGrants = getMatchedGrants(currentBusiness.id);
  const topGrants = matchedGrants.slice(0, 3);

  // Check for specific keywords
  let filteredGrants = topGrants;
  
  if (message.includes("equipment") || message.includes("machinery")) {
    filteredGrants = matchedGrants.filter(
      (g) => g.name.toLowerCase().includes("equipment") || 
             g.description.toLowerCase().includes("equipment")
    ).slice(0, 3);
  } else if (message.includes("expansion") || message.includes("grow")) {
    filteredGrants = matchedGrants.filter(
      (g) => g.name.toLowerCase().includes("expansion") || 
             g.description.toLowerCase().includes("expansion") ||
             g.description.toLowerCase().includes("growth")
    ).slice(0, 3);
  } else if (message.includes("startup") || message.includes("new")) {
    filteredGrants = matchedGrants.filter(
      (g) => g.category.toLowerCase().includes("startup") ||
             g.name.toLowerCase().includes("startup")
    ).slice(0, 3);
  }

  const suggestions: Suggestion[] = (filteredGrants.length > 0 ? filteredGrants : topGrants).map((grant) => ({
    type: "grant",
    id: grant.id,
    title: grant.name,
    description: `$${grant.amount.toLocaleString()} - ${grant.matchPercentage}% match`,
    link: `/funding/${grant.id}`,
  }));

  return {
    message: filteredGrants.length > 0
      ? `I found ${filteredGrants.length} grant${filteredGrants.length > 1 ? 's' : ''} that match your needs for ${currentBusiness.name}:`
      : `Here are your top ${topGrants.length} grant matches for ${currentBusiness.name}:`,
    suggestions,
    quickActions: [
      { label: "View All Grants", action: "/funding" },
      { label: "Check Eligibility", action: suggestions[0]?.link || "/funding" },
    ],
  };
}

/**
 * Handle partnership/matchmaker queries
 */
function handlePartnershipQuery(message: string, context: AIContext): AIResponse {
  const { currentBusiness } = context;
  if (!currentBusiness) return getDefaultResponse(context);

  const matches = getMatchesForBusiness(currentBusiness.id);
  const topMatches = matches.slice(0, 3);

  const suggestions: Suggestion[] = topMatches.map((match) => {
    const partner = getBusinessById(match.partnerId);
    return {
      type: "match",
      id: match.partnerId,
      title: partner?.name || "Business Partner",
      description: `${match.matchScore}% match - ${match.reasoning.youNeed[0] || "Potential collaboration"}`,
      link: "/matchmaker",
    };
  });

  return {
    message: `I found ${matches.length} potential business partners for ${currentBusiness.name}. Here are the top matches:`,
    suggestions,
    quickActions: [
      { label: "View All Matches", action: "/matchmaker" },
      { label: "Browse Forum", action: "/forum" },
    ],
  };
}

/**
 * Handle deadline-related queries
 */
function handleDeadlineQuery(message: string, context: AIContext): AIResponse {
  const { currentBusiness } = context;
  if (!currentBusiness) return getDefaultResponse(context);

  const allGrants = getAllGrants();
  const upcomingDeadlines = allGrants
    .filter((g) => {
      const days = getDaysUntilDeadline(g.deadline);
      return days > 0 && days <= 30;
    })
    .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    .slice(0, 3);

  const suggestions: Suggestion[] = upcomingDeadlines.map((grant) => ({
    type: "grant",
    id: grant.id,
    title: grant.name,
    description: `${getDaysUntilDeadline(grant.deadline)} days remaining - $${grant.amount.toLocaleString()}`,
    link: `/funding/${grant.id}`,
  }));

  return {
    message: upcomingDeadlines.length > 0
      ? `Here are the grants closing soon (next 30 days):`
      : "No grants have deadlines in the next 30 days. Check back later for new opportunities!",
    suggestions,
    quickActions: [
      { label: "View All Grants", action: "/funding" },
      { label: "Set Reminders", action: "/dashboard" },
    ],
  };
}

/**
 * Handle forum-related queries
 */
function handleForumQuery(message: string, context: AIContext): AIResponse {
  const { currentBusiness } = context;
  if (!currentBusiness) return getDefaultResponse(context);

  const allThreads = getAllThreads();
  
  // Try to find relevant threads based on keywords
  let relevantThreads = allThreads.filter((thread) => {
    const threadText = `${thread.title} ${thread.content}`.toLowerCase();
    const keywords = currentBusiness.needs.map((n) => n.toLowerCase());
    return keywords.some((keyword) => threadText.includes(keyword));
  }).slice(0, 3);

  // Fallback to recent threads if no relevant matches
  if (relevantThreads.length === 0) {
    relevantThreads = allThreads
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }

  const suggestions: Suggestion[] = relevantThreads.map((thread) => {
    const author = getBusinessById(thread.authorId);
    return {
      type: "thread",
      id: thread.id,
      title: thread.title,
      description: `${author?.name || "Business"} - ${thread.category}`,
      link: `/forum/${thread.id}`,
    };
  });

  return {
    message: "Here are some relevant forum discussions you might find helpful:",
    suggestions,
    quickActions: [
      { label: "Browse All Threads", action: "/forum" },
      { label: "Post a Question", action: "/forum/new" },
    ],
  };
}

/**
 * Handle registration/setup queries
 */
function handleRegistrationQuery(message: string, context: AIContext): AIResponse {
  return {
    message: `To register a business in New Brunswick:

1. **Choose your business structure** (sole proprietorship, partnership, corporation)
2. **Register with Service New Brunswick** (online or in-person)
3. **Apply for a business number** with Canada Revenue Agency (CRA)
4. **Register for HST** if annual revenue exceeds $30,000
5. **Obtain necessary licenses and permits** for your industry
6. **Open a business bank account**

Would you like help finding startup grants or connecting with other entrepreneurs?`,
    quickActions: [
      { label: "Find Startup Grants", action: "/funding" },
      { label: "Ask in Forum", action: "/forum/new" },
      { label: "Browse Resources", action: "/dashboard" },
    ],
  };
}

/**
 * Handle permits/licenses queries
 */
function handlePermitsQuery(message: string, context: AIContext): AIResponse {
  return {
    message: `📋 **Business Permits in Fredericton**

Common permits you may need:

• **Business Operating License** - Required for all businesses
• **Development Permit** - For renovations or signage changes
• **Food Service Permit** - Restaurants and food vendors
• **Home-Based Business Permit** - If operating from home

**Contact:** City of Fredericton Business Development
📞 (506) 460-2020

For specific requirements, visit the City of Fredericton's website or contact their Business Development office.`,
    quickActions: [
      { label: "Find Grants", action: "/funding" },
      { label: "Ask in Forum", action: "/forum/new" },
      { label: "Back to Dashboard", action: "/dashboard" },
    ],
  };
}

/**
 * Handle match percentage explanation
 */
function handleMatchExplanationQuery(message: string, context: AIContext): AIResponse {
  return {
    message: `Grant match percentages are calculated based on:

**Location** (25 points): Business must be in New Brunswick
**Revenue** (25 points): Meets revenue requirements
**Employees** (20 points): Meets employee count limits
**Industry** (30 points): Business industry matches grant focus

Your percentage shows how well your business profile aligns with the grant's eligibility criteria. Higher percentages mean better fit!

Green badges (>70%) = Excellent match
Yellow badges (40-70%) = Good match
Gray badges (<40%) = Possible match`,
    quickActions: [
      { label: "View My Matches", action: "/funding" },
      { label: "Update Business Profile", action: "/dashboard" },
    ],
  };
}

/**
 * Handle navigation queries
 */
function handleNavigationQuery(message: string, context: AIContext): AIResponse {
  if (message.includes("grant") || message.includes("funding")) {
    return {
      message: "You can find all available grants on the Funding page. Use the filters to narrow down by match percentage, amount, or deadline.",
      quickActions: [
        { label: "Go to Funding", action: "/funding" },
      ],
    };
  }

  if (message.includes("forum") || message.includes("discuss")) {
    return {
      message: "The Community Forum is where you can ask questions, share ideas, and connect with other Fredericton businesses.",
      quickActions: [
        { label: "Go to Forum", action: "/forum" },
        { label: "Post a Question", action: "/forum/new" },
      ],
    };
  }

  if (message.includes("partner") || message.includes("match")) {
    return {
      message: "The Business Matchmaker helps you find potential partners based on complementary needs and offerings.",
      quickActions: [
        { label: "Go to Matchmaker", action: "/matchmaker" },
      ],
    };
  }

  return getDefaultResponse(context);
}

/**
 * Handle talent/hiring queries
 */
function handleTalentQuery(message: string, context: AIContext): AIResponse {
  return {
    message: "The Talent Marketplace connects local businesses with skilled workers. You can post job listings or browse available talent.",
    quickActions: [
      { label: "Go to Talent Page", action: "/talent" },
      { label: "Post a Job", action: "/talent" },
    ],
  };
}

/**
 * Default fallback handler
 */
function handleDefaultQuery(message: string, context: AIContext): AIResponse {
  const { currentBusiness } = context;
  
  return {
    message: currentBusiness
      ? `I'm here to help ${currentBusiness.name}! You can ask me about:

• **Grants & Funding** - Find financial opportunities
• **Business Partnerships** - Connect with complementary businesses
• **Forum Discussions** - Get advice from the community
• **Deadlines** - Track upcoming grant deadlines
• **Business Registration** - Learn how to set up your business

What would you like to know?`
      : `I'm your AI advisor for the Auctus platform! I can help you with grants, partnerships, forum discussions, and more. Try asking about funding opportunities or business connections.`,
    quickActions: getPageSpecificActions(context.currentPage),
  };
}

/**
 * Get page-specific quick action suggestions
 */
export function getPageSpecificActions(currentPage: string): QuickAction[] {
  if (currentPage.includes("/dashboard")) {
    return [
      { label: "What are my best grants?", action: "query:best grants" },
      { label: "Show me deadlines", action: "query:upcoming deadlines" },
      { label: "Find partners", action: "query:business partners" },
    ];
  }

  if (currentPage.includes("/funding")) {
    return [
      { label: "Explain match percentages", action: "query:how are matches calculated" },
      { label: "What grants close soon?", action: "query:deadlines" },
      { label: "How do I apply?", action: "query:how to apply for grants" },
    ];
  }

  if (currentPage.includes("/forum")) {
    return [
      { label: "Help me write a post", action: "/forum/new" },
      { label: "Find discussions", action: "query:relevant forum threads" },
      { label: "Who can I collaborate with?", action: "query:partnerships" },
    ];
  }

  if (currentPage.includes("/matchmaker")) {
    return [
      { label: "Why was this matched?", action: "query:match explanation" },
      { label: "How to connect?", action: "query:how to reach partners" },
      { label: "Find suppliers", action: "query:supplier partnerships" },
    ];
  }

  if (currentPage.includes("/talent")) {
    return [
      { label: "Post a job listing", action: "/talent" },
      { label: "Find developers", action: "query:hiring developers" },
      { label: "Hiring best practices", action: "query:hiring advice" },
    ];
  }

  // Default actions for home or unknown pages
  return [
    { label: "Find grants", action: "query:grants" },
    { label: "Get help", action: "query:help" },
    { label: "Browse forum", action: "/forum" },
  ];
}

/**
 * Get default response when context is missing
 */
function getDefaultResponse(context: AIContext): AIResponse {
  return {
    message: "Please select a business from the navbar to get personalized recommendations.",
    quickActions: [
      { label: "Browse Grants", action: "/funding" },
      { label: "Visit Forum", action: "/forum" },
    ],
  };
}

/**
 * Process a quick action query (when user clicks a suggested chip)
 */
export function processQuickAction(action: string, context: AIContext): AIResponse {
  if (action.startsWith("query:")) {
    const query = action.replace("query:", "");
    return getAIResponse(query, context);
  }
  
  // For navigation actions, return empty response (component will handle navigation)
  return {
    message: "",
  };
}
