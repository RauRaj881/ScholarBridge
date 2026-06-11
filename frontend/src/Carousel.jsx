import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Carousel({ slide }) {
  return (
    <div className="carousel-container" style={{ 
      position: 'relative', height: '150px', width: '100%', overflow: 'hidden', 
      borderRadius: '24px', background: 'var(--panel)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' 
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ width: '100%', textAlign: 'center', padding: '20px' }}
        >
          <h2 style={{ marginBottom: '8px', color: 'var(--text)' }}>{slide.title}</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>{slide.content}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}