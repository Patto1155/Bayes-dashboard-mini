# Bayesian Conviction Calculator

## Vision & Mathematical Framework

---

## The Problem

Investors consistently fall victim to cognitive biases when updating their beliefs:

- **Confirmation Bias**: Overweighting evidence that supports existing beliefs
- **Anchoring**: Failing to update sufficiently when new information arrives
- **Gut Feel Investing**: Making decisions based on intuition rather than systematic analysis

The result? Portfolios built on inconsistent reasoning, where conviction levels don't match the actual weight of evidence.

---

## The Solution

A **Bayesian Conviction Calculator** that forces explicit, quantitative thinking about:

1. **Prior Belief**: What do I believe before seeing this evidence?
2. **Evidence Quality**: How diagnostic is this new information?
3. **Posterior Belief**: What should I believe now?

By making each step explicit, investors can audit their own reasoning and identify when they're being irrational.

---

## The Math: The Engine

We use the **Odds Form of Bayes' Theorem**, which is more intuitive for sequential updating than the traditional probability form.

### Step 1: Convert Prior Probability to Odds

$$O_{prior} = \frac{P(H)}{1 - P(H)}$$

Where:
- $P(H)$ = Your prior probability that the thesis is true
- $O_{prior}$ = The odds form of your prior belief

**Example**: A 60% belief → Odds = 0.60 / 0.40 = **1.5** (or "1.5 to 1")

### Step 2: Calculate the Bayes Factor

$$BayesFactor = \frac{P(E|H)}{P(E|\neg H)}$$

Where:
- $P(E|H)$ = **Likelihood if True**: How probable is this evidence if your thesis IS correct?
- $P(E|\neg H)$ = **Likelihood if False**: How probable is this evidence if your thesis is WRONG?

**Interpretation**:
- BF > 1 → Evidence supports the thesis
- BF < 1 → Evidence contradicts the thesis  
- BF = 1 → Evidence is uninformative

**Example**: You observe strong earnings. If thesis is true, 80% chance of this. If thesis is false, 20% chance.
BayesFactor = 0.80 / 0.20 = **4.0x** (strong support)

### Step 3: Update the Odds

$$O_{new} = O_{prior} \times BayesFactor$$

Simply multiply! This is why the odds form is elegant.

**Example**: 1.5 × 4.0 = **6.0** (new odds)

### Step 4: Convert Back to Probability

$$P_{new} = \frac{O_{new}}{1 + O_{new}}$$

**Example**: 6.0 / (1 + 6.0) = 6.0 / 7.0 = **85.7%**

---

## Key Definitions

| Term | Symbol | Meaning |
|------|--------|---------|
| **Likelihood if True** | $P(E\|H)$ | "If my thesis is correct, how likely would I be to see this evidence?" |
| **Likelihood if False** | $P(E\|\neg H)$ | "If my thesis is wrong, how likely would I be to see this evidence?" |
| **Bayes Factor** | $BF$ | The ratio of these likelihoods—measures how "diagnostic" the evidence is |
| **Prior Odds** | $O_{prior}$ | Your belief before new evidence, expressed as odds |
| **Posterior Odds** | $O_{new}$ | Your updated belief after incorporating evidence |

---

## Position Sizing: Kelly Criterion

Once we have a conviction level, we can suggest position sizing using the **Kelly Criterion**:

$$f^* = \frac{p \cdot b - q}{b}$$

Where:
- $f^*$ = Fraction of capital to allocate
- $p$ = Probability of winning (our posterior probability)
- $q$ = Probability of losing ($1 - p$)
- $b$ = Odds offered (assumed 3:1 for this calculator)

**Note**: Kelly is aggressive. In practice, many investors use "Half Kelly" or "Quarter Kelly" for safety.

---

## "Live Math" UI/UX Strategy

To make the math "take center stage" and feel like a high-quality interactive essay (think **Distill.pub** or **Bret Victor** style), we implement "Live Math"—equations that aren't just text, but **interactive UI elements**.

### 1. The Rendering Engine

**Primary: KaTeX** (via `react-latex-next`)

- Renders true LaTeX—the gold standard for math typography
- Much faster and lighter than MathJax
- Provides beautiful italic serifs and crisp fraction bars that standard CSS struggles with

