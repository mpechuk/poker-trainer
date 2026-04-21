import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { TERMS } from '../../data/terms.js';
import { buildDeck, buildOptions } from './Quiz.jsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(resolve(__dirname, 'Quiz.jsx'), 'utf8');

const ALL_CATS = new Set(TERMS.map(t => t.cat));

describe('buildOptions', () => {
  it('always includes the correct term from deck[idx] — regression for dual-shuffle bug', () => {
    // Before fix, options were built from a *different* shuffled deck than quizDeck,
    // so the correct answer for question 0 was frequently absent.
    for (let run = 0; run < 20; run++) {
      const deck = buildDeck(ALL_CATS);
      const opts = buildOptions(deck, 0);
      const correctTerm = deck[0].term;
      const found = opts.some(o => o.term === correctTerm);
      expect(found, `correct term "${correctTerm}" missing from options on run ${run}`).toBe(true);
    }
  });

  it('returns exactly 4 options', () => {
    const deck = buildDeck(ALL_CATS);
    const opts = buildOptions(deck, 0);
    expect(opts).toHaveLength(4);
  });

  it('returns empty array when idx is out of bounds', () => {
    const deck = buildDeck(ALL_CATS);
    expect(buildOptions(deck, deck.length)).toEqual([]);
    expect(buildOptions([], 0)).toEqual([]);
  });

  it('distractors share categories with the deck — no off-topic options', () => {
    // Regression: with a single selected category, wrong answers pulled from
    // the global TERMS pool surfaced unrelated terms (e.g. "UTG" as a
    // distractor in a Hand Rankings quiz), making the quiz feel off-topic.
    const cats = new Set(['Hand Rankings']);
    const deck = buildDeck(cats);
    for (let run = 0; run < 20; run++) {
      for (let i = 0; i < deck.length; i++) {
        const opts = buildOptions(deck, i);
        for (const o of opts) {
          expect(o.cat, `option ${o.term} had cat ${o.cat}`).toBe('Hand Rankings');
        }
      }
    }
  });
});

describe('Quiz — complete screen', () => {
  it('renders a Stats link pointing to #/stats on the complete screen', () => {
    // Lets users jump straight to their overall stats after finishing a quiz.
    expect(quizSource).toMatch(/href="#\/stats"[^>]*>Stats<\/a>/);
  });

  it('renders the Recommendation component on the complete screen', () => {
    // Surfaces the "Recommended Next Quiz" block right after a quiz ends.
    expect(quizSource).toMatch(/import\s*\{\s*Recommendation\s*\}\s*from\s*['"][^'"]*Recommendation\.jsx['"]/);
    expect(quizSource).toMatch(/<Recommendation\s*\/>/);
  });

  it('offers a Back to Setup button when the quiz is not from a shared link', () => {
    // Mirrors preflop: "Back to Setup" returns the user to the topic picker.
    expect(quizSource).toMatch(/onClick=\{exitQuiz\}[^>]*>Back to Setup/);
  });
});

