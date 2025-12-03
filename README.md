# Norai Landing Page Specification

## Overview

This document provides complete specifications for building the **Norai landing page**. The landing page should be developer-focused, showcasing Norai as a **behavioral analysis and recommendation engine** that helps apps understand user behavior and deliver personalized experiences.

**Target Audience:** Developers, Product Managers, Technical Decision Makers

**Goal:** Make developers instantly understand what Norai does through clear value propositions, code snippets, and visual demonstrations.

---

## 1. Hero Section

### 1.1 Headline
**Primary Headline:**
```
Understand Your Users. Deliver Personalized Experiences.
```

**Subheadline:**
```
Norai is a behavioral analysis and recommendation engine that tracks user events, analyzes behavior patterns, and generates intelligent recommendations—all with a simple SDK integration.
```

### 1.2 Hero Code Snippet
**Purpose:** Show developers how easy it is to get started (3-5 lines max)

**Code Example (Swift/iOS - SDK):**
```swift
// Track user events with one line
Norai.shared.trackEvent(
    name: "product_tapped",
    properties: [
        "product_id": "prod_123",
        "category": "electronics"
    ]
)
```

**Code Example (API Request/Response):**
```bash
# Request
curl -X POST https://api.norai.com/ml/generate-recommendations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "external_user_id": "user_123",
    "limit": 10
  }'

# Response
{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "recommendations": [
    {
      "id": "1f0a5266-6ef9-47d7-bfad-9d5e07b136d9",
      "external_id": "prod_123",
      "score": 0.95,
      "reason": "Ranked by global engagement"
    }
  ],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}
```

**Note:** The SDK is for **tracking events only**. Recommendations are fetched **server-side** via API calls from your backend.

**SDK Availability:**
- ✅ **iOS (Swift)** - Available now
- 🚧 **Android (Kotlin/Java)** - Coming soon
- 🚧 **React Native** - Coming soon

### 1.3 Call-to-Action Buttons
- **Primary CTA:** "Get Started" (links to docs/signup)
- **Secondary CTA:** "View Documentation" (links to API docs)

### 1.4 Visual Elements
- **Suggestion:** Dashboard mockup showing:
  - Real-time event stream
  - User behavior analytics
  - Recommendation insights
  - Segmentation charts

---

## 2. What Norai Does (Value Proposition)

### 2.1 Core Value Statement
**Section Title:** "What is Norai?"

**Content:**
```
Norai is a complete behavioral analytics and recommendation platform that helps you:

1. **Track Everything** - Capture user events across your app with a simple SDK
2. **Understand Behavior** - Analyze user journeys, engagement patterns, and conversion funnels
3. **Deliver Personalization** - Generate intelligent recommendations and user segments
4. **Scale Automatically** - Built for high-traffic apps with async processing and caching
```

### 2.2 Visual Flow Diagram
**Show the complete flow:**

**Event Tracking Flow:**
```
[User Action in App] 
    ↓
[SDK Tracks Event] 
    ↓
[Go Backend Ingests] 
    ↓
[PostgreSQL Stores] 
    ↓
[ML Layer Analyzes]
```

**Recommendations Flow:**
```
[Your Backend Requests Recommendations] 
    ↓
[Norai API (ML Layer)] 
    ↓
[PostgreSQL Reads User Data] 
    ↓
[ML Models Generate Scores] 
    ↓
[Recommendations Returned to Your Backend] 
    ↓
[Your Backend Serves to Client App]
```

**Key Architecture Point:**
- **SDK** = Event tracking only (client-side)
- **API** = Recommendations fetching (server-side)

---

## 2.5 Architecture: SDK vs API (Critical Section)

**Title:** "How Norai Works: SDK for Tracking, API for Recommendations"

**Purpose:** Make it crystal clear that SDK and API serve different purposes.

**Content:**

