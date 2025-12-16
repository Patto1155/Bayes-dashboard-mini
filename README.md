# Bayesian Conviction Calculator

A portfolio-ready web application that helps investors quantify their conviction using Bayesian statistics. This tool serves as both a functional calculator and an educational demonstration of how Bayes' Theorem works.

## 🎯 Features

- **Interactive Prior Setting**: Set your initial belief with a visual slider
- **Evidence Wizard**: Add evidence by answering two intuitive questions about likelihood
- **Live Math Display**: See Bayes' Theorem calculations in real-time with animated formulas
- **Evidence Log**: Track all your evidence with "margin math" showing the impact
- **Kelly Criterion**: Get position sizing recommendations based on your conviction
- **Beautiful UI**: Scientific notebook aesthetic with serif fonts and clean design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AddEvidenceModal.tsx    # Evidence input wizard with live math
│   ├── BeamBalance.tsx          # SVG visualizer for Bayes Factor
│   ├── BayesFactorDisplay.tsx   # Animated fraction display
│   ├── EvidenceCard.tsx         # Evidence card with margin math
│   ├── Footer.tsx               # Conviction summary & Kelly sizing
│   ├── Header.tsx               # Thesis input & prior slider
│   └── LatexFormula.tsx         # Math formula styling
├── utils/
│   └── bayesian.ts              # Bayesian calculation utilities
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Main application
└── index.css                    # Tailwind + custom styles
```

## 🧮 The Math

This calculator uses the **Odds Form of Bayes' Theorem**:

1. **Convert Prior to Odds**: `O_prior = P(H) / (1 - P(H))`
2. **Calculate Bayes Factor**: `BF = P(E|H) / P(E|¬H)`
3. **Update Odds**: `O_new = O_prior × BF`
4. **Convert to Probability**: `P_new = O_new / (1 + O_new)`

See [VISION_AND_MATH.md](./VISION_AND_MATH.md) for detailed mathematical framework.

## 🎨 Design Philosophy

- **Math is the Hero**: Every calculation is visible, never hidden
- **Color = Meaning**: Green = "if true", Red = "if false"
- **Animation = Feedback**: Changes feel consequential through motion
- **Education Built-In**: Formulas have explanatory subtitles

## 📦 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

## 📖 Usage

1. **Set Your Thesis**: Describe your investment hypothesis
2. **Set Prior Belief**: Use the slider to set your initial conviction (0-100%)
3. **Add Evidence**: Click "Add Evidence" and answer two questions:
   - If thesis is TRUE, how likely is this evidence?
   - If thesis is WRONG, how likely is this evidence?
4. **Watch the Math**: See Bayes Factor calculated in real-time
5. **Review Conviction**: Your belief updates automatically
6. **Check Position Size**: See Kelly Criterion recommendations

## 🎯 Example Workflow

**Thesis**: "Company XYZ will grow revenue 30%+ annually for 5 years"

**Prior**: Start at 60% confidence

**Evidence #1**: Strong Q4 earnings beat
- If thesis TRUE: 80% likely
- If thesis FALSE: 20% likely
- **Result**: BF = 4.0×, conviction → 86%

**Evidence #2**: Key executive departure
- If thesis TRUE: 30% likely
- If thesis FALSE: 60% likely
- **Result**: BF = 0.5×, conviction → 75%

## 🔧 Customization

- Adjust Kelly odds in `Footer.tsx` (currently 3:1)
- Modify color scheme in `index.css`
- Add more visualizations using Recharts
- Extend math utilities in `utils/bayesian.ts`

## 📝 License

This is a portfolio project built for educational purposes.

## 🙏 Acknowledgments

- Mathematical framework from Philip Tetlock's *Superforecasting*
- Design inspiration from Distill.pub and Bret Victor
- Built as a thinking tool for systematic investors
