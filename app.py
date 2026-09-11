import os
import time
import requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="public", static_url_path="")

# ── Config ─────────────────────────────────────────────────────────────────
IBM_API_KEY    = os.getenv("IBM_API_KEY", "4ItIatS7TkhaExLAzYfCcyxu_fQmk8H83cynzwuIdOGs")
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID", "942ca098-2478-4985-a928-02368453f9a4")
IBM_MODEL_ID   = os.getenv("IBM_MODEL_ID", "ibm/granite-4-h-small")
IBM_API_URL    = os.getenv("IBM_API_URL", "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29")
IBM_IAM_URL    = os.getenv("IBM_IAM_URL", "https://iam.cloud.ibm.com/identity/token")
PORT           = int(os.getenv("PORT", 3000))

# ── IAM Token Cache ─────────────────────────────────────────────────────────
_token_cache = {"token": None, "expiry": 0}

def get_ibm_token():
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expiry"]:
        return _token_cache["token"]

    resp = requests.post(
        IBM_IAM_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": IBM_API_KEY,
        },
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    _token_cache["token"]  = data["access_token"]
    _token_cache["expiry"] = now + data.get("expires_in", 3600) - 300  # 5-min buffer
    return _token_cache["token"]


# ── System Prompt ───────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Fitness Buddy, an accessible, friendly, and intelligent virtual fitness assistant. Your mission is to help users lead healthier, more active lives.

Your core capabilities:
1. **Workout Recommendations** – Suggest home workouts and exercise routines tailored to the user's fitness level, available equipment, goals (weight loss, muscle gain, flexibility, endurance), and time constraints.
2. **Motivational Support** – Provide daily fitness inspiration, encourage habit-building, celebrate small wins, and keep users consistent and positive.
3. **Nutrition Guidance** – Suggest simple, nutritious meal ideas, explain macronutrients in plain language, and offer hydration tips. Always remind users to consult a dietitian for personalized medical nutrition advice.
4. **Healthy Lifestyle Tips** – Share sleep, stress management, and recovery advice that supports overall wellness.

Personality & Tone:
- Warm, encouraging, and non-judgmental
- Use clear, simple language — avoid excessive jargon
- Always personalize advice based on what the user shares
- Be concise unless the user asks for detailed explanations
- Use bullet points and numbered lists for workouts and meal plans to improve readability

Safety Boundaries:
- Do NOT provide medical diagnoses or replace professional medical advice
- Always recommend consulting a doctor before starting a new exercise program if the user mentions injuries, chronic conditions, or is new to exercise
- Never recommend extreme calorie restriction or unsafe fitness practices

Start every new conversation with a warm welcome and ask what the user's fitness goal is today."""


# ── Routes ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("public", "index.html")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "agent": "Fitness Buddy", "model": IBM_MODEL_ID})


@app.route("/api/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True)
    if not body or "messages" not in body or not isinstance(body["messages"], list):
        return jsonify({"error": "Invalid request: messages array required."}), 400

    try:
        token = get_ibm_token()

        payload = {
            "model_id": IBM_MODEL_ID,
            "project_id": IBM_PROJECT_ID,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                *body["messages"],
            ],
            "parameters": {
                "max_new_tokens": 800,
                "temperature": 0.7,
                "top_p": 0.9,
                "repetition_penalty": 1.1,
            },
        }

        ibm_resp = requests.post(
            IBM_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json=payload,
            timeout=60,
        )

        if not ibm_resp.ok:
            return jsonify({
                "error": f"IBM API error: {ibm_resp.status_code}",
                "details": ibm_resp.text,
            }), ibm_resp.status_code

        data = ibm_resp.json()
        reply = (
            (data.get("choices") or [{}])[0].get("message", {}).get("content")
            or (data.get("results") or [{}])[0].get("generated_text")
            or "I'm having trouble responding right now. Please try again!"
        )

        return jsonify({"reply": reply})

    except requests.exceptions.RequestException as exc:
        print(f"[REQUEST ERROR] {exc}")
        return jsonify({"error": "Network error", "details": str(exc)}), 502
    except Exception as exc:
        import traceback
        print(f"[SERVER ERROR] {traceback.format_exc()}")
        return jsonify({"error": "Internal server error", "details": str(exc)}), 500


# ── Entry Point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n💪  Fitness Buddy is running at http://localhost:{PORT}")
    print(f"    Open your browser and go to: http://localhost:{PORT}\n")
    app.run(host="0.0.0.0", port=PORT, debug=True, use_reloader=False)