### Client-Side: SDK (Event Tracking)
```
┌─────────────────┐
│  Your Client    │
│     App         │
│  (iOS -         │
│   Available)    │
│  (Android/RN -  │
│   Coming Soon)   │
└────────┬────────┘
         │
         │ Norai.shared.trackEvent()
         │
         ▼
┌─────────────────┐
│  Norai SDK      │
│  (Event         │
│   Tracking)     │
└────────┬────────┘
         │
         │ HTTP POST /v1/events
         │
         ▼
┌─────────────────┐
│  Norai Go       │
│  Backend        │
└─────────────────┘
```

**What SDK Does:**
- ✅ Tracks user events (`product_viewed`, `add_to_cart`, etc.)
- ✅ Identifies users (`identify()` method)
- ✅ Sends events to Norai backend
- ❌ **Does NOT fetch recommendations**

### Server-Side: API (Recommendations)
```
┌─────────────────┐
│  Your Backend   │
│  (Python/Node/  │
│   Go/Ruby)      │
└────────┬────────┘
         │
         │ POST /ml/generate-recommendations
         │ (with API key)
         │
         ▼
┌─────────────────┐
│  Norai ML API   │
│  (Python        │
│   FastAPI)      │
└────────┬────────┘
         │
         │ Reads from PostgreSQL
         │ Generates recommendations
         │
         ▼
┌─────────────────┐
│  Recommendations│
│  Returned to    │
│  Your Backend   │
└─────────────────┘
```

**What API Does:**
- ✅ Fetches personalized recommendations
- ✅ Generates user segments
- ✅ Batch processing
- ✅ Requires **API key** (keep secure on server)

### Complete Flow Example

**1. User views product (Client App):**
```swift
// iOS app tracks event
Norai.shared.trackEvent(
    name: "product_viewed",
    properties: [
        "entity": ["external_id": "prod_123"]
    ]
)
```

**2. User requests recommendations (Client App):**
```swift
// Client calls YOUR backend (not Norai directly)
let recommendations = try await yourBackendAPI.getRecommendations(userId: "user_123")
```

**3. Your backend fetches from Norai (Server):**
```javascript
// Your backend server
app.get('/api/recommendations/:user_id', async (req, res) => {
  // Call Norai API
  const response = await fetch('https://api.norai.com/ml/generate-recommendations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: 'your-project-id',
      external_user_id: req.params.user_id,
      limit: 10
    })
  });
  
  const data = await response.json();
  res.json(data);
});
```

**Why This Architecture?**
- ✅ **Security** - API keys never exposed to client
- ✅ **Performance** - Server-side caching and optimization
- ✅ **Flexibility** - Your backend controls when/how to fetch
- ✅ **Scalability** - Handle millions of requests efficiently

---

## 3. Features Section

### 3.1 Feature 1: Event Tracking
**Title:** "Track User Events Effortlessly"

**Description:**
```
Capture every user interaction with a simple SDK call. Track product views, clicks, purchases, and custom events—all automatically stored and analyzed.
```

**Code Snippet:**
```swift
// Track any event
Norai.shared.trackEvent(
    name: "add_to_cart",
    properties: [
        "entity": [
            "external_id": "prod_456",
            "category": "fashion",
            "price": 99.99
        ],
        "quantity": 2
    ]
)
```

**Key Points:**
- ✅ Simple SDK integration
- ✅ Automatic event storage
- ✅ Rich metadata support
- ✅ iOS SDK available now
- 🚧 Android & React Native coming soon

---

### 3.2 Feature 2: User Identification
**Title:** "Link Anonymous Users to Identities"

**Description:**
```
Seamlessly connect anonymous device IDs to user accounts. Norai automatically handles multi-device users and maintains a unified user profile.
```

**Code Snippet:**
```swift
// Identify a user
Norai.shared.identify(
    userId: "user_123",
    traits: [
        "email": "user@example.com",
        "name": "John Doe",
        "age": 25,
        "preferences": ["electronics", "gaming"]
    ]
)
```

**Key Points:**
- ✅ Multi-device support
- ✅ Anonymous → Identified user mapping
- ✅ Rich user traits
- ✅ Automatic profile merging

---

### 3.3 Feature 3: Intelligent Recommendations
**Title:** "Get Personalized Recommendations"

**Description:**
```
Generate intelligent product or content recommendations for each user based on their behavior, interactions, and preferences. Powered by ML models that learn from your data.

**Important:** Recommendations are fetched **server-side** via API. Your backend calls the Norai API and serves recommendations to your client app.
```

**Code Snippet (API Request/Response):**
```bash
# Direct API call
curl -X POST https://api.norai.com/ml/generate-recommendations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "external_user_id": "user_123",
    "limit": 10
  }'
```

**Response Example:**
```json
{
  "project_id": "ff86a66e-9333-4188-8e7d-f610ec0a5f57",
  "external_user_id": "user_123",
  "recommendations": [
    {
      "id": "1f0a5266-6ef9-47d7-bfad-9d5e07b136d9",
      "external_id": "prod_123",
      "score": 0.95,
      "reason": "Users with similar behavior also viewed this"
    },
    {
      "id": "5c47c704-9cfa-4457-bb63-55bd11b608c6",
      "external_id": "prod_456",
      "score": 0.87,
      "reason": "Frequently viewed together"
    }
  ],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}
```

**Key Points:**
- ✅ **Server-side API** - Fetch recommendations from your backend
- ✅ ML-powered scoring
- ✅ Real-time generation
- ✅ Cached for performance (< 100ms response time)
- ✅ Batch processing support
- ✅ Secure - API keys never exposed to client

---

### 3.4 Feature 4: User Segmentation
**Title:** "Segment Users Automatically"

**Description:**
```
Automatically segment users based on behavior patterns, engagement levels, and traits. Use segments for targeted campaigns, A/B testing, and personalized experiences.
```

**Code Snippet (API):**
```bash
# Generate user segments
curl -X POST https://api.norai.com/ml/segment-users \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "algorithm": "kmeans",
    "num_segments": 5
  }'
```

**Response Example:**
```json
{
  "job_id": "abc123-def456-ghi789",
  "status": "queued",
  "message": "Segmentation job queued. Check status at /ml/jobs/abc123-def456-ghi789"
}
```

**Key Points:**
- ✅ Behavioral clustering
- ✅ Automatic segment assignment
- ✅ Batch processing
- ✅ Configurable algorithms

---

### 3.5 Feature 5: Analytics Dashboard
**Title:** "Real-Time Analytics & Insights"

**Description:**
```
View comprehensive analytics dashboards showing user behavior, event trends, conversion funnels, and engagement metrics—all in real-time.
```

**Visual Elements:**
- Dashboard mockup showing:
  - Time-series charts (DAU, WAU, MAU)
  - Event type distribution
  - Funnel conversion rates
  - Top entities/interactions
  - User journey visualization

**Key Points:**
- ✅ Real-time metrics
- ✅ Custom date ranges
- ✅ Funnel analysis
- ✅ Export capabilities

---

### 3.6 Feature 6: Scalable Infrastructure
**Title:** "Built for Scale"

**Description:**
```
Norai is built to handle millions of events and users. With async processing, intelligent caching, and horizontal scaling, your app grows without worrying about infrastructure.
```

**Technical Highlights:**
- ✅ **Async Processing** - Background jobs for heavy workloads
- ✅ **Redis Caching** - Sub-millisecond recommendation retrieval
- ✅ **Connection Pooling** - Optimized database access
- ✅ **Horizontal Scaling** - Add workers as you grow
- ✅ **Event Streaming** - Real-time event processing (NATS)

**Architecture Diagram:**
```
[Client App] → [SDK] → [Go Backend] → [PostgreSQL]
                                      ↓
                              [Python ML Layer]
                                      ↓
                          [Redis Cache] + [Celery Workers]

[Your Backend] → [Norai API] → [Python ML Layer] → [Recommendations]
                                      ↓
                              [Your Backend] → [Client App]
```

**Key Points:**
- **Client SDK** = Event tracking only
- **Your Backend** = Fetches recommendations via API
- **Norai API** = ML-powered recommendation generation

