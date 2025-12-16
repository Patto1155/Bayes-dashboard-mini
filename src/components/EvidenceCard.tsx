import { motion } from 'framer-motion';
import { ExternalLink, Trash2 } from 'lucide-react';
import type { Evidence } from '../types';

interface EvidenceCardProps {
  evidence: Evidence;
  index: number;
  onDelete: (id: string) => void;
}

export function EvidenceCard({ evidence, index, onDelete }: EvidenceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Evidence #{index + 1}
          </h3>
          <button
            onClick={() => onDelete(evidence.id)}
            className="text-gray-400 hover:text-rose-600 transition-colors"
            title="Delete evidence"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-base text-gray-900 mb-3 leading-relaxed">
          {evidence.summary}
        </p>

        <div className="flex items-center justify-between gap-3">
          {evidence.sourceUrl ? (
            <a
              href={evidence.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Source
            </a>
          ) : (
            <span />
          )}

          <div className="text-xs text-gray-400">
            {evidence.timestamp.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
