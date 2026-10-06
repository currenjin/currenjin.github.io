#!/usr/bin/env node
// Compatibility entry for the historical public path and CLI.
// Internal callers use scripts/generation/generate-data.js.
const { generateData } = require('./scripts/generation/generate-data.js');
if (require.main === module) generateData();