---

## 4. How It Works (Step-by-Step)

### 4.1 Integration Flow
**Title:** "Get Started in 3 Steps"

**Step 1: Install SDK (Client-Side - iOS Only)**
```swift
// Add to your iOS project
.package(url: "https://github.com/norai/norai-swift-sdk", from: "1.0.0")
```

**Note:** Currently only iOS SDK is available. Android and React Native SDKs are coming soon. For other platforms, you can still use the server-side API directly.

**Step 2: Initialize SDK (iOS)**
```swift
// Configure Norai SDK in your iOS app
Norai.shared.configure(
    apiKey: "nk_your_api_key_here",
    projectId: "your-project-id"
)
```

**For Android/React Native (Coming Soon):**
- Similar initialization pattern
- Check documentation when available

**Step 3: Track Events (iOS)**
```swift
// Client: Track events with iOS SDK
Norai.shared.trackEvent(
    name: "app_opened",
    properties: [:]
)

// Client: Request recommendations from YOUR backend
// (Your backend calls Norai API - see Step 4)
let recommendations = try await yourBackendAPI.getRecommendations(userId: "user_123")
```

**Step 4: Backend Integration (API Request/Response)**
```bash
# Request
POST https://api.norai.com/ml/generate-recommendations
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "limit": 10
}

# Response
{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "recommendations": [...],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}
```

### 4.2 Architecture Overview
**Title:** "SDK vs API - What's the Difference?"

**SDK (Client-Side):**
- ✅ Tracks user events
- ✅ Identifies users
- ✅ Sends data to Norai backend
- ❌ Does NOT fetch recommendations

**API (Server-Side):**
- ✅ Fetches recommendations
- ✅ Generates user segments
- ✅ Batch processing
- ✅ Requires API key (keep secure on server)

---

## 5. Use Cases

### 5.1 E-Commerce
**Title:** "E-Commerce Personalization"

**Description:**
```
Recommend products based on browsing history, cart additions, and purchase patterns. Increase conversion rates with intelligent product suggestions.
```

**Example Flow:**

**1. Client App (iOS) - Track Event:**
```swift
// Track product view with iOS SDK (available now)
Norai.shared.trackEvent(
    name: "product_viewed",
    properties: [
        "entity": [
            "external_id": "prod_789",
            "category": "electronics",
            "price": 299.99
        ]
    ]
)
```

**Note:** Android and React Native SDKs coming soon. Until then, you can track events via direct API calls from your backend.

**2. Your Backend Calls Norai API:**
```bash
# Request
POST https://api.norai.com/ml/generate-recommendations
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "limit": 5
}

# Response
{
  "project_id": "your-project-id",
  "external_user_id": "user_123",
  "recommendations": [
    {
      "id": "1f0a5266-6ef9-47d7-bfad-9d5e07b136d9",
      "external_id": "prod_789",
      "score": 0.95,
      "reason": "Ranked by global engagement"
    }
  ],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}
```

**3. Client App - Display Recommendations:**
```swift
// Client calls your backend
let recommendations = try await fetchRecommendations(userId: "user_123")
// Display recommendations in UI
```

---

### 5.2 Content Platforms
**Title:** "Content Recommendations"

**Description:**
```
Suggest articles, videos, or content based on user engagement, reading time, and interaction patterns.
```

---

### 5.3 Mobile Apps
**Title:** "Mobile App Analytics"

**Description:**
```
Track user journeys, screen views, and feature usage. Understand drop-off points and optimize user flows.
```

---

## 6. API Endpoints Showcase

### 6.1 Recommendations API
**Title:** "Recommendations API"

**Endpoint:** `POST /ml/generate-recommendations`

**Request:**
```json
{
  "project_id": "ff86a66e-9333-4188-8e7d-f610ec0a5f57",
  "external_user_id": "user_123",
  "limit": 10
}
```

