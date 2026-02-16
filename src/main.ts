import { inject } from '@vercel/analytics';
import './style.css';

// Initialize Vercel Analytics
inject();


// ============================================
// perpleX — Text Humanizer
// ============================================

// --- Constants ---

// OpenRouter API Key — loaded from .env
// OpenRouter API Key — managed by backend
// const OPENROUTER_API_KEY = ... (removed for security)

// HUMANIZER_PROMPT moved to backend for security and logic concealment

// --- State ---
interface AppState {
  inputText: string;
  outputText: string;
  isProcessing: boolean;
  tone: string;
  isCompareMode: boolean;
}

const state: AppState = {
  inputText: '',
  outputText: '',
  isProcessing: false,
  tone: 'academic',
  isCompareMode: false,
};

// --- Render ---

function render(): void {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <!-- Header -->
    <header class="site-header" role="banner">
      <div class="container header-inner">
        <a href="/" class="logo" aria-label="perpleX home">
          <span class="logo-text">perple</span><span class="logo-x">X</span>
        </a>
        <nav aria-label="Main navigation">
          <ul class="nav-links">
            <li><a href="#tool">Tool</a></li>
            <li><a href="#why">Why perpleX</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>

      </div>
    </header>

    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">

        <h1 id="hero-title">Make AI text sound <span class="em">genuinely human</span></h1>
        <p class="hero-sub">Paste your AI-generated content, hit humanize, and get text that reads like a real person wrote it. Free, instant, private.</p>
      </div>
    </section>

    <!-- Tool -->
    <section class="tool-section" id="tool" aria-label="Text humanizer tool">
      <div class="container">
        <div class="editor-wrapper">
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <button class="toolbar-tab active">Humanize</button>
            </div>
            <span class="word-count" id="wordCount">${getWordCount()} words</span>
          </div>

          <div class="editor-grid">
            <!-- Input Panel -->
            <div class="editor-panel">
              <div class="panel-header">
                <span class="panel-label">Input</span>
                <div class="panel-actions">
                  <button class="icon-btn" id="clearBtn" title="Clear input" aria-label="Clear input text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <textarea
                class="editor-textarea"
                id="inputArea"
                placeholder="Paste your AI-generated text here..."
                aria-label="Input text to humanize"
                spellcheck="false"
              >${state.inputText}</textarea>
            </div>

            <!-- Output Panel -->
            <div class="editor-panel">
              <div class="panel-header">
                <span class="panel-label">Output</span>
                <div class="panel-actions">
                  ${state.outputText ? `
                  <div class="view-toggle">
                    <button class="toggle-btn ${!state.isCompareMode ? 'active' : ''}" id="viewResultBtn">Result</button>
                    <button class="toggle-btn ${state.isCompareMode ? 'active' : ''}" id="viewCompareBtn">Compare</button>
                  </div>
                  ` : ''}
                  <button class="icon-btn" id="copyBtn" title="Copy to clipboard" aria-label="Copy output text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
              <div class="output-area" id="outputArea" role="region" aria-label="Humanized output text" aria-live="polite">${state.isProcessing
      ? `<div class="output-loading">
            <div class="typing-loader">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
            <span>Generating human-like rhythms...<span class="cursor-loader"></span></span>
         </div>`
      : state.outputText
        ? (state.isCompareMode ? renderDiff(state.inputText, state.outputText) : state.outputText)
        : `<span class="output-placeholder">Your humanized text will appear here</span>`
    }</div>
            </div>
          </div>

          <div class="editor-actions">
            <div class="action-left">
              <select class="tone-select" id="toneSelect" aria-label="Select tone">
                <option value="academic" ${state.tone === 'academic' ? 'selected' : ''}>Academic</option>
                <option value="professional" ${state.tone === 'professional' ? 'selected' : ''}>Professional</option>
                <option value="balanced" ${state.tone === 'balanced' ? 'selected' : ''}>Balanced</option>
                <option value="casual" ${state.tone === 'casual' ? 'selected' : ''}>Casual</option>
              </select>
            </div>
            <button class="humanize-btn" id="humanizeBtn" ${state.isProcessing || !state.inputText.trim() ? 'disabled' : ''}>
              ${state.isProcessing ? 'Humanizing...' : 'Humanize Text'}
              ${!state.isProcessing ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>` : ''}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Why perpleX — Editorial layout, NOT tiles -->
    <section class="why-section" id="why" aria-labelledby="why-title">
      <div class="container">
        <div class="section-header">
          <h2 id="why-title">Why perpleX</h2>
        </div>

        <div class="why-items">
          <div class="why-item">
            <div class="why-number">01</div>
            <div class="why-content">
              <h3>Pattern destruction, not synonym swapping</h3>
              <p>Most "humanizers" just replace words with synonyms. That's not how AI detection works. Detectors look at sentence rhythm, paragraph structure, transition patterns, and vocabulary distribution. perpleX rewrites at every one of those levels — it doesn't just change words, it changes how the text <em>thinks</em>.</p>
            </div>
          </div>

          <div class="why-item why-item--right">
            <div class="why-number">02</div>
            <div class="why-content">
              <h3>Your browser, our API, nothing in between</h3>
              <p> Your text is processed directly through the underlying language model API. We do not store conversations or build user profiles. On top of the model output, we apply humanization layers that refine tone, structure, and clarity so the response feels more natural, contextual, and readable to a human user.</p>
            </div>
          </div>

          <div class="why-item">
            <div class="why-number">03</div>
            <div class="why-content">
              <h3>Four tones, because context matters</h3>
              <p>A blog post shouldn't read like an academic paper. A professional email shouldn't sound like a text message. Pick balanced, casual, professional, or academic — the output adapts its register, vocabulary, and structure to match what you actually need.</p>
            </div>
          </div>

          <div class="why-item why-item--right">
            <div class="why-number">04</div>
            <div class="why-content">
              <h3>No accounts, no credits, no catch</h3>
              <p>Open the page. Paste text. Click humanize. That's the entire user experience. No sign-up form hiding behind the button, no "3 free uses then pay $19/mo", no email harvesting. It's a tool, not a funnel.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section" id="how-it-works" aria-labelledby="how-title">
      <div class="container">
        <div class="section-header">
          <h2 id="how-title">Two steps. That's it.</h2>
          <p>No sign-up forms, no onboarding, no nonsense.</p>
        </div>
        <div class="steps-row">
          <div class="step">
            <div class="step-number">01</div>
            <h3>Paste your text</h3>
            <p>Drop in any AI-generated text — ChatGPT, Claude, Gemini, whatever. Pick your preferred tone from the dropdown.</p>
          </div>
          <div class="step">
            <div class="step-number">02</div>
            <h3>Hit humanize</h3>
            <p>Your rewritten text appears in seconds. Copy it, use it, pass it through any AI detector with confidence.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq-section" id="faq" aria-labelledby="faq-title">
      <div class="container">
        <div class="section-header">
          <h2 id="faq-title">Frequently asked</h2>
        </div>
        <div class="faq-list" itemscope itemtype="https://schema.org/FAQPage">
          ${renderFAQ([
      {
        q: 'What is a text humanizer?',
        a: 'A text humanizer rewrites AI-generated content so it sounds like a real person wrote it. It changes sentence structure, vocabulary, rhythm, and transitions to eliminate the patterns that AI detectors look for.'
      },
      {
        q: 'Is perpleX free to use?',
        a: 'Yes, completely free. No subscriptions, no credit systems, no hidden costs. Just open and use it.'
      },
      {
        q: 'Do I need to create an account?',
        a: 'No. perpleX is a utility tool — no sign-ups, no accounts, no email collection. Open the page and start humanizing.'
      },
      {
        q: 'Is my text stored anywhere?',
        a: 'No. Your text is sent directly from your browser to the API. We have no backend, no database, and no logging. Your content stays yours.'
      },
      {
        q: 'Will the output pass AI detectors?',
        a: 'Our prompt is engineered to systematically remove AI writing patterns at every level — vocabulary, sentence structure, paragraph rhythm, and transitions. While no tool guarantees 100% bypass, perpleX consistently produces text that reads naturally human.'
      },

    ])}
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-inner">
        <span class="footer-text">© ${new Date().getFullYear()} perpleX. Free text humanizer tool.</span>
        <ul class="footer-links">
          <li><a href="#tool">Tool</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </div>
    </footer>

    <!-- Toast -->
    <div class="toast" id="toast" role="alert"></div>
  `;

  attachListeners();
}

function renderFAQ(items: { q: string; a: string }[]): string {
  return items.map((item, i) => `
    <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}" id="faq-btn-${i}" itemprop="name">
        ${item.q}
        <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-answer" id="faq-answer-${i}" role="region" aria-labelledby="faq-btn-${i}" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <div class="faq-answer-inner" itemprop="text">${item.a}</div>
      </div>
    </div>
  `).join('');
}

function getWordCount(): number {
  const text = state.inputText.trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

// --- Diff Utility ---

function renderDiff(oldText: string, newText: string): string {
  const oldWords = oldText.trim().split(/\s+/);

  // Very simple word-level diff visualization
  // Since we shouldn't add heavy diff libraries, we'll use a basic heuristic:
  // Show new words that aren't in old words as added.
  // This is a "relative" diff for visualization purposes.

  const oldSet = new Set(oldWords.map(w => w.toLowerCase()));

  return newText.split(/(\s+)/).map(part => {
    if (/\s+/.test(part)) return part;
    const cleanWord = part.replace(/[.,!?;:]/g, '').toLowerCase();
    if (!oldSet.has(cleanWord)) {
      return `<span class="diff-added">${part}</span>`;
    }
    return part;
  }).join('');
}

// --- Toast ---

let toastTimer: ReturnType<typeof setTimeout>;

function showToast(message: string, type: 'success' | 'error' | '' = ''): void {
  const toast = document.getElementById('toast')!;
  toast.textContent = message;
  toast.className = `toast visible ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

// --- API ---

async function humanizeText(): Promise<void> {
  if (!state.inputText.trim()) {
    showToast('Paste some text first', 'error');
    return;
  }

  state.isProcessing = true;
  state.outputText = '';
  render();


  try {
    const response = await fetch('/api/humanize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: state.inputText,
        tone: state.tone,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `API error (${response.status})`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('No text in API response. The content may have been filtered.');
    }

    state.outputText = text;
    showToast('Text humanized successfully', 'success');
  } catch (err: any) {
    showToast(err.message || 'Something went wrong', 'error');
    state.outputText = '';
  } finally {
    state.isProcessing = false;
    render();
  }
}

// --- Event Listeners ---

function attachListeners(): void {
  // Input textarea
  const inputArea = document.getElementById('inputArea') as HTMLTextAreaElement;
  inputArea?.addEventListener('input', () => {
    state.inputText = inputArea.value;
    const wordCount = document.getElementById('wordCount');
    if (wordCount) wordCount.textContent = `${getWordCount()} words`;

    // Enable/disable button
    const btn = document.getElementById('humanizeBtn') as HTMLButtonElement;
    if (btn) btn.disabled = !state.inputText.trim() || state.isProcessing;
  });

  // Tone select
  document.getElementById('toneSelect')?.addEventListener('change', (e) => {
    state.tone = (e.target as HTMLSelectElement).value;
  });

  // Humanize button
  document.getElementById('humanizeBtn')?.addEventListener('click', humanizeText);

  // Clear button
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    state.inputText = '';
    state.outputText = '';
    state.isCompareMode = false;
    render();
  });

  // Toggle buttons
  document.getElementById('viewResultBtn')?.addEventListener('click', () => {
    state.isCompareMode = false;
    render();
  });
  document.getElementById('viewCompareBtn')?.addEventListener('click', () => {
    state.isCompareMode = true;
    render();
  });

  // Copy button
  document.getElementById('copyBtn')?.addEventListener('click', async () => {
    if (!state.outputText) {
      showToast('Nothing to copy yet', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(state.outputText);
      showToast('Copied to clipboard', 'success');
      const btn = document.getElementById('copyBtn')!;
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    } catch {
      showToast('Failed to copy', 'error');
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')!;
      const answer = item.querySelector('.faq-answer') as HTMLElement;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        const a = openItem.querySelector('.faq-answer') as HTMLElement;
        a.style.maxHeight = '0';
        openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector((link as HTMLAnchorElement).getAttribute('href')!);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter to humanize
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!state.isProcessing && state.inputText.trim()) {
        humanizeText();
      }
    }
  });
}

// --- Init ---
render();
