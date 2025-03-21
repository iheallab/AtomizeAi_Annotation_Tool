
import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

type FeedbackButtonsProps = {
  onPositive: () => void;
  onNegative: () => void;
  selected?: 'positive' | 'negative' | null;
};

const FeedbackButtons = ({ onPositive, onNegative, selected }: FeedbackButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPositive}
        className={`p-2 rounded-md transition-colors flex items-center justify-center ${selected === 'positive' ? 'bg-success/10 text-success' : 'hover:bg-muted'}`}
        aria-label="Positive feedback"
      >
        <ThumbsUp size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNegative}
        className={`p-2 rounded-md transition-colors flex items-center justify-center ${selected === 'negative' ? 'bg-destructive/10 text-destructive' : 'hover:bg-muted'}`}
        aria-label="Negative feedback"
      >
        <ThumbsDown size={20} />
      </motion.button>
    </div>
  );
};

export default FeedbackButtons;
