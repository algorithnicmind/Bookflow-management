import React from 'react';

// Maps emoji to its unicode hex string matching emoji-datasource-apple
function getEmojiHex(emoji) {
  let hex = Array.from(emoji).map(char => char.codePointAt(0).toString(16));
  // Remove variation selector if there are multiple code points
  if (hex.length > 1 && hex.includes('fe0f')) {
      hex = hex.filter(h => h !== 'fe0f');
  }
  return hex.join('-');
}

export default function AppleEmoji({ char, className = '' }) {
  const hex = getEmojiHex(char);
  return (
    <img 
      src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`} 
      alt={char} 
      className={`inline-block w-[1.2em] h-[1.2em] align-baseline mb-[0.1em] ${className}`} 
      loading="lazy" 
      draggable={false}
      style={{ display: 'inline-block', verticalAlign: '-0.15em' }}
    />
  );
}