describe('Quiz — share link integration', () => {
  it('imports share utilities used to encode/decode quiz config into a URL', () => {
    expect(quizSource).toMatch(/from\s+['"][^'"]*\/utils\/share\.js['"]/);
    expect(quizSource).toMatch(/encodeTermQuiz/);
    expect(quizSource).toMatch(/decodeTermQuiz/);
  });

  it('renders a ShareButton so users can copy a link to the current quiz', () => {
    expect(quizSource).toMatch(/<ShareButton\s/);
  });

  it('splits the complete-screen share UI into Share Link + Share Score buttons', () => {
    // "Share Link" copies just the URL; "Share Score" copies a score-brag
    // message that already embeds the URL via buildScoreMessage.
    expect(quizSource).toMatch(/label="Share Link"/);
    expect(quizSource).toMatch(/label="Share Score"/);
    expect(quizSource).toMatch(/buildScoreMessage\(score,\s*total,\s*shareUrl\)/);
  });

  it('hydrates the deck from a shared ?tq= query on initial render', () => {
    // Without this branch a shared link would still show a random quiz.
    expect(quizSource).toMatch(/decodeTermQuiz\(query\)/);
    expect(quizSource).toMatch(/shared\?\.deck/);
  });

  it('shared links auto-start in the playing phase — skip the setup screen', () => {
    // The recipient of a share should see the quiz immediately, not a
    // setup screen that could let them alter the shared deck's topics.
    expect(quizSource).toMatch(/useState\(shared\s*\?\s*['"]playing['"]\s*:\s*['"]setup['"]\)/);
  });
});

describe('Quiz — setup phase', () => {
  it('defines a setup phase separate from playing — mirrors the preflop quiz flow', () => {
    // Regression: without a setup phase, the quiz would start immediately on
    // mount and give the user no chance to pick topics before answering.
    expect(quizSource).toMatch(/phase\s*===\s*['"]setup['"]/);
    expect(quizSource).toMatch(/setPhase\(['"]playing['"]\)/);
  });

  it('renders a Start Quiz button on the setup screen — triggers startQuiz', () => {
    expect(quizSource).toMatch(/<button\s+class="rq-start-btn"\s+onClick=\{startQuiz\}>\s*Start Quiz\s*<\/button>/);
  });

  it('renders the FilterChips topic selector on the setup screen', () => {
    // Users pick which term categories to quiz on before starting.
    expect(quizSource).toMatch(/import\s*\{\s*FilterChips\s*\}\s*from\s*['"][^'"]*\/FilterChips\.jsx['"]/);
    expect(quizSource).toMatch(/<FilterChips\s+activeCats=\{activeCats\}\s+onToggle=\{toggleCat\}\s*\/>/);
  });

  it('startQuiz() re-reads settings and threads fresh.quizLength into buildDeck', () => {
    // Entering the playing phase must pick up the latest Settings page values
    // (quizLength, autoAdvance) — otherwise changes wouldn't take effect
    // without a reload.
    expect(quizSource).toMatch(/function\s+startQuiz[\s\S]*?getSettings\(\)[\s\S]*?buildDeck\(activeCats,\s*fresh\.quizLength\)[\s\S]*?setPhase\(['"]playing['"]\)/);
  });

  it('exitQuiz() returns to the setup phase — lets the user re-pick topics mid-quiz', () => {
    expect(quizSource).toMatch(/function\s+exitQuiz[\s\S]*?setPhase\(['"]setup['"]\)/);
  });
});

describe('Quiz — playing screen', () => {
  it('renders a progress bar filled proportionally to qIdx / quizDeck.length', () => {
    // Visual feedback that matches the preflop quiz's rq-progress pattern.
    expect(quizSource).toMatch(/class="rq-progress"/);
    expect(quizSource).toMatch(/qIdx\s*\/\s*quizDeck\.length\s*\*\s*100/);
  });

  it('keys each answer button by qIdx + term so DOM nodes don\'t persist across questions — no random yellow highlight regression', () => {
    // Regression for issue #46: when a term appeared as a distractor in two
    // consecutive questions, Preact reused the previous question's DOM node
    // (matched by key={o.term}). Focus and :focus-visible carried over, so a
    // randomly-positioned answer in the next question showed the gold outline
    // even though the user hadn't interacted with it yet. Scoping the key to
    // qIdx forces a fresh DOM node per question.
    expect(quizSource).toMatch(/key=\{qIdx\s*\+\s*['"]:['"][\s\S]{0,20}o\.term\}/);
    expect(quizSource).not.toMatch(/key=\{o\.term\}/);
  });

  it('renders a Question N / Total stat so users know where they are in the run', () => {
    // Regression: previously the playing screen hid the total count, so
    // users couldn't tell how many questions were left.
    expect(quizSource).toMatch(/\{qIdx\s*\+\s*1\}\s*\/\s*\{quizDeck\.length\}/);
    expect(quizSource).toMatch(/<div class="lbl">Question<\/div>/);
  });

  it('renders an Exit button on the playing screen — mirrors preflop', () => {
    expect(quizSource).toMatch(/class="rq-exit-btn"/);
  });
});

describe('Quiz — auto-advance', () => {
  it('imports useEffect — required to drive the auto-advance countdown interval', () => {
    expect(quizSource).toMatch(/import\s*\{[^}]*useEffect[^}]*\}\s*from\s*['"]preact\/hooks['"]/);
  });

  it('holds a countdown state seeded from settings.autoAdvanceSeconds', () => {
    expect(quizSource).toMatch(/useState\(settings\.autoAdvanceSeconds\)/);
  });

  it('bails out of the countdown effect when autoAdvance is disabled in settings', () => {
    // Users who want to read the question at their own pace must not be
    // kicked forward by a background timer.
    expect(quizSource).toMatch(/if\s*\(!settings\.autoAdvance\)\s*return/);
  });

  it('countdown effect depends on settings.autoAdvance and autoAdvanceSeconds — reflects live Settings changes', () => {
    expect(quizSource).toMatch(/\[answered,\s*phase,\s*settings\.autoAdvance,\s*settings\.autoAdvanceSeconds[\s\S]*?\]/);
  });

  it('shows an "Auto-advancing in Ns" indicator while the timer is active', () => {
    // Users need to see that a timer is running so they can choose to click
    // Next manually or wait.
    expect(quizSource).toMatch(/Auto-advancing in \{countdown\}s/);
  });
});

describe('Quiz — per-category stats tracking', () => {
  it('answerQuiz records the current term\'s category alongside correctness', () => {
    // Per-category accuracy can't be derived after the fact from just
    // totalCorrect/totalQuestions — we need to log each question's cat as it
    // gets answered so the complete screen can roll it up by category.
    expect(quizSource).toMatch(/setPerQuestionResults\(r\s*=>\s*\[\.\.\.r,\s*\{\s*cat:\s*current\.cat,\s*correct:\s*isCorrect\s*\}\s*\]\)/);
  });

  it('complete screen writes each question into stats.byCategory', () => {
    // Rolls perQuestionResults up into { total, correct } buckets keyed by
    // category so the Dashboard can render an "Accuracy by Category" bar chart.
    expect(quizSource).toMatch(/stats\.byCategory/);
    expect(quizSource).toMatch(/for\s*\(\s*const\s+r\s+of\s+perQuestionResults/);
  });
});

describe('Quiz — configurable quiz length', () => {
  it('imports getSettings from storage — required to read the quizLength preference', () => {
    expect(quizSource).toMatch(/import\s*\{[^}]*getSettings[^}]*\}\s*from\s*['"][^'"]*\/utils\/storage\.js['"]/);
  });

  it('startQuiz() reads settings.quizLength — the Start button respects the Settings page choice', () => {
    // Regression: if startQuiz builds the deck without passing the length arg,
    // the terminology quiz silently ignores the Settings page "Quiz length"
    // choice and always uses the filtered pool's full size.
    expect(quizSource).toMatch(/function\s+startQuiz[\s\S]*?buildDeck\(activeCats,\s*fresh\.quizLength\)/);
  });

  it('restart() re-reads settings and threads fresh.quizLength into buildDeck — Play Again reflects latest setting', () => {
    // Regression: if restart() captured the stale settings state instead of
    // calling getSettings(), changing quizLength in Settings wouldn't take
    // effect on "Play Again" without a full remount.
    expect(quizSource).toMatch(/function\s+restart[\s\S]*?getSettings\(\)[\s\S]*?buildDeck\(activeCats,\s*fresh\.quizLength\)/);
  });
});

describe('buildDeck', () => {
  it('filters terms to only matching categories', () => {
    const cats = new Set(['Hand Rankings']);
    const deck = buildDeck(cats);
    expect(deck.length).toBeGreaterThan(0);
    for (const t of deck) {
      expect(t.cat).toBe('Hand Rankings');
    }
  });

  it('returns empty array when no categories match', () => {
    const deck = buildDeck(new Set());
    expect(deck).toHaveLength(0);
  });

  it('respects the optional length parameter — quizLength setting controls question count', () => {
    const deck = buildDeck(ALL_CATS, 5);
    expect(deck).toHaveLength(5);
  });

  it('returns fewer than requested when the filtered pool is smaller', () => {
    const cats = new Set(['Hand Rankings']);
    const full = buildDeck(cats);
    const limited = buildDeck(cats, full.length + 50);
    expect(limited.length).toBe(full.length);
  });

  it('defaults to the full filtered deck when no length is passed', () => {
    const full = buildDeck(ALL_CATS);
    expect(full.length).toBe(TERMS.filter(t => ALL_CATS.has(t.cat)).length);
  });
});