**Response:**
```json
{
  "project_id": "ff86a66e-9333-4188-8e7d-f610ec0a5f57",
  "external_user_id": "user_123",
  "recommendations": [
    {
      "id": "1f0a5266-6ef9-47d7-bfad-9d5e07b136d9",
      "external_id": "prod_123",
      "score": 0.95,
      "reason": "Ranked by global engagement (popularity)"
    }
  ],
  "generated_at": "2025-12-01T08:11:26.113470Z"
}
```

---

### 6.2 Batch Processing API
**Title:** "Batch Processing API"

**Endpoint:** `POST /ml/batch-recommendations`

**Request:**
```json
{
  "project_id": "ff86a66e-9333-4188-8e7d-f610ec0a5f57",
  "user_ids": ["user_1", "user_2"],
  "limit": 10
}
```

**Response:**
```json
{
  "job_id": "abc123-def456-ghi789",
  "status": "queued",
  "message": "Batch recommendation job queued"
}
```

**Check Status:**
```bash
GET /ml/jobs/abc123-def456-ghi789
```

---

## 7. Technical Specifications

### 7.1 SDK Support (Event Tracking)

**Currently Available:**
- ✅ **iOS (Swift)** - Track events from iOS apps - **Available now**

**Coming Soon:**
- 🚧 **Android (Kotlin/Java)** - Track events from Android apps
- 🚧 **React Native** - Track events from React Native apps

**Note:** SDKs are for **event tracking only**. Recommendations are fetched via **server-side API** from any backend language (Python, Node.js, Go, Ruby, etc.).

**For Non-iOS Platforms (Until SDKs Available):**
- You can still track events by calling the Norai API directly from your backend
- Use `POST /v1/events` endpoint to send events
- Android and React Native SDKs coming soon for easier client-side integration

**Server-Side API Support:**
- ✅ Works with **any backend language** (Python, Node.js, Go, Ruby, Java, PHP, etc.)
- ✅ RESTful API with standard HTTP requests
- ✅ No SDK required for server-side recommendations or event tracking

### 7.2 Backend Architecture
- **Go Backend** - Event ingestion, analytics, dashboard APIs
- **Python ML Layer** - Recommendations, segmentation, ML models
- **PostgreSQL** - Primary data store
- **Redis** - Caching layer
- **Celery** - Background job processing
- **NATS** - Event streaming (optional)

### 7.3 Performance
- **Event Ingestion:** < 10ms latency
- **Recommendation Generation:** < 100ms (cached), < 2s (on-demand)
- **Batch Processing:** Async, scalable workers
- **Throughput:** Millions of events per day

---

## 8. Design Guidelines

### 8.1 Color Scheme
**Suggestions:**
- **Primary:** Modern blue/purple gradient (tech-forward)
- **Accent:** Green for success states, orange for CTAs
- **Background:** Light gray/white for code snippets
- **Text:** Dark gray/black for readability

### 8.2 Typography
- **Headings:** Bold, modern sans-serif (e.g., Inter, Poppins)
- **Code:** Monospace font (e.g., Fira Code, JetBrains Mono)
- **Body:** Clean, readable sans-serif

### 8.3 Code Snippet Styling
- **Syntax highlighting:** Use proper language tags
- **Copy button:** Add "Copy" button to each snippet
- **Line numbers:** Optional, for longer snippets
- **Dark theme:** Consider dark code blocks for contrast

### 8.4 Layout
- **Hero:** Full-width, centered content
- **Features:** 2-3 column grid on desktop, stacked on mobile
- **Code snippets:** Full-width or side-by-side with descriptions
- **Whitespace:** Generous spacing between sections

---

## 9. Call-to-Action Sections

### 9.1 Primary CTA (Multiple Locations)
- **Hero section:** "Get Started" / "Start Free Trial"
- **After features:** "Try Norai Now"
- **After use cases:** "See It In Action"
- **Footer:** "Get Started" + "Documentation"

### 9.2 Secondary CTAs
- "View Documentation"
- "See API Reference"
- "Contact Sales" (for enterprise)
- "GitHub" (if open-source components)

