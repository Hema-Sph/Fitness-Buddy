# 💪 Fitness Buddy — AI Health & Fitness Coach

An intelligent, full-stack virtual fitness assistant powered by **IBM Granite** AI.

---

## Features
- 🏋️ **Personalized workouts** – home & gym routines for all fitness levels
- 🥗 **Nutrition guidance** – simple, balanced meal ideas
- ⚡ **Motivation & habit building** – daily tips & encouragement
- 🧘 **Recovery advice** – stretching, sleep, and wellness
- 💬 **Real-time AI chat** – conversational, context-aware responses

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| AI Model | IBM Granite 4 (`ibm/granite-4-h-small`) |
| Auth | IBM IAM OAuth2 (API Key → Bearer Token) |

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```
IBM_API_KEY=your_ibm_api_key_here
IBM_PROJECT_ID=942ca098-2478-4985-a928-02368453f9a4
IBM_MODEL_ID=ibm/granite-4-h-small
IBM_API_URL=https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29
IBM_IAM_URL=https://iam.cloud.ibm.com/identity/token
PORT=3000
```

### 3. Run
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development (auto-reload)
```bash
npm run dev
```

## Project Structure
```
fitness-buddy/
├── server.js          # Express backend + IBM Granite integration
├── package.json
├── .env.example       # Environment variable template
└── public/
    ├── index.html     # Main chat UI
    ├── style.css      # Styles (dark theme, responsive)
    └── app.js         # Frontend logic & API calls
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a message and get an AI reply |
| GET | `/api/health` | Health check |

## Safety Note
Fitness Buddy provides **general wellness guidance only**. Always consult a qualified healthcare or fitness professional for medical advice.
