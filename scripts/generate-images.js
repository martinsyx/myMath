// This script generates preview images for math games
// Run with: node scripts/generate-images.js

const fs = require('fs');
const path = require('path');

// Since we don't have canvas installed, we'll create simple SVG images instead
function createSVGImage(title, problem, color, filename) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="300" fill="#ffffff"/>
  <rect width="400" height="300" fill="none" stroke="#e0e0e0" stroke-width="2"/>

  <!-- Title -->
  <text x="200" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e40af" text-anchor="middle">${title}</text>

  <!-- Subtitle -->
  <text x="200" y="65" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">Kids Math Game</text>

  <!-- Problem -->
  <text x="200" y="140" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#374151" text-anchor="middle">${problem}</text>

  <!-- Answer box -->
  <rect x="150" y="160" width="100" height="50" fill="none" stroke="${color}" stroke-width="3" rx="5"/>

  <!-- Score -->
  <text x="30" y="230" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#10b981" text-anchor="start">Score: 0/10</text>

  <!-- Button -->
  <rect x="130" y="240" width="140" height="40" fill="${color}" rx="8"/>
  <text x="200" y="265" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Check Answer</text>
</svg>`;

    return svg;
}

function createVisualizationSVG() {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="300" fill="#ffffff"/>
  <rect width="400" height="300" fill="none" stroke="#e0e0e0" stroke-width="2"/>

  <!-- Title -->
  <text x="200" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e40af" text-anchor="middle">Number Visualization</text>

  <!-- Subtitle -->
  <text x="200" y="65" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">Kids Math Game</text>

  <!-- Visual blocks -->
  <rect x="60" y="100" width="40" height="40" fill="#3b82f6" rx="5"/>
  <rect x="120" y="100" width="40" height="40" fill="#3b82f6" rx="5"/>
  <rect x="180" y="100" width="40" height="40" fill="#3b82f6" rx="5"/>
  <rect x="240" y="100" width="40" height="40" fill="#3b82f6" rx="5"/>
  <rect x="300" y="100" width="40" height="40" fill="#3b82f6" rx="5"/>

  <!-- Number -->
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#374151" text-anchor="middle">5</text>

  <!-- Label -->
  <text x="30" y="230" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#10b981" text-anchor="start">Visualize Numbers</text>

  <!-- Button -->
  <rect x="130" y="240" width="140" height="40" fill="#06b6d4" rx="8"/>
  <text x="200" y="265" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Start Learning</text>
</svg>`;

    return svg;
}

// Generate images
const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate each game image
const games = [
    { title: 'Addition Practice', problem: '7 + 5 = ?', color: '#3b82f6', filename: 'addition-game.svg' },
    { title: 'Subtraction Practice', problem: '15 - 8 = ?', color: '#8b5cf6', filename: 'subtraction-game.svg' },
    { title: 'Multiplication Practice', problem: '6 × 4 = ?', color: '#f59e0b', filename: 'multiplication-game.svg' },
    { title: 'Division Practice', problem: '24 ÷ 6 = ?', color: '#ef4444', filename: 'division-game.svg' }
];

games.forEach(game => {
    const svg = createSVGImage(game.title, game.problem, game.color, game.filename);
    const filepath = path.join(imagesDir, game.filename);
    fs.writeFileSync(filepath, svg);
    console.log(`Generated: ${game.filename}`);
});

// Generate visualization image
const visualizationSVG = createVisualizationSVG();
const visualizationPath = path.join(imagesDir, 'visualization-game.svg');
fs.writeFileSync(visualizationPath, visualizationSVG);
console.log('Generated: visualization-game.svg');

console.log('\nAll images generated successfully!');
console.log('Note: SVG files were created. You can convert them to PNG if needed.');
