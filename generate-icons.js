#!/usr/bin/env node

/**
 * Generate placeholder icons for Luna AI Journaling Companion
 * This script creates simple SVG-based icons for PWA functionality
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed based on manifest.json
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon template
function generateSVGIcon(size) {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#moonGradient)" />
  
  <!-- Moon crescent -->
  <path d="M ${size * 0.3} ${size * 0.25} 
           Q ${size * 0.2} ${size * 0.5} ${size * 0.3} ${size * 0.75}
           Q ${size * 0.6} ${size * 0.6} ${size * 0.6} ${size * 0.5}
           Q ${size * 0.6} ${size * 0.4} ${size * 0.3} ${size * 0.25} Z" 
        fill="white" opacity="0.9"/>
  
  <!-- Stars -->
  <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.02}" fill="white" opacity="0.8"/>
  <circle cx="${size * 0.8}" cy="${size * 0.4}" r="${size * 0.015}" fill="white" opacity="0.6"/>
  <circle cx="${size * 0.75}" cy="${size * 0.7}" r="${size * 0.018}" fill="white" opacity="0.7"/>
  
  <!-- Luna text (for larger icons) -->
  ${size >= 128 ? `<text x="${size/2}" y="${size * 0.9}" 
                         font-family="Inter, sans-serif" 
                         font-size="${size * 0.08}" 
                         font-weight="600" 
                         text-anchor="middle" 
                         fill="white" 
                         opacity="0.9">Luna</text>` : ''}
</svg>`;

  return svgContent;
}

// Generate all icon sizes
iconSizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.png.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Generate apple-touch-icon (180x180)
const appleTouchIcon = generateSVGIcon(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('Generated apple-touch-icon.svg');

console.log('\nIcon generation complete!');
console.log('Note: These are SVG placeholders. For production, convert to PNG using:');
console.log('- Online tools like CloudConvert');
console.log('- Command line tools like ImageMagick or Inkscape');
console.log('- Design tools like Figma, Sketch, or Adobe Illustrator');
