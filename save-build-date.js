import fs from 'fs';
import path from 'path';

const buildDate = new Date().toISOString();
const filePath = path.join(process.cwd(), 'src', 'build-date.json');

fs.writeFileSync(filePath, JSON.stringify({ buildDate }, null, 2));
console.log(`Build date saved to ${filePath}`);