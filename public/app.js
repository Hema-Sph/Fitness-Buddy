/* ─────────────────────────────────────────────────────────────────────────
   Fitness Buddy — Frontend Application Logic
   Connects to /api/chat (Express backend → IBM Granite AI)
───────────────────────────────────────────────────────────────────────── */

// ── State ──────────────────────────────────────────────────────────────────
const conversationHistory = [];

// ── DOM References ─────────────────────────────────────────────────────────
const messagesEl      = document.getElementById('messages');
const userInput       = document.getElementById('userInput');
const sendBtn         = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const menuBtn         = document.getElementById('menuBtn');
const closeSidebar    = document.getElementById('closeSidebar');
const sidebar         = document.getElementById('sidebar');
const overlay         = document.getElementById('overlay');
const newChatBtn      = document.getElementById('newChatBtn');
const clearBtn        = document.getElementById('clearBtn');
const quickBtns       = document.querySelectorAll('.quick-btn');

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderWelcomeCard();
  userInput.focus();
});

// ── Sidebar Toggle ─────────────────────────────────────────────────────────
menuBtn.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
});

function closeSidebarFn() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
}
closeSidebar.addEventListener('click', closeSidebarFn);
overlay.addEventListener('click', closeSidebarFn);

// ── New Chat / Clear ───────────────────────────────────────────────────────
newChatBtn.addEventListener('click', () => {
  resetChat();
  closeSidebarFn();
});

clearBtn.addEventListener('click', resetChat);

function resetChat() {
  conversationHistory.length = 0;
  messagesEl.innerHTML = '';
  renderWelcomeCard();
  userInput.value = '';
  autoResize();
}

// ── Quick Action Buttons ───────────────────────────────────────────────────
quickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    if (prompt) {
      userInput.value = prompt;
      autoResize();
      closeSidebarFn();
      sendMessage();
    }
  });
});

// ── Textarea Auto-Resize & Enable/Disable Send ────────────────────────────
userInput.addEventListener('input', () => {
  autoResize();
  sendBtn.disabled = userInput.value.trim() === '';
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
  sendBtn.disabled = userInput.value.trim() === '';
}

// ── Welcome Card ───────────────────────────────────────────────────────────
function renderWelcomeCard() {
  const card = document.createElement('div');
  card.className = 'welcome-card';
  card.innerHTML = `
    <span class="welcome-icon">💪</span>
    <h2>Hi! I'm Fitness Buddy</h2>
    <p>Your AI-powered health and fitness coach, available 24/7. I can help you build workouts, plan meals, stay motivated, and develop lasting healthy habits.</p>
    <div class="welcome-features">
      <div class="feature-chip"><strong>🏋️ Workouts</strong>Home &amp; gym routines for all levels</div>
      <div class="feature-chip"><strong>🥗 Nutrition</strong>Simple, balanced meal ideas</div>
      <div class="feature-chip"><strong>⚡ Motivation</strong>Daily tips &amp; habit building</div>
      <div class="feature-chip"><strong>🧘 Recovery</strong>Rest, stretching &amp; wellness</div>
    </div>
  `;
  messagesEl.appendChild(card);
  scrollToBottom();
}

// ── Send Message ───────────────────────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Clear input
  userInput.value = '';
  autoResize();
  sendBtn.disabled = true;

  // Remove welcome card on first message
  const welcome = messagesEl.querySelector('.welcome-card');
  if (welcome) welcome.remove();

  // Render user bubble
  appendMessage('user', text);

  // Push to history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing
  setTyping(true);

  try {
    let response;
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });
    } catch (fetchErr) {
      throw new Error(`Cannot reach server at localhost:3000. Is the server running? (${fetchErr.message})`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || `Server error ${response.status}`);
    }

    const reply = data.reply || "I'm not sure how to respond to that. Could you rephrase?";

    // Push assistant reply to history
    conversationHistory.push({ role: 'assistant', content: reply });

    setTyping(false);
    appendMessage('bot', reply);

  } catch (err) {
    setTyping(false);
    appendMessage('bot', `⚠️ **Something went wrong:** ${err.message}\n\nPlease check your connection and try again.`, true);
    console.error('Chat error:', err);
  }

  userInput.focus();
}

// ── Append Message Bubble ──────────────────────────────────────────────────
function appendMessage(role, text, isError = false) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'bot' ? '💪' : '🧑';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (isError) bubble.style.borderColor = '#ef4444';

  bubble.innerHTML = formatMessage(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

// ── Basic Markdown Formatter ───────────────────────────────────────────────
function formatMessage(text) {
  // Escape HTML first (except intentional tags we add below)
  let html = escapeHtml(text);

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // H3: ### Heading
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // HR: ---
  html = html.replace(/^---$/gm, '<hr>');

  // Numbered list items: 1. item
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Bullet list items: - item or * item
  html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`);

  // Line breaks
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[hul])/g, '$1');
  html = html.replace(/(<\/[hul][^>]*>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Typing Indicator ───────────────────────────────────────────────────────
function setTyping(visible) {
  typingIndicator.classList.toggle('visible', visible);
  if (visible) scrollToBottom();
}

// ── Scroll Helper ──────────────────────────────────────────────────────────
function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}
