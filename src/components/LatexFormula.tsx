// Simple Latex-style formula renderer
// Since react-latex-next has compatibility issues, we'll use styled HTML/CSS

interface LatexFormulaProps {
  children: React.ReactNode;
  className?: string;
}

export function LatexFormula({ children, className = '' }: LatexFormulaProps) {
  return (
    <span className={`math-italic text-gray-600 ${className}`}>
      {children}
    </span>
  );
}

interface FractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  className?: string;
}

export function Fraction({ numerator, denominator, className = '' }: FractionProps) {
  return (
    <span className={`inline-flex flex-col items-center text-center ${className}`}>
      <span className="px-1">{numerator}</span>
      <span className="border-t border-gray-400 w-full"></span>
      <span className="px-1">{denominator}</span>
    </span>
  );
}
