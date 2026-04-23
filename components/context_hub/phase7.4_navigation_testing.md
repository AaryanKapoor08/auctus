# Phase 7.4: Navigation Flow Testing - Complete Guide

## 🎯 Objective
Ensure zero broken links and smooth user journeys across the entire Auctus AI application.

---

## 📍 Complete Route Map

### **Public Routes**
| Route | Component | Description | Status |
|-------|-----------|-------------|--------|
| `/` | Home Page | Landing page with features | ✅ Built |
| `/dashboard` | Dashboard | Business-specific overview | ✅ Built |
| `/forum` | Forum Main | Thread listing with filters | ✅ Built |
| `/forum/new` | New Thread | Create thread form | ✅ Built |
| `/forum/[threadId]` | Thread Detail | Individual thread view | ✅ Built |
| `/funding` | Funding Main | Grant listing with filters | ✅ Built |
| `/funding/[grantId]` | Grant Detail | Individual grant view | ✅ Built |
| `/matchmaker` | Matchmaker | Business matching | ✅ Built |
| `/talent` | Talent Market | Jobs/talent listings | ✅ Built |

### **Test Routes** (Dev Only)
| Route | Component | Description | Status |
|-------|-----------|-------------|--------|
| `/test-components` | Component Tests | UI component showcase | ✅ Built |
| `/test-cards` | Card Tests | Card component showcase | ✅ Built |
| `/test-components/store-test` | Store Test | Business context test | ✅ Built |

---

## 🗺️ User Journey Test Cases

### **Journey 1: New User Discovery Flow**
**Path:** Home → Dashboard → Grant Detail → Apply

**Steps:**
1. ✅ **Home Page** (`/`)
   - [ ] Click "Get Started" button
   - [ ] Verify navigation to `/dashboard`

2. ✅ **Dashboard** (`/dashboard`)
   - [ ] Verify business is selected (or prompt to select)
   - [ ] View grant recommendations
   - [ ] Click on a grant card in "Recommended For You"
   - [ ] Verify navigation to `/funding/[grantId]`

3. ✅ **Grant Detail** (`/funding/[grantId]`)
   - [ ] View grant details
   - [ ] See eligibility checklist
   - [ ] Click "How to Apply" section
   - [ ] Verify external link or action

**Expected Outcome:** Smooth flow from discovery to action without any 404s or broken links.

---

### **Journey 2: Community Engagement Flow**
**Path:** Dashboard → Forum → Thread Detail → Reply

**Steps:**
1. ✅ **Dashboard** (`/dashboard`)
   - [ ] Click "Post in Forum" quick action OR
   - [ ] Click "Browse Forum" button
   - [ ] Verify navigation to `/forum`

2. ✅ **Forum Main** (`/forum`)
   - [ ] Browse threads
   - [ ] Use category filters
   - [ ] Click on a thread card
   - [ ] Verify navigation to `/forum/[threadId]`

3. ✅ **Thread Detail** (`/forum/[threadId]`)
   - [ ] Read thread content
   - [ ] View replies
   - [ ] Scroll to reply input
   - [ ] Type reply
   - [ ] Click "Post Reply"
   - [ ] Verify success message (toast or alert)

4. ✅ **Return to Forum**
   - [ ] Click "Back to Forum" button
   - [ ] Verify navigation to `/forum`

**Expected Outcome:** Complete engagement loop with clear navigation paths.

---

### **Journey 3: Grant Discovery Flow**
**Path:** Home → Funding → Grant Detail → Similar Grants

**Steps:**
1. ✅ **Home Page** (`/`)
   - [ ] Click "Browse Grants" or navigation link
   - [ ] Verify navigation to `/funding`

2. ✅ **Funding Main** (`/funding`)
   - [ ] Apply filters (match score, amount, deadline)
   - [ ] Sort grants
   - [ ] Click on a grant card
   - [ ] Verify navigation to `/funding/[grantId]`

3. ✅ **Grant Detail** (`/funding/[grantId]`)
   - [ ] View grant information
   - [ ] Check eligibility
   - [ ] Scroll to "Similar Grants" section
   - [ ] Click on a similar grant
   - [ ] Verify navigation to new `/funding/[newGrantId]`
   - [ ] Verify page updates with new grant data

**Expected Outcome:** Seamless grant browsing with working internal links.

---

### **Journey 4: Partnership Discovery Flow**
**Path:** Dashboard → Matchmaker → Connect

**Steps:**
1. ✅ **Dashboard** (`/dashboard`)
   - [ ] View "Potential Business Partnerships" widget
   - [ ] Click "View All Matches"
   - [ ] Verify navigation to `/matchmaker`

2. ✅ **Matchmaker** (`/matchmaker`)
   - [ ] View business profile summary
   - [ ] Switch between filter tabs
   - [ ] View match cards
   - [ ] Click "Connect" button
   - [ ] Verify success message

**Expected Outcome:** Clear path to finding and connecting with partners.

---

### **Journey 5: AI Chatbot Universal Access**
**Path:** Any Page → AI Chatbot → Contextual Help

