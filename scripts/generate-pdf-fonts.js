/**
 * Generates optimized PDF font bundle (file.js) with only 4 required Poppins variants.
 * Reduces bundle size from ~3.86 MB to ~0.85 MB (saves ~3 MB).
 *
 * Usage: npm run generate:pdf-fonts
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const pdfMakeDir = path.join(projectRoot, 'public', 'fonts', 'pdfMake');
const optimizedDir = path.join(projectRoot, 'public', 'fonts', 'pdfMake-optimized');
const outputFile = path.join(projectRoot, 'public', 'fonts', 'outputfonts', 'file.js');

const requiredFonts = [
  'Poppins-Regular.ttf',
  'Poppins-Bold.ttf',
  'Poppins-Italic.ttf',
  'Poppins-BoldItalic.ttf',
];

console.log('Generating optimized PDF fonts (4 variants only)...\n');

// Ensure pdfMake-optimized directory exists
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Copy only the 4 required fonts
for (const font of requiredFonts) {
  const src = path.join(pdfMakeDir, font);
  const dest = path.join(optimizedDir, font);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  Copied ${font}`);
  } else {
    console.warn(`  Warning: ${font} not found, skipping`);
  }
}

// Run pdfmake-font-generator (first arg: directory of fonts, second arg: output .js file)
execSync(
  `npx pdfmake-font-generator "${optimizedDir}" "${outputFile}"`,
  { cwd: projectRoot, stdio: 'inherit' }
);console.log('\nDone. file.js has been regenerated with only 4 fonts (~0.85 MB, saves ~3 MB).');
