#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a file to act as a stream we can write to.
const output = fs.createWriteStream(path.join(outputDir, 'next-chat-mobile-migration.zip'));

// Create the archive
const archive = archiver('zip', {
  zlib: { level: 9 }
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`✓ Archive created: ${archive.pointer()} bytes`);
  console.log(`✓ File saved to: dist/next-chat-mobile-migration.zip`);
  console.log('\n✓ You can now download the zip file!');
});

// Good practice to catch warnings (ie stat failures and other non-fatal errors)
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Directories to include
const dirs = ['mobile', 'web', 'shared', 'realtime'];
const files = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'MIGRATION_INDEX.md',
  'MIGRATION_SUMMARY.md',
  'MIGRATION_GUIDE.md',
  'COMPONENT_MIGRATION.md',
  'README_MIGRATION.md',
  '.gitignore',
  'README.md'
];

// Add directories
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    archive.directory(dirPath, dir);
  }
});

// Add root files
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
  }
});

// Finalize the archive
archive.finalize();
