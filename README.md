# 💪 Fitness Buddy — AI Health & Fitness Coach

An intelligent, full-stack virtual fitness assistant powered by **IBM Granite** AI. Chat with your personal AI coach for workout plans, nutrition tips, motivation, and recovery advice.

---

## 🌐 Live Demo

👉 **[https://fitness-buddy-zpcq.onrender.com](https://fitness-buddy-zpcq.onrender.com)**

---

## ✨ Features

- 🏋️ **Personalized workouts** – Home & gym routines for all fitness levels and goals
- 🥗 **Nutrition guidance** – Simple, balanced meal ideas and hydration tips
- ⚡ **Motivation & habit building** – Daily tips, encouragement, and progress support
- 🧘 **Recovery advice** – Stretching, sleep, and wellness guidance
- 💬 **Real-time AI chat** – Conversational, context-aware responses via IBM Granite

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript                 |
| Backend   | Python 3, Flask                                 |
| AI Model  | IBM Granite 4 (ibm/granite-4-h-small)         |
| Auth      | IBM IAM OAuth2 (API Key → Bearer Token)         |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- An [IBM Cloud](https://cloud.ibm.com) account with a WatsonX project and API key

### 1. Clone the repository
\\\ash
git clone https://github.com/Hema-Sph/Fitness-Buddy.git
cd Fitness-Buddy
\\\

### 2. Install dependencies
\\\ash
pip install -r requirements.txt
\\\

### 3. Configure environment variables
Copy the example file and fill in your credentials:
\\\ash
cp .env.example .env
\\\

Edit \.env\:
\\\env
IBM_API_KEY=your_ibm_api_key_here
IBM_PROJECT_ID=your_ibm_project_id_here
IBM_MODEL_ID=ibm/granite-4-h-small
IBM_API_URL=https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29
IBM_IAM_URL=https://iam.cloud.ibm.com/identity/token
PORT=3000
\\\

### 4. Run the app
\\\ash
python app.py
\\\

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> **Windows users:** You can also double-click Open Fitness Buddy.bat to launch the app automatically.

---

## 📁 Project Structure

\\\
Fitness-Buddy/
├── app.py                 # Flask backend + IBM Granite integration
├── launcher.py            # Optional launcher script
├── Open Fitness Buddy.bat # Windows quick-launch script
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variable template
└── public/
    ├── index.html         # Main chat UI
    ├── style.css          # Styles (dark theme, responsive)
    └── app.js             # Frontend logic & API calls
\\\

---

## 🔌 API Endpoints

| Method | Endpoint     | Description                          |
|--------|--------------|--------------------------------------|
| GET    | /          | Serves the chat UI                   |
| POST   | /api/chat  | Send a message, receive an AI reply  |
| GET    | /api/health| Health check                         |

### /api/chat — Request body
\\\json
{
  "messages": [
    { "role": "user", "content": "Give me a 20-minute home workout" }
  ]
}
\\\

---

## ⚠️ Safety Note

Fitness Buddy provides **general wellness guidance only**. Always consult a qualified healthcare or fitness professional before starting a new exercise program, especially if you have existing injuries or medical conditions.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
