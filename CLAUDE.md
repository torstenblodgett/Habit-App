# CLAUDE.md
## Project Overview
This project is an iOS mobile app built with Expo React Native and TypeScript.
The app is a modern, minimal, score-based self-improvement app. It is NOT a generic habit tracker. Its core concept is:
- every day starts at a score of 0
- user actions increase or decrease the score
- the user has a daily target score to reach
- habits contribute to long-term identity scores like Athlete, Reader, Scholar, etc.
- the app should feel fast, clean, premium, and psychologically motivating
The core user questions are:
1. How well did I live today?
2. Who am I becoming over time?
This app should prioritize:
- simplicity
- speed
- clean UI
- clear product thinking
- production-quality code structure
- maintainability
- consistency
- mobile-first usability
- iOS-first polish
This app should avoid:
- clutter
- feature bloat
- childish gamification
- overly corporate productivity vibes
- unnecessary dependencies
- weak validation
- messy architecture
- fake placeholder logic unless clearly marked
---
## Product Positioning
This app is best understood as a **daily life scorecard**.
It is not mainly about checking off habits.
It is about:
- building your day
- hitting a daily target
- improving your weekly average
- becoming the kind of person you want to be
The emotional tone should be:
- serious
- clean
- modern
- motivating
- identity-based
- slightly intense, but not cringe
Do not make the app feel:
- cute
- childish
- overly cheerful
- preachy
- cheesy
- like a generic productivity dashboard
Preferred tone examples:
- "Build your day"
- "Make today count"
- "Target reached"
- "Strong day"
- "2 points from Excellent"
Avoid wording like:
- "Great job, superstar!"
- "You are amazing!"
- "Let's crush it bestie!"
- "Your wellness journey begins here!"
---
## MVP Scope
Build only the MVP. Do not add extra features unless they are necessary for the MVP to function well.
The MVP includes these core features only:
1. Daily Score
2. Daily Target
3. Positive and negative habits
4. Identity scores
5. Weekly average
6. Stats screen
7. Habit management
8. End-of-day style verdicts
9. Shareable day card
10. Local persistence
Do NOT add:
- social features
- accounts
- cloud sync
- notifications unless explicitly requested later
- advanced analytics beyond what is described
- achievements
- badges
- leaderboards
- AI coaching
- chat
- journaling
- calendar integrations
- complicated onboarding flows
- subscription billing in the first pass
- backend services in the first pass
---
## Tech Stack Requirements
Use:
- Expo
- React Native
- TypeScript
- Expo Router if helpful, otherwise simple navigation is fine
- React Native compatible local persistence, preferably AsyncStorage or a lightweight local persistence approach
- clean component architecture
- reusable UI primitives where appropriate
Prefer:
- simple, reliable libraries
- minimal dependencies
- predictable state management
Avoid:
- overengineering
- unnecessary state libraries unless truly justified
- heavy animation libraries unless necessary
- obscure dependencies
If state is simple enough, use React state/hooks plus a clean local persistence layer.
If a small store helps, use a lightweight solution only if clearly beneficial.
---
## Visual Design Direction
The UI should feel:
- premium
- minimal
- modern
- calm
- focused
- Apple-friendly
Visual guidelines:
- light theme by default
- white or very light gray background
- black / dark gray text
- subtle card backgrounds
- one restrained accent color
- lots of whitespace
- bold, clear score typography
- simple icons only when useful
- rounded corners
- clean spacing
- no visual noise
Do NOT use:
- loud gradients everywhere
- flashy colors
- excessive shadows
- cluttered dashboards
- cartoonish graphics
- too many icons
- cramped spacing
The home screen should be understandable in under 3 seconds.
---
## Core Data Models
Please structure the data model clearly.
Suggested entities:
### Habit
- id: string
- name: string
- points: number
- type: "positive" | "negative"
- identityCategory: IdentityCategory
- frequency: "daily"
- isActive: boolean
- createdAt: string
- updatedAt: string
### IdentityCategory
Use a fixed set for MVP:
- athlete
- reader
- scholar
- mindful
- disciplined
- healthy
### DayLog
Represents one calendar day.
- date: string (YYYY-MM-DD)
- completedHabitIds: string[]
- triggeredNegativeHabitIds: string[]
- score: number
- target: number
- verdict: Verdict
Note:
For positive habits, completion means it happened.
For negative habits, "triggered" means the bad behavior occurred and should subtract points.
### Verdict
Possible verdicts:
- Collapse
- Weak
- Decent
- Strong
- Excellent
- Elite
### IdentityScoreSnapshot
Optional derived structure if helpful:
- category: IdentityCategory
- score: number
---
## Product Logic
### Daily Score
Each day starts at 0.
Positive habits:
- if completed, add their points
Negative habits:
- if triggered, subtract their points
- negative habit points should be stored as positive numbers in the model if that simplifies validation, but the scoring logic should apply them as deductions
- alternatively, negative values may be stored explicitly if implemented consistently
Make the implementation clean and consistent.
### Verdict Thresholds
Use the following default thresholds:
- score < 20 = Collapse
- 20 to 39 = Weak
- 40 to 59 = Decent
- 60 to 79 = Strong
- 80 to 99 = Excellent
- 100+ = Elite
Make these easy to adjust in a constants file.
### Daily Target
The app should show a daily target score.
For MVP:
- base target should be intelligently derived from recent performance
- simplest acceptable approach: target = max(40, rounded weekly average + 5)
- if insufficient history exists, use a sensible starter target such as 50
This should be implemented clearly in a utility function so it can be refined later.
### Weekly Average
Compute from recent daily scores over the last 7 calendar days.
Days with no activity should still be handled sensibly and consistently.
Make the logic explicit and easy to reason about.
### Identity Scores
Identity scores should represent consistency over the last 30 days.
Suggested formula:
- for a given identity category
- numerator = number of relevant positive habits completed in last 30 days
- denominator = number of relevant positive habit opportunities in last 30 days
- score = percentage from 0 to 100
For MVP:
- only positive habits need to directly build identity
- negative habits do not need to reduce identity unless there is a very clean and intuitive implementation
- identity should feel stable, not wildly jumpy
- if there are no opportunities yet for a category, handle gracefully
Put identity calculation in a dedicated utility module.
---
## Core Screens
Build these screens only:
### 1. Today Screen
This is the primary screen and should be the best designed.
Must include:
- today's score prominently displayed
- today's verdict
- today's target progress
- positive habits section, labeled something like "Build Your Day"
- negative habits section, labeled something like "Avoid"
- weekly average near the bottom or in a secondary section
- one-tap logging
- immediate score updates
Interaction requirements:
- tapping a positive habit toggles completion
- tapping a negative habit toggles whether it was triggered
- changes should feel instant
- score should update immediately
- keep UX friction extremely low
This screen should feel clean, focused, and addictive.
### 2. Identity Screen
Show identity categories and scores.
Use simple progress bars or percentage rows.
No complicated charts needed for first pass.
Example categories:
- Athlete
- Reader
- Scholar
- Mindful
- Disciplined
- Healthy
Add a short explanatory subtitle if helpful, but keep it minimal.
### 3. Stats Screen
Show:
- weekly average
- monthly average if easy to calculate
- best recent day
- current streak only if clean to implement
- count of Strong / Excellent / Elite days if clean
- recent scores
Keep it simple and readable.
### 4. Habits Screen
Allow user to:
- create habits
- edit habits
- archive/deactivate habits
- choose positive or negative type
- assign identity category
- assign point value
Validation matters:
- require non-empty names
- prevent invalid point values
- keep the creation flow simple
---
## Shareable Day Card
Include a basic shareable day card feature in the MVP if feasible within Expo.
Goal:
- generate a clean, minimal visual summary of the user's day
- suitable for screenshot or export
- design should be simple and attractive
Include:
- score
- verdict
- a few completed habits
- weekly average
- subtle branding with app name placeholder
If fully functional export is too heavy for the first pass, structure the UI so a share card screen/component exists and can be exported in the next pass.
Be honest in comments about what is complete vs scaffolded.
---
## Component and Code Quality Standards
Code should be production-minded.
Requirements:
- use TypeScript properly
- avoid giant files
- separate UI, utilities, constants, and types cleanly
- prefer small reusable components
- add comments where they improve clarity
- do not add useless comments
- handle empty states
- handle loading states where relevant
- avoid dead code
- avoid duplicate logic
- use clear naming
- keep functions focused
- keep logic testable where practical
Please actively review for:
- inconsistent naming
- weak validation
- missing empty states
- missing edge case handling
- bad mobile spacing
- unnecessary complexity
- rough UX details
Make useful improvements proactively.
---
## UX Principles
The app should optimize for:
- speed
- clarity
- emotional payoff
- low friction
- obvious interaction
The app should create these feelings:
- "I want to raise my score"
- "I am close to my target"
- "I want a stronger day"
- "I am becoming more consistent"
Useful microcopy examples:
- "Make today count"
- "Target reached"
- "7 points to Strong"
- "2 points from Excellent"
- "Weekly average: 64"
Avoid too much text.
---
## File / Project Organization
Please keep the project organized and predictable.
Suggested folders:
- app/
- components/
- constants/
- hooks/
- utils/
- types/
- storage/
This does not need to be followed exactly, but the structure should be clean and scalable.
---
## Implementation Priorities
When building, prioritize in this order:
1. Project structure
2. Data models and persistence
3. Scoring logic
4. Today screen
5. Habit management
6. Identity calculations and screen
7. Stats screen
8. Share card
Do not jump into polish before the core loop works.
---
## Behavior Expectations for Claude
Before making major implementation decisions:
- think through the product implications
- prefer the simpler solution
- avoid speculative complexity
- stay faithful to the core concept
When something is ambiguous:
- choose the cleanest MVP-friendly option
- do not invent unnecessary features
When finished with a major pass:
- summarize what was built
- note assumptions
- identify what still needs manual testing
- identify any shortcuts or scaffolding
Also:
- double-check your own work
- look for edge cases
- look for places where the app could feel confusing
- improve obvious weak points without bloating the scope