**Alternative consideration**: Mafs (mafs.dev) for interactive visualizations, but KaTeX is sufficient for equation text.

### 2. The "Live Math" Component Architecture

Instead of static strings, we build **ReactiveFormula** components. The equation becomes a sentence where variables are "holes" filled by live data.

**The Concept:**
- Formula text is static black text
- Variables ($P(E|H)$, $P(H)$) are **color-coded "Pills"** that animate when numbers change

### 3. Interactive Component Patterns

#### A. Variable Link (Hover Awareness)

**Behavior**: When the user hovers over the green $P(E|H)$ term in the formula, the corresponding "Likelihood if True" slider highlights or pulses.

**Why**: Reinforces the connection between abstraction (math) and control (slider).

#### B. Rolling Number Animation (Framer Motion)

**Behavior**: When the result changes from $3.0x$ to $4.5x$, numbers scroll up/down like a slot machine or old gas pump—not just text swaps.

**Effect**: Makes the math feel "heavy" and mechanical, not just digital.

#### C. Beam Balance Visualizer

**Behavior**: A small SVG fulcrum under the Bayes Factor equation:
- Ratio > 1 (confirming) → tilts green/right
- Ratio < 1 (disconfirming) → tilts red/left

**Why**: Provides instant "gut check" visual for the math.

### 4. Implementation Stack

For that "Apple Design meets Math Textbook" aesthetic:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Typography** | KaTeX | Static symbols ($\frac{a}{b}$, $\times$, $\approx$) |
| **Variables** | Custom `<span>` with `tabular-nums` | Monospaced numbers prevent jittering |
| **Animation** | Framer Motion | Layout transitions, expanding formulas |
| **Colors** | Emerald (True) / Rose (False) | Consistent semantic meaning |

### 5. Example: Live Bayes Factor Component

```typescript
// The "Live" Math Component Pattern
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { motion } from 'framer-motion';

const BayesFactorDisplay = ({ trueLikelihood, falseLikelihood }) => {
  const bf = (trueLikelihood / falseLikelihood).toFixed(2);
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg border text-center font-serif text-lg">
      <div className="flex items-center justify-center space-x-2">
        {/* Static LaTeX Label */}
        <span className="text-gray-500 italic">Bayes Factor</span>
        <span>=</span>
        
        {/* The Fraction - Live Values */}
        <div className="flex flex-col items-center">
          {/* Numerator (Green, Linked to Slider 1) */}
          <motion.span 
            key={trueLikelihood}
            initial={{ opacity: 0.5, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-600 font-bold border-b border-gray-400 px-1"
          >
            {trueLikelihood.toFixed(2)}
          </motion.span>
          
          {/* Denominator (Red, Linked to Slider 2) */}
          <motion.span 
            key={falseLikelihood}
            initial={{ opacity: 0.5, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-600 font-bold px-1"
          >
            {falseLikelihood.toFixed(2)}
          </motion.span>
        </div>
        
        <span>=</span>
        
        {/* The Result (Big & Bold with Pulse) */}
        <motion.span 
          className="text-2xl font-bold text-gray-900"
          animate={{ scale: [1, 1.2, 1] }}
        >
          {bf}x
        </motion.span>
      </div>
      
      {/* Educational subtitle */}
      <div className="text-xs text-gray-400 mt-2">
        <Latex>{"$\\frac{P(Evidence|True)}{P(Evidence|False)}$"}</Latex>
      </div>
    </div>
  );
};
```

### 6. Design Principles

1. **Math is the Hero**: Every calculation shown, never hidden
2. **Color = Meaning**: Green always means "if true", Red always means "if false"
3. **Animation = Feedback**: Changes feel consequential, not instant
4. **Education Built-In**: Formulas have explanatory subtitles

---

## Why This Matters

> "The essence of good judgment is matching the strength of your opinions to the strength of your evidence."
> — Philip Tetlock, *Superforecasting*

This tool doesn't tell you *what* to believe. It tells you *how much* to update your beliefs based on the evidence you've observed—nothing more, nothing less.

---

*Built as a thinking tool for systematic investors.*