**Steps:**
1. ✅ **From Any Page**
   - [ ] Home page
   - [ ] Dashboard
   - [ ] Forum
   - [ ] Thread detail
   - [ ] Funding
   - [ ] Grant detail
   - [ ] Matchmaker
   - [ ] Talent

2. ✅ **AI Chatbot Interaction**
   - [ ] Click floating AI button (bottom-right)
   - [ ] Verify chat window opens
   - [ ] See context-aware quick action chips
   - [ ] Type a query
   - [ ] Receive response
   - [ ] Click on suggestion links
   - [ ] Verify navigation works
   - [ ] Close chatbot
   - [ ] Verify button reappears

**Expected Outcome:** AI chatbot accessible and functional from every page.

---

## 🔄 Business Context Switching Tests

### **Test: Global Business Context Update**

**Objective:** Verify that changing business updates all pages dynamically.

**Setup:**
1. Start with Business A selected (e.g., "Aroma Coffee House")
2. Navigate through pages, note the data
3. Switch to Business B (e.g., "Maritime Manufacturing")
4. Verify all data updates

**Pages to Test:**

#### **Dashboard (`/dashboard`)**
- [ ] Welcome header shows new business name
- [ ] Stats cards update (grant count, matches)
- [ ] Grant recommendations change
- [ ] Relevant threads change
- [ ] Potential matches change

#### **Funding (`/funding`)**
- [ ] Stats banner updates (matches count)
- [ ] Grant cards show different match percentages
- [ ] Sorted order may change

#### **Grant Detail (`/funding/[grantId]`)**
- [ ] Eligibility checklist updates
- [ ] Match percentage badge changes
- [ ] "Similar Grants" widget updates

#### **Forum (`/forum`)**
- [ ] Relevant threads section updates (if shown)
- [ ] Context remains consistent

#### **Matchmaker (`/matchmaker`)**
- [ ] Business profile card shows new business
- [ ] "What you need" and "What you offer" update
- [ ] Match list completely changes
- [ ] Match counts in tabs update

#### **AI Chatbot**
- [ ] Welcome message mentions new business name
- [ ] Grant suggestions specific to new business
- [ ] Partnership suggestions change

**Expected Outcome:** All pages reflect the new business context immediately.

---

## 🔗 Link Integrity Tests

### **Navbar Links (All Pages)**
Test from each page:

| Link | Target Route | Status |
|------|--------------|--------|
| Logo | `/` | [ ] |
| Dashboard | `/dashboard` | [ ] |
| Forum | `/forum` | [ ] |
| Funding | `/funding` | [ ] |
| Matchmaker | `/matchmaker` | [ ] |
| Talent | `/talent` | [ ] |

**Active State Highlighting:**
- [ ] Current page link is highlighted
- [ ] Color or underline indicates active state

---

### **Footer Links (All Pages)**
Test from each page:

| Link | Target | Status |
|------|--------|--------|
| Footer Link 1 | (Depends on implementation) | [ ] |
| Footer Link 2 | (Depends on implementation) | [ ] |
| Footer Link 3 | (Depends on implementation) | [ ] |

---

### **Card Click Navigation**

**Dashboard Cards:**
- [ ] Grant recommendation cards → `/funding/[grantId]`
- [ ] Thread recommendation cards → `/forum/[threadId]`
- [ ] Match cards → Stay on dashboard (info only)

**Forum Cards:**
- [ ] Thread cards → `/forum/[threadId]`

**Funding Cards:**
- [ ] Grant cards → `/funding/[grantId]`

**Matchmaker Cards:**
- [ ] Match cards → No navigation (info + Connect button)

**Thread Detail Related Content:**
- [ ] Related grant links → `/funding/[grantId]`
- [ ] Similar thread links → `/forum/[threadId]`

**Grant Detail Similar Grants:**
- [ ] Similar grant cards → `/funding/[grantId]`

---

### **Button Navigation**

**Dashboard Quick Actions:**
- [ ] "Post in Forum" → `/forum/new`
- [ ] "Browse Grants" → `/funding`
- [ ] "View Matches" → `/matchmaker`
- [ ] "Ask AI Advisor" → Opens chatbot (no navigation)

**Dashboard Widget Buttons:**
- [ ] "View All Grants" → `/funding`
- [ ] "Browse Forum" → `/forum`
- [ ] "View All Matches" → `/matchmaker`

**Forum Page:**
- [ ] "New Thread" button → `/forum/new`

**Thread Detail:**
- [ ] "Back to Forum" → `/forum`
- [ ] "View in Matchmaker" (author card) → `/matchmaker`

**Grant Detail:**
- [ ] Back button (if present) → `/funding`

---

## 🚨 Edge Case Testing

### **Direct URL Access**
Test entering URLs directly in browser:

- [ ] `/dashboard` - Works
- [ ] `/forum` - Works
- [ ] `/forum/thread-1` - Works
- [ ] `/forum/invalid-id` - Shows 404 or error
- [ ] `/funding` - Works
- [ ] `/funding/grant-1` - Works
- [ ] `/funding/invalid-id` - Shows 404 or error
- [ ] `/matchmaker` - Works
- [ ] `/talent` - Works
- [ ] `/nonexistent-route` - Shows 404

### **Browser Navigation**
- [ ] Back button works correctly from all pages
- [ ] Forward button works correctly
- [ ] Refresh on any page preserves state (or shows loading)
- [ ] Deep link refresh works (e.g., `/forum/thread-1`)

### **No Business Selected**
- [ ] Dashboard shows loading state or prompt
- [ ] Funding shows loading state or prompt
- [ ] Matchmaker shows loading state or prompt
- [ ] Other pages handle gracefully

### **Invalid IDs in Dynamic Routes**
- [ ] `/forum/xyz123` - Shows "Thread Not Found"
- [ ] `/funding/xyz123` - Shows "Grant Not Found" or similar
- [ ] Error pages have "Go Back" or "Home" buttons

---

## ✅ Navigation Testing Checklist

### **Pre-Test Setup**
- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (check for errors)
- [ ] Network tab open (monitor requests)
- [ ] Start with clean browser state

### **Test Execution**
- [ ] Complete Journey 1 (New User Discovery)
- [ ] Complete Journey 2 (Community Engagement)
- [ ] Complete Journey 3 (Grant Discovery)
- [ ] Complete Journey 4 (Partnership Discovery)
- [ ] Complete Journey 5 (AI Chatbot Access)
- [ ] Test Business Context Switching
- [ ] Test All Navbar Links
- [ ] Test All Card Click Navigation
- [ ] Test All Button Navigation
- [ ] Test Edge Cases

### **Pass Criteria**
- [ ] Zero broken links (no 404s on valid routes)
- [ ] All navigation smooth (no flash/flicker)
- [ ] Business context updates everywhere
- [ ] Back button works logically
- [ ] Error pages have recovery options
- [ ] No console errors during navigation

---

## 📊 Test Results Template

```markdown
## Navigation Test Run - [Date]

### Test Environment
- Browser: [Chrome/Firefox/Safari]
- Screen Size: [Desktop/Tablet/Mobile]
- Business Selected: [Business Name]

### Journey Results
- [ ] Journey 1: PASS / FAIL - Notes: ___
- [ ] Journey 2: PASS / FAIL - Notes: ___
- [ ] Journey 3: PASS / FAIL - Notes: ___
- [ ] Journey 4: PASS / FAIL - Notes: ___
- [ ] Journey 5: PASS / FAIL - Notes: ___

### Business Context Switching
- [ ] Dashboard: PASS / FAIL
- [ ] Funding: PASS / FAIL
- [ ] Matchmaker: PASS / FAIL
- [ ] AI Chatbot: PASS / FAIL

### Issues Found
1. [Issue description]
   - Route: [route]
   - Expected: [expected behavior]
   - Actual: [actual behavior]
   - Severity: High/Medium/Low

### Overall Result
- [ ] ALL TESTS PASSED ✅
- [ ] SOME TESTS FAILED ❌ - [X issues found]
```

---

## 🛠️ Common Issues & Solutions

### **Issue: 404 on Dynamic Route**
**Symptoms:** Clicking link shows 404 page
**Solutions:**
- Verify ID exists in data files
- Check file naming: `[threadId]` not `[id]`
- Ensure `use(params)` is used in async components

### **Issue: Business Context Not Updating**
**Symptoms:** Data doesn't change when switching business
**Solutions:**
- Check if page reads from `useBusiness()` hook
- Verify `useEffect` dependencies include `currentBusiness`
- Check if filters/calculations use `currentBusiness.id`

### **Issue: Back Button Broken**
**Symptoms:** Back button doesn't work or goes to wrong page
**Solutions:**
- Use `router.push()` instead of `window.location`
- Ensure `useRouter` from `next/navigation`
- Check if router is defined before use

### **Issue: Link Not Clickable**
**Symptoms:** Click does nothing
**Solutions:**
- Verify `onClick` handler is attached
- Check for `pointer-events-none` in CSS
- Ensure no overlay blocking clicks
- Check z-index stacking

---

## 🎯 Success Criteria

✅ **Navigation is considered SUCCESSFUL when:**

1. **Zero Broken Links**
   - All navbar links work
   - All card clicks navigate correctly
   - All buttons navigate correctly
   - No 404s on valid routes

2. **Consistent Context**
   - Business switching updates all pages
   - AI chatbot context is page-aware
   - Data filters by current business

3. **Smooth UX**
   - No loading flashes
   - Transitions are smooth
   - Back button is logical
   - Error pages offer recovery

4. **Edge Cases Handled**
   - Invalid IDs show error pages
   - Direct URLs work
   - Browser nav works
   - No business selected handled gracefully

---

## 📝 Next Steps

After completing navigation testing:
1. Document all issues found
2. Prioritize fixes (High/Medium/Low)
3. Implement fixes
4. Re-test affected journeys
5. Proceed to Phase 7.5 (Demo Preparation)

---

**Phase 7.4 Complete when all checklists are ✅ and zero critical issues remain!**
