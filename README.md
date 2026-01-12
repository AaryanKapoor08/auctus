# Auctus AI - Business Growth Platform

**Auctus** (Latin for "growth") is a comprehensive web platform designed to connect Fredericton businesses with grants, partnerships, and community resources.

## 🚀 Overview

Auctus AI serves as a one-stop hub for local businesses to:
- **Discover grants** with intelligent matching based on eligibility
- **Connect with partners** through AI-powered business matchmaking
- **Engage with the community** via discussion forums
- **Find local talent** and job opportunities
- **Get instant help** from an AI business advisor

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React 0.562.0
- **State Management:** React Context + Zustand pattern
- **Runtime:** React 19.2.3
- **Node:** 20+ required

## 📁 Project Structure

```
auctus-frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home/Landing page
│   ├── dashboard/                # Business dashboard
│   ├── forum/                    # Community forum
│   │   ├── [threadId]/           # Thread detail pages
│   │   └── new/                  # Create new thread
│   ├── funding/                  # Grant discovery
│   │   └── [grantId]/            # Grant detail pages
│   ├── matchmaker/               # Business matching
│   ├── talent/                   # Jobs & talent marketplace
│   ├── layout.tsx                # Root layout with navbar/footer
│   ├── providers.tsx             # Context providers wrapper
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── cards/                    # Data display cards
│   ├── layout/                   # Navbar & Footer
│   ├── AIChatbot.tsx             # AI advisor chatbot
│   └── ErrorBoundary.tsx         # Error handling
│
├── lib/                          # Utilities & logic
│   ├── data-utils.ts             # Data access functions
│   ├── ai-responses.ts           # AI chatbot logic
│   ├── BusinessContext.jsx       # Business state context
│   ├── ToastContext.tsx          # Toast notification system
│   └── utils.ts                  # Helper functions
│
├── data/                         # Static JSON data
│   ├── businesses.json           # 7 demo businesses
│   ├── grants.json               # 30 grant opportunities
│   ├── threads.json              # 18 forum threads
│   ├── replies.json              # 50+ forum replies
│   ├── matches.json              # Business partnerships
│   ├── jobs.json                 # 15 job listings
│   └── talents.json              # 10 talent profiles
│
└── context_hub/                  # Development documentation
```

## 🎯 Key Features

### 1. Smart Grant Matching
- **Eligibility checking:** Automatic matching based on location, revenue, employees, and industry
- **Match percentage:** Visual indicators (green >80%, yellow 60-80%, gray <60%)
- **Advanced filtering:** By amount, deadline, category, and match score
- **Countdown timers:** Days remaining until grant deadlines

### 2. Community Forum
- **6 categories:** Ask for Help, Collaboration, Hiring, Marketplace, Business Ideas, Announcements
- **Real-time search:** Filters by title, content, and tags
- **Sort options:** Most Recent, Most Replies, Most Helpful
- **AI suggestions:** Related grants and threads based on discussion

### 3. Business Matchmaking
- **Smart algorithm:** Matches based on complementary needs and offers
- **4 filter tabs:** All Matches, You Need/They Offer, You Offer/They Need, Mutual Benefits
- **Match scores:** 0-100% compatibility with detailed reasoning

### 4. AI Business Advisor
- **Context-aware:** Adapts responses based on current page and business
- **8+ query handlers:** Grants, partnerships, deadlines, forum, registration, navigation
- **Suggestion cards:** Clickable recommendations with direct navigation

### 5. Talent Marketplace
- **Dual views:** "I'm Hiring" and "Looking for Work"
- **Skill filtering:** Search by tech stack and expertise
- **Job types:** Full-time, Part-time, Contract, Internship

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd auctus-frontend

# Install dependencies
npm install
```

### Development

```bash
# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 👥 Demo Businesses

The platform includes 7 demo businesses for testing:

1. **Aroma Coffee House** (biz-1) - Coffee shop seeking equipment financing
2. **Maritime Manufacturing** (biz-2) - Metal fabrication seeking expansion grants
3. **Digital Dreams Agency** (biz-3) - Marketing agency seeking tech talent
4. **Harvest Table Restaurant** (biz-4) - Farm-to-table restaurant
5. **TechStart Solutions** (biz-5) - IT consultancy seeking growth funding
6. **Coastal Adventures** (biz-6) - Tour company seeking tourism grants
7. **Artisan Collective** (biz-7) - Craft cooperative seeking expansion

## 🔧 Using Toast Notifications

The platform includes a global toast notification system:

```typescript
import { useToast } from "@/lib/ToastContext";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong.");
  };

  const handleInfo = () => {
    toast.info("This is an informational message.");
  };

  const handleWarning = () => {
    toast.warning("Please review before proceeding.");
  };

  // Custom duration (default is 5000ms)
  const handleCustom = () => {
    toast.success("Quick message!", 2000);
  };
}
```

## 🎨 Design System

### Colors
- **Primary:** `#2563eb` (Blue) - Trust, professional
- **Secondary:** `#10b981` (Green) - Growth, success
- **Accent:** `#f59e0b` (Orange) - Energy, action

### Components
All UI components support multiple variants:
- **Buttons:** primary, secondary, outline, ghost
- **Badges:** Color-coded by category
- **Cards:** Consistent shadow and padding

## 📊 Performance Optimizations

- **Dynamic imports:** AI Chatbot lazy-loaded (reduces initial bundle ~20-30%)
- **Image optimization:** Next.js Image component with WebP/AVIF support
- **Code splitting:** Automatic route-based splitting
- **Memoization:** Expensive calculations cached with useMemo

## ♿ Accessibility

- **Keyboard navigation:** All interactive elements accessible via keyboard
- **ARIA labels:** Proper labeling for screen readers
- **Semantic HTML:** Proper use of HTML5 elements
- **Focus states:** Visible focus rings on all interactive elements

## 🧪 Testing

### Manual Testing Checklist
- [ ] Test all 9 pages load without errors
- [ ] Test business context switching
- [ ] Test grant filtering and matching
- [ ] Test forum search and categories
- [ ] Test AI chatbot on different pages
- [ ] Test responsive design (mobile, tablet, desktop)

### Cross-Browser Testing
- Chrome (primary)
- Firefox
- Safari
- Edge

## 🚀 Deployment

### Environment Variables

Create a `.env.local` file (see `.env.example`):

```bash
# Future API endpoints
# NEXT_PUBLIC_API_URL=https://api.auctus.ai

# Feature flags
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Build Commands

```bash
# Production build
npm run build

# The output will be in the .next folder
# Deploy the entire project directory to your hosting platform
```

### Recommended Hosting
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted with Node.js**

## 📝 Development Guidelines

### Adding a New Page
1. Create page file in `app/your-page/page.tsx`
2. Add route to Navbar component
3. Implement with existing UI components
4. Test responsive layout
5. Add to validation documentation

### Adding New Data
1. Add data to appropriate JSON file in `/data`
2. Update TypeScript interfaces in `lib/data-utils.ts`
3. Create/update utility functions for data access
4. Test data relationships and integrity

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Use Tailwind classes (avoid custom CSS)
- Keep components focused and reusable

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npx tsc --noEmit
```

## 📚 Documentation

- [Development Plan](context_hub/frontend_devplan.md) - Original development strategy
- [Feature Specifications](context_hub/frontend_gameplan.md) - Detailed feature breakdown
- [Phase Validations](context_hub/) - Testing and validation docs
- [Demo Script](context_hub/phase7.5_demo_script.md) - Presentation guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license here]

## 👏 Acknowledgments

Built with Next.js, React, TypeScript, and Tailwind CSS.

---

**Version:** 1.0.0  
**Last Updated:** January 2026
