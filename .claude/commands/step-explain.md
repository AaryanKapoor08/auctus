Read claude/Progress.md, claude/BuildFlow.md, claude/Claude_guide.md, and claude/ProjectSummary.md.

Determine the current step as follows:
- Find the current phase in Progress.md
- Find the first unchecked checkbox [ ] in that phase — that is the current step
- If the user passed a number argument (e.g. "/step-explain 3"), explain step 3 of the current phase instead
- If the user passed a name (e.g. "/step-explain env guard"), find the closest matching step

Produce a deep explanation of that single step structured exactly as follows:

---

## Step: [checkpoint item text] — Phase [N]

**What this step is in one sentence:** [what you are building and what it proves]

---

### Why This Step Is Here

Explain why this step sits in this exact position. What breaks if you do it out of order?

---

### The Core Concept

Name the underlying engineering concept. Explain:
- What is it?
- Why does it exist?
- What problem does it solve?
- Done well vs done poorly?

Use one concrete real-world analogy.

---

### Syntax Template

Show the canonical pattern. GENERIC ILLUSTRATION — not the implementation. Maximum 10 lines. Comments explain purpose.

---

### The Proof

Exactly what "done" looks like:
- What command to run
- What output to expect
- What behaviour to demonstrate
- What a broken implementation produces instead

---

### Questions To Ask Yourself Before Starting

3-4 questions to answer before writing this step.

---

### The Single Most Common Mistake

One mistake people make most on this step:
- What it looks like in code
- Why it seems reasonable
- What it breaks downstream
- One question to reveal it

---

### Habit Check

Which of the 13 habits are tested by this step? What does each look like in practice here?