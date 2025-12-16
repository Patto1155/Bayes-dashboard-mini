// Beam Balance SVG Visualizer
// Shows if evidence tips toward confirming (green/right) or disconfirming (red/left)

import { motion } from 'framer-motion';

interface BeamBalanceProps {
  bayesFactor: number;
  size?: number;
}

export function BeamBalance({ bayesFactor, size = 80 }: BeamBalanceProps) {
  // Calculate rotation angle based on Bayes Factor
  // BF > 1 tilts right (confirming), BF < 1 tilts left (disconfirming)
  const maxAngle = 30;
  let angle = 0;
  
  if (bayesFactor > 1) {
    // Confirming: tilt right (positive angle)
    angle = Math.min(maxAngle, Math.log10(bayesFactor) * 20);
  } else if (bayesFactor < 1 && bayesFactor > 0) {
    // Disconfirming: tilt left (negative angle)
    angle = Math.max(-maxAngle, Math.log10(bayesFactor) * 20);
  }
  
  const color = bayesFactor > 1 ? '#059669' : bayesFactor < 1 ? '#e11d48' : '#6b7280';
  
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className="mx-auto">
      {/* Fulcrum (triangle base) */}
      <polygon
        points="50,45 45,55 55,55"
        fill="#4b5563"
      />
      
      {/* The Beam */}
      <motion.line
        x1="20"
        y1="45"
        x2="80"
        y2="45"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{ originX: '50px', originY: '45px' }}
      />
      
      {/* Left weight */}
      <motion.circle
        cx="20"
        cy="45"
        r="6"
        fill={bayesFactor < 1 ? '#e11d48' : '#d1d5db'}
        initial={{ cy: 45 }}
        animate={{ cy: 45 + angle * 0.5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      />
      
      {/* Right weight */}
      <motion.circle
        cx="80"
        cy="45"
        r="6"
        fill={bayesFactor > 1 ? '#059669' : '#d1d5db'}
        initial={{ cy: 45 }}
        animate={{ cy: 45 - angle * 0.5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      />
      
      {/* Label */}
      <text
        x="50"
        y="20"
        textAnchor="middle"
        className="text-xs fill-gray-500"
        style={{ fontFamily: 'Georgia, serif', fontSize: '8px' }}
      >
        {bayesFactor > 1 ? 'Confirms' : bayesFactor < 1 ? 'Contradicts' : 'Neutral'}
      </text>
    </svg>
  );
}
