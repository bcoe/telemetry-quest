#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Build script to combine and minify JSON files from data/rooms and data/objects
 * into a single bundled file for better FCP performance.
 */

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function combineJsonFiles() {
  const combined = {
    rooms: {},
    objects: {},
    spritesheet: null,
    manifest: null
  };

  // Read all room files
  const roomsDir = path.join(__dirname, 'data', 'rooms');
  const roomFiles = fs.readdirSync(roomsDir).filter(file => file.endsWith('.json'));
  
  for (const file of roomFiles) {
    const roomName = path.basename(file, '.json');
    const roomData = readJsonFile(path.join(roomsDir, file));
    if (roomData) {
      combined.rooms[roomName] = roomData;
    }
  }

  // Read all object files
  const objectsDir = path.join(__dirname, 'data', 'objects');
  const objectFiles = fs.readdirSync(objectsDir).filter(file => file.endsWith('.json'));
  
  for (const file of objectFiles) {
    const objectName = path.basename(file, '.json');
    const objectData = readJsonFile(path.join(objectsDir, file));
    if (objectData) {
      combined.objects[objectName] = objectData;
    }
  }

  // Read spritesheet and manifest
  const spritesheetData = readJsonFile(path.join(__dirname, 'data', 'spritesheet.json'));
  if (spritesheetData) {
    combined.spritesheet = spritesheetData;
  }

  const manifestData = readJsonFile(path.join(__dirname, 'data', 'manifest.json'));
  if (manifestData) {
    combined.manifest = manifestData;
  }

  // Write the combined and minified file
  const outputPath = path.join(__dirname, 'data', 'game-data.json');
  const minifiedJson = JSON.stringify(combined);
  
  fs.writeFileSync(outputPath, minifiedJson, 'utf8');
  
  const totalFiles = roomFiles.length + objectFiles.length + 2; // +2 for spritesheet and manifest
  console.log(`✅ Combined ${roomFiles.length} rooms, ${objectFiles.length} objects, spritesheet, and manifest into game-data.json`);
  console.log(`📦 Original files: ${totalFiles} requests`);
  console.log(`📦 New file: 1 request`);
  console.log(`📊 File size: ${(Buffer.byteLength(minifiedJson, 'utf8') / 1024).toFixed(2)} KB`);
  
  return combined;
}

if (require.main === module) {
  combineJsonFiles();
}

module.exports = { combineJsonFiles };