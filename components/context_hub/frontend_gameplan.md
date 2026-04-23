# **Auctus AI \- Complete Frontend Structure Analysis**

## **🎨 Overall Layout Structure**

### **Global Components (Appear on Every Page)**

1. **Navbar** (top of every page)  
   * Logo (Auctus AI branding)  
   * Navigation links: Dashboard, Forum, Funding, Matchmaker, Talent, AI Advisor  
   * Demo user switcher dropdown (switch between 5-7 businesses)  
   * Current business name display  
   * Search icon (optional global search)  
2. **Footer** (bottom of every page)  
   * Simple copyright, links  
3. **AI Chatbot Widget** (floating, available everywhere)  
   * Floating button bottom-right corner  
   * Click opens chat window (modal/slide-up)  
   * Message history  
   * Input field  
   * Minimize/maximize button

---

## **📄 Pages Breakdown (6 Main Routes)**

### **1️⃣ HOME/LANDING PAGE (`/`)**

**Purpose:** First impression, explains what Auctus AI is

**Components:**

* Hero section with tagline  
* Feature cards (5 features overview)  
* CTA button: "Get Started" → Dashboard  
* Stats: "X businesses connected", "Y grants matched"  
* Testimonial cards (fake quotes from demo businesses)

---

### **2️⃣ DASHBOARD PAGE (`/dashboard`)**

**Purpose:** Personalized hub \- user's home base after login

**Layout:** Grid with widgets

**Components:**

1. **Welcome Header**  
   * "Welcome back, \[Business Name\]"  
   * Current date  
2. **Stats Cards Row** (4 cards across)  
   * "New Grants Available" (number \+ icon)  
   * "Active Forum Threads" (number \+ icon)  
   * "Business Matches" (number \+ icon)  
   * "Upcoming Deadlines" (number \+ icon)  
3. **Recommendations Widget** (left side, 60% width)  
   * Card titled "Recommended For You"  
   * List of 3-5 items:  
     * Grant: "Canada Small Business Grant \- 85% match"  
     * Thread: "Looking for bakery supplier \- relevant to you"  
     * Match: "Coffee shop wants partnership"  
   * Each item \= clickable card → goes to detail page  
   * "View All" button  
4. **Activity Feed Widget** (right side, 40% width)  
   * Card titled "Recent Activity"  
   * Scrollable list:  
     * "New grant posted: Manufacturing Tax Credit"  
     * "Sarah posted in Help category"  
     * "Deadline approaching: Tourism Fund (3 days)"  
   * Timestamps for each  
5. **Quick Actions Widget** (bottom, full width)  
   * 3-4 large buttons with icons:  
     * "Post in Forum"  
     * "Browse Grants"  
     * "View Matches"  
     * "Ask AI Advisor"

---

### **3️⃣ FORUM PAGE (`/forum`)**

**Purpose:** Community discussion hub \- PRIMARY FEATURE

#### **Main Forum Page (`/forum`)**

**Components:**

1. **Forum Header**  
   * Page title: "Community Forum"  
   * Subtext: "Connect with Fredericton business owners"  
   * "New Thread" button (primary CTA)  
2. **Search & Filter Bar**  
   * Search input: "Search threads..."  
   * Sort dropdown: "Most Recent", "Most Replies", "Most Helpful"  
3. **Category Filter Tabs** (horizontal pills/buttons)  
   * All (shows count)  
   * Ask for Help  
   * Collaboration Opportunities  
   * Hiring & Local Talent  
   * Marketplace  
   * Business Ideas  
   * Announcements  
   * Active state highlighting on selected  
4. **Thread List** (main content)  
   * **ThreadCard Component** (repeated for each thread):  
     * Thread title (large, bold)  
     * Author name \+ business name  
     * Category badge (colored pill)  
     * Preview of content (first 2 lines)  
     * Tags (small pills): \#funding, \#expansion  
     * Reply count icon \+ number  
     * Timestamp: "2 hours ago"  
     * Hover effect (shadow, slight lift)  
   * Pagination or "Load More" button  
5. **Sidebar** (right side, optional)  
   * "Trending Topics" widget  
   * "Active Members" widget

#### **Thread Detail Page (`/forum/[threadId]`)**

**Components:**

1. **Back Button**  
   * "← Back to Forum"  
2. **Thread Header**  
   * Full title  
   * Author info (name, business, avatar)  
   * Category badge  
   * Timestamp  
   * Tags  
3. **Thread Content**  
   * Full post content (multiple paragraphs)  
   * Could have formatting (bold, lists)  
4. **AI Suggestions Sidebar** (right side)  
   * "AI Recommendations" card  
   * 2-3 suggestions:  
     * "Relevant Grant: Canada Small Business Fund"  
     * "Similar Thread: Kitchen expansion advice"  
     * "Connect with: Mike's Coffee Shop"  
5. **Replies Section**  
   * Section header: "5 Replies"  
   * **ReplyCard Component** (repeated):  
     * Author info  
     * Reply content  
     * Timestamp  
     * Optional: helpful button  
6. **Reply Input Box** (bottom)  
   * Textarea: "Add your reply..."  
   * "Post Reply" button  
   * Character count

#### **New Thread Page (`/forum/new`)**

**Components:**

1. **Form Layout**  
   * Page title: "Create New Thread"  
2. **Form Fields**  
   * Title input (text)  
   * Category dropdown (6 categories)  
   * Content textarea (rich text)  
   * Auto-suggested tags (chips appear as you type)  
3. **Preview Panel** (side-by-side or below)  
   * Shows how thread will look  
   * Updates in real-time  
4. **Action Buttons**  
   * "Post Thread" (primary)  
   * "Save Draft" (secondary)  
   * "Cancel"

---

### **4️⃣ FUNDING PAGE (`/funding`)**

**Purpose:** Grant discovery and matching \- BIGGEST VALUE PROP

#### **Main Funding Page (`/funding`)**

**Components:**

1. **Funding Header**  
   * Title: "Funding Opportunities"  
   * Subtext: "Grants matched to \[Your Business Name\]"  
2. **Stats Banner** (top row)  
   * "Total Available: $2.5M"  
   * "Your Matches: 12 grants"  
   * "Deadlines This Month: 3"  
3. **Filter Sidebar** (left, 25% width)  
   * **Filters:**  
     * Match score slider (0-100%)  
     * Amount range slider  
     * Deadline range (next 30/60/90 days)  
     * Category checkboxes (Manufacturing, Tourism, Tech, etc.)  
   * "Reset Filters" button  
4. **Sort Options** (top of main content)  
   * Dropdown: "Best Match", "Highest Amount", "Soonest Deadline"  
5. **Grant List** (main content, 75% width)  
   * **GrantCard Component** (repeated):  
     * Grant name (title)  
     * Amount (large, prominent): "$50,000"  
     * Match percentage badge: "85% match" (color-coded: green \>70%, yellow 40-70%, gray \<40%)  
     * Deadline: "Closes: March 15, 2026"  
     * Short description (2 lines)  
     * Category tag  
     * "Learn More" button  
   * Grid layout (2 columns) or list layout  
6. **Funding Roadmap Widget** (below list or sidebar)  
   * Timeline visualization:  
     * Next 30 days (3 grants)  
     * 30-60 days (5 grants)  
     * 60-90 days (4 grants)  
   * Visual timeline with grant names as nodes

#### **Grant Detail Page (`/funding/[grantId]`)**

**Components:**

1. **Back Button**  
2. **Grant Header**  
   * Grant name (large)  
   * Amount \+ match percentage badge  
   * Deadline countdown: "23 days remaining"  
3. **Grant Details Section**  
   * **Description:** Full paragraph(s)  
   * **Eligibility Checklist:**  
     * Checkboxes (✓/✗) based on user's business:  
       * ✓ "Located in New Brunswick"  
       * ✓ "Annual revenue under $500k"  
       * ✗ "Manufacturing industry"  
     * Overall eligibility: "You meet 8/10 requirements"  
4. **How to Apply Section**  
   * Step-by-step instructions  
   * Required documents list  
   * Application link button  
5. **Similar Grants Widget** (sidebar or bottom)  
   * "You might also qualify for:"  
   * 3 mini grant cards  
6. **AI Assistant Prompt** (sticky bottom)  
   * "Need help with this application? Ask AI Advisor"  
   * Quick link to open chatbot

---

### **5️⃣ BUSINESS MATCHMAKER PAGE (`/matchmaker`)**

**Purpose:** Partnership suggestions

**Components:**

1. **Matchmaker Header**  
   * Title: "Business Connections"  
   * Subtext: "Partners matched to your needs"  
2. **Match Filter Tabs**  
   * "All Matches"  
   * "You Need / They Offer"  
   * "You Offer / They Need"  
   * "Mutual Benefits"  
3. **Match List**  
   * **MatchCard Component** (repeated):  
     * Layout: Two business cards side-by-side with arrow between  
     * **Left:** Your business  
     * **Arrow/Connection Icon:** Shows relationship  
     * **Right:** Partner business  
     * **Reasoning Section:**  
       * "You need: Wholesale supplier"  
       * "They offer: Bulk coffee beans"  
       * Match score: "92% compatibility"  
     * "Connect" button → opens forum DM or shows contact  
4. **No Matches State**  
   * Empty state illustration  
   * "Update your profile to see matches"

---

### **6️⃣ TALENT MARKETPLACE PAGE (`/talent`)**

**Purpose:** Local hiring/gigs

**Components:**

1. **Talent Header**  
   * Title: "Local Talent Marketplace"  
   * Toggle: "I'm Hiring" / "I'm Looking for Work"  
2. **Filter Bar**  
   * Skills dropdown (multi-select)  
   * Job type: Full-time, Part-time, Contract, Internship  
   * Availability filter  
3. **Job Listings** (if "I'm Hiring" view)  
   * **JobCard Component:**  
     * Job title  
     * Business posting  
     * Skills required (tags)  
     * Pay range  
     * Posted timestamp  
     * "Apply" button  
4. **Talent Profiles** (if "I'm Looking" view)  
   * **TalentCard Component:**  
     * Name \+ avatar  
     * Skills (tags)  
     * Availability  
     * Bio (1-2 lines)  
     * "View Profile" button  
5. **Post Job/Profile Button** (floating CTA)

---

## **🤖 AI Advisor Chatbot (Global Component)**

**Components:**

1. **Floating Button** (bottom-right, all pages)  
   * Icon: message bubble with "AI" badge  
   * Pulse animation  
   * Click opens chat  
2. **Chat Window** (modal/slide-up)  
   * **Header:**  
     * "Auctus AI Advisor"  
     * Minimize/Close buttons  
   * **Message Area:**  
     * Message bubbles (user vs AI)  
     * User messages: right-aligned, blue  
     * AI messages: left-aligned, gray  
     * Typing indicator when AI "thinking"  
   * **Input Area:**  
     * Text input: "Ask me anything..."  
     * Send button  
     * Quick suggestion chips:  
       * "How do I register a business?"  
       * "What grants am I eligible for?"  
       * "Connect me with suppliers"

---

## **🎨 Visual Style Recommendation**

### **Style Direction: Modern SaaS Dashboard**

**Why this style:**

* Professional but approachable (small business audience)  
* Clean and uncluttered (lots of info to display)  
* Trust-inspiring (handling business/money decisions)

**Design Characteristics:**

1. **Color Palette:**  
   * Primary: Deep blue (`#2563eb`) \- trust, professional  
   * Secondary: Green (`#10b981`) \- growth, success (matches "Auctus" \= growth)  
   * Accent: Orange (`#f59e0b`) \- energy, action  
   * Neutrals: Gray scale for text/backgrounds  
   * Success/Warning/Error: Standard semantic colors  
2. **Layout:**  
   * Lots of white space (don't cram)  
   * Card-based design (everything in cards/containers)  
   * Consistent padding: p-6 for cards, p-4 for smaller  
   * Rounded corners: rounded-lg everywhere  
   * Subtle shadows: shadow-sm on cards, shadow-md on hover  
3. **Typography:**  
   * Headings: Bold, clear hierarchy (text-3xl → text-xl)  
   * Body: text-base, comfortable reading  
   * Consistent font: System fonts (fast loading)  
4. **Interactive Elements:**  
   * Hover states on EVERYTHING clickable  
   * Smooth transitions (transition-all duration-200)  
   * Button states: default, hover, active, disabled  
   * Color-coded badges/pills for categories  
5. **Components Style:**  
   * **Buttons:** Rounded, clear CTAs, primary \= filled, secondary \= outline  
   * **Cards:** White bg, border or subtle shadow, rounded  
   * **Badges:** Small pills, colored backgrounds  
   * **Forms:** Clean inputs with labels above  
   * **Navigation:** Clear active states  
6. **Responsive:**  
   * Mobile: Stack everything vertically  
   * Tablet: 2-column grids  
   * Desktop: 3-4 column grids  
   * Sidebar collapses on mobile

---

## **📊 Component Hierarchy Summary**

GLOBAL COMPONENTS (always visible)  
├── Navbar  
├── Footer  
└── AI Chatbot Widget

PAGES  
├── Home (/)  
│   ├── Hero  
│   ├── Feature Cards  
│   └── Testimonials  
│  
├── Dashboard (/dashboard)  
│   ├── Welcome Header  
│   ├── Stats Cards (4)  
│   ├── Recommendations Widget  
│   ├── Activity Feed Widget  
│   └── Quick Actions  
│  
├── Forum (/forum)  
│   ├── Main Forum  
│   │   ├── Search & Filters  
│   │   ├── Category Tabs  
│   │   └── Thread Cards List  
│   ├── Thread Detail (/forum/\[id\])  
│   │   ├── Thread Content  
│   │   ├── AI Suggestions  
│   │   └── Replies \+ Reply Input  
│   └── New Thread (/forum/new)  
│       └── Thread Creation Form  
│  
├── Funding (/funding)  
│   ├── Main Funding  
│   │   ├── Stats Banner  
│   │   ├── Filter Sidebar  
│   │   ├── Grant Cards List  
│   │   └── Funding Roadmap  
│   └── Grant Detail (/funding/\[id\])  
│       ├── Grant Info  
│       ├── Eligibility Checklist  
│       └── Similar Grants  
│  
├── Matchmaker (/matchmaker)  
│   ├── Filter Tabs  
│   └── Match Cards  
│  
└── Talent (/talent)  
    ├── View Toggle  
    ├── Filters

    └── Job/Talent Cards

---

## **🛠️ Development Strategy Suggestion**

### **Build Order (Frontend-First Approach):**

**Week 1: Foundation**

1. ✅ Set up Next.js \+ install all packages  
2. ✅ Create folder structure  
3. ✅ Build Navbar \+ Footer (static)  
4. ✅ Create all page shells (empty pages with titles)  
5. ✅ Build UI component library:  
   * Button  
   * Card  
   * Input  
   * Badge  
   * Select  
   * Textarea  
6. ✅ Set up Zustand store (demo user switching)  
7. ✅ Make user switcher work in Navbar

**Week 2: Build Pages (No Data Yet)**

1. ✅ Dashboard \- all widgets with hardcoded fake data  
2. ✅ Forum main page \- layout \+ filters \+ fake thread cards  
3. ✅ Thread detail \- layout \+ fake replies  
4. ✅ Funding main \- layout \+ filters \+ fake grant cards  
5. ✅ Grant detail \- layout \+ eligibility section  
6. ✅ Matchmaker \- layout \+ fake match cards  
7. ✅ Talent \- layout \+ fake job cards

**Week 3: Connect Real Data \+ Logic**

1. ✅ Create all JSON files with real sample data  
2. ✅ Import JSON into pages  
3. ✅ Build filtering logic (forum categories, grant matching)  
4. ✅ Build AI chatbot logic (keyword matching)  
5. ✅ Connect everything to Zustand (user switching updates all pages)

**Week 4: Polish \+ Demo Prep**

1. ✅ Add loading states everywhere  
2. ✅ Add empty states  
3. ✅ Error handling (null checks)  
4. ✅ Responsive design fixes  
5. ✅ Test demo flow 100 times  
6. ✅ Final UI polish (animations, hover states)

---

## **🎯 Critical Frontend Elements for Demo**

**Must Work Perfectly:**

1. ✅ User switching (different businesses see different data)  
2. ✅ Forum filtering (categories work)  
3. ✅ Grant matching (shows different matches per user)  
4. ✅ AI chatbot (responds to questions)  
5. ✅ Navigation (no broken links)  
6. ✅ Responsive (works on laptop for demo)

**Can Be Static/Simple:**

* Search functionality (can just filter by title)  
* Talent marketplace (can show static listings)  
* New thread form (can just show success message)  
* Reply to thread (can just show success message)