---

## 10. Footer

### 10.1 Links
- **Product:** Features, Pricing, Use Cases
- **Developers:** Documentation, API Reference, SDKs, GitHub
- **Company:** About, Blog, Careers
- **Support:** Help Center, Contact, Status Page

### 10.2 Social Proof
- Customer logos (if available)
- Testimonials (if available)
- GitHub stars (if applicable)

---

## 11. Additional Sections (Optional)

### 11.1 Pricing
- Free tier (if available)
- Usage-based pricing
- Enterprise plans

### 11.2 Security & Compliance
- Data encryption
- GDPR compliance
- SOC 2 (if applicable)

### 11.3 Customer Testimonials
- Quotes from developers
- Use case success stories

---

## 12. Implementation Notes

### 12.1 Must-Have Elements
1. ✅ **Hero section** with headline, subheadline, code snippet, CTAs
2. ✅ **Features section** (6 features minimum)
3. ✅ **Code snippets** throughout (SDK + API examples)
4. ✅ **How It Works** section (3-step integration)
5. ✅ **Use Cases** section
6. ✅ **API Endpoints** showcase
7. ✅ **Footer** with links

### 12.2 Developer-Focused Content
- **Code-first approach:** Show code before explanations
- **Real examples:** Use actual API endpoints and SDK methods
- **Copy buttons:** Make it easy to copy code
- **Interactive elements:** Consider live API playground (optional)

### 12.3 Mobile Responsiveness
- **Responsive design:** Must work on mobile, tablet, desktop
- **Code snippets:** Scrollable on mobile, or use tabs
- **Navigation:** Hamburger menu on mobile

---

## 13. Content Tone & Style

### 13.1 Writing Style
- **Clear and concise:** No jargon without explanation
- **Developer-friendly:** Technical but accessible
- **Action-oriented:** Focus on what developers can do
- **Benefit-driven:** Show value, not just features

### 13.2 Code Examples
- **Real-world scenarios:** Use practical examples
- **Primary language:** Swift (iOS SDK - available now)
- **API examples:** Show request/response format (curl or HTTP format)
- **Coming soon:** Android and React Native examples (mark as "Coming Soon")
- **Keep it simple:** Just show the API contract (request/response), not full implementation
- **Commented code:** Add comments for clarity

---

## 14. Success Metrics

### 14.1 What Success Looks Like
- Developers understand what Norai does in < 30 seconds
- Code snippets are immediately recognizable as useful
- Clear path to "Get Started"
- Low bounce rate, high engagement

---

## 15. Assets Needed

### 15.1 Visual Assets
- Dashboard mockup/screenshot
- Architecture diagram
- Flow diagrams
- Logo and brand assets
- Icon set for features

### 15.2 Code Assets
- Syntax-highlighted code snippets
- API response examples
- SDK integration examples

---

## 16. Final Checklist

Before launching, ensure:
- [ ] All code snippets are accurate and tested
- [ ] API endpoints match current implementation
- [ ] SDK examples use correct syntax
- [ ] All CTAs link to correct destinations
- [ ] Mobile responsive design tested
- [ ] Code copy buttons work
- [ ] Performance optimized (fast load times)
- [ ] SEO optimized (meta tags, descriptions)
- [ ] Analytics tracking in place

---

## Summary

This landing page should make it **instantly clear** to developers that:
1. **Norai tracks user events** with a simple SDK (client-side)
2. **Norai analyzes behavior** and generates insights
3. **Norai provides recommendations** via ML-powered APIs (server-side)
4. **Norai scales** with their app

**Critical Architecture Point to Emphasize:**
- **SDK** = Event tracking (client-side, simple integration)
- **API** = Recommendations (server-side, secure, fast)

The page should be **code-heavy** (show, don't just tell) and **developer-focused** (technical but accessible). Always show:
- SDK usage (for tracking) - iOS Swift examples
- API request/response format (for recommendations) - Simple HTTP/curl format, not full server implementations

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-01  
**For:** Landing Page Development Agent

