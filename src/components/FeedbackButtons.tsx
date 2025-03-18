
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
        className={`feedback-button ${selected === 'positive' ? 'bg-success/10 feedback-button-positive' : ''}`}
        aria-label="Positive feedback"
      >
        <ThumbsUp size={20} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNegative}
        className={`feedback-button ${selected === 'negative' ? 'bg-destructive/10 feedback-button-negative' : ''}`}
        aria-label="Negative feedback"
      >
        <ThumbsDown size={20} />
      </motion.button>
    </div>
  );
};

export default FeedbackButtons;
