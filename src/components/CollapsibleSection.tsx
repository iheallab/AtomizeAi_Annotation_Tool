
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 overflow-hidden bg-secondary/50 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset rounded-lg"
      >
        <h3 className="text-base font-medium flex items-center gap-2">
          {title}
        </h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-4 pb-4 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;
