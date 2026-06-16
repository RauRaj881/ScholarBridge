import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lightbulb, Users } from 'lucide-react';

const slideIcons = [
  <Trophy size={28} color="#fbbf24" />,
  <Lightbulb size={28} color="#6ea8fe" />,
  <Users size={28} color="#a855f7" />,
];

const stickers = ['🎓', '💡', '🏆', '✨'];

export default function Carousel({ slide, slideIndex, totalSlides }) {
  return (
    <div className="carousel-container">
      {/* Floating stickers */}
      {stickers.map((s, i) => (
        <span key={i} className={`carousel-sticker carousel-sticker-${i + 1}`}>{s}</span>
      ))}

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}
        >
          {/* Icon badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            style={{
              width: 60, height: 60, borderRadius: '16px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            {slideIcons[slide.id - 1] || slideIcons[0]}
          </motion.div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}
            >
              {slide.content}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      {totalSlides && (
        <div className="carousel-progress">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className={`carousel-dot ${i === slideIndex ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}