import './style.css';

// ============================================
// perpleX — Text Humanizer
// ============================================

// --- Constants ---

// OpenRouter API Key — loaded from .env
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const HUMANIZER_PROMPT = `You are an expert human writer and editor. Your sole purpose is to rewrite AI-generated or robotic-sounding text so it reads as if a real human wrote it from scratch. You must follow every rule below with zero exceptions:

CORE REWRITING RULES:
1. NEVER start sentences with "In today's world", "In the realm of", "It's important to note", "It's worth mentioning", "In conclusion", "Furthermore", "Moreover", "Additionally", "Consequently", "Delve into", "Navigating the", "Embark on", or any other formulaic AI opener.
2. VARY sentence length dramatically. Mix very short punchy sentences (3–7 words) with medium ones. Occasionally use a longer one. Never write three sentences of similar length in a row.
3. Use FIRST PERSON occasionally where it fits naturally ("I think", "in my experience", "honestly"). This isn't an essay — it's someone talking on paper.
4. Use CONTRACTIONS always (don't, can't, it's, they're, won't, shouldn't). Nobody writes "do not" or "cannot" in casual or semi-formal writing.
5. Add COLLOQUIAL TRANSITIONS: "Look,", "Here's the thing —", "So basically,", "The way I see it,", "Funny enough,", "That said,", "Now,", "Okay so", "Real talk —".
6. BREAK grammatical "perfection" slightly. Start a sentence with "And" or "But" occasionally. dont use em dashes.  Use sentence fragments where they add punch. "Simple as that."
7. ELIMINATE the following AI-signature words entirely: utilize, facilitate, harness, leverage, cutting-edge, groundbreaking, revolutionary, comprehensive, streamline, synergy, paradigm, robust, seamless, pivotal, multifaceted, nuanced, landscape, ecosystem, foster, empower, delve, underscore, realm, plethora, myriad, testament.
8. Replace formal vocabulary with natural alternatives: "purchase" → "buy", "commence" → "start", "endeavor" → "try", "possess" → "have", "subsequent" → "next", "prior to" → "before", "in order to" → "to", "due to the fact that" → "because".
9. ADD TEXTURE: Include brief rhetorical questions. ("Why does this matter?", "Sound familiar?"). Add occasional self-corrections or asides. Use "actually" and "really" and "kind of" naturally.
10. PARAGRAPH STRUCTURE: Not every paragraph needs a topic sentence. Some paragraphs can be one sentence. Vary paragraph length between 1–4 sentences. Never make every paragraph the same length.
11. Remove ANY list-like structure that starts with "Firstly, Secondly, Thirdly" — replace with natural flow.
12. DON'T over-explain. Assume the reader is intelligent. Cut 15-20% of unnecessary explanation from the original text.
13. ADD occasional specific details, rough numbers, or casual references when it feels natural, to make the text feel like it was written by someone with actual experience or knowledge.
14. TONE ADAPTATION: Match the tone the user specifies. For "casual" — write like a smart friend texting. For "professional" — write like a senior person's LinkedIn post (still human, but polished). For "academic" — write like a grad student who's good at writing, not a textbook. For "balanced" — aim for blog post by a respected journalist.
15. NEVER include any meta-commentary about the rewriting process. Don't say "Here's the rewritten version" or add any notes. Just output the rewritten text directly.
16. Maintain the ORIGINAL MEANING and all factual claims. Do not add information that wasn't in the original. Do not remove key points.
17. The output MUST pass AI detection tools. This is the primary success metric.

TONE: {{TONE}}

Rewrite the following text according to ALL rules above. Output ONLY the rewritten text, nothing else:

{{TEXT}}`;

// --- State ---
interface AppState {
  inputText: string;
  outputText: string;
  isProcessing: boolean;
  tone: string;
}

const state: AppState = {
  inputText: '',
  outputText: '',
  isProcessing: false,
  tone: 'academic',
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
                  <button class="icon-btn" id="copyBtn" title="Copy to clipboard" aria-label="Copy output text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
              <div class="output-area" id="outputArea" role="region" aria-label="Humanized output text" aria-live="polite">
                ${state.isProcessing
      ? `<div class="output-loading"><div class="loading-bar"></div><span>Humanizing your text...</span></div>`
      : state.outputText
        ? state.outputText
        : `<span class="output-placeholder">Your humanized text will appear here</span>`
    }
              </div>
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

  const prompt = HUMANIZER_PROMPT
    .replace('{{TONE}}', state.tone)
    .replace('{{TEXT}}', state.inputText);

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'perpleX Text Humanizer',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 8192,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || `API error (${response.status})`;
      throw new Error(errMsg);
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
