const fs = require('fs');
const path = require('path');
const BrandingManager = require('../src/brand/BrandingManager');

const rootPath = path.join(__dirname, '..');
const branding = new BrandingManager(process.env, { rootPath });
const errors = branding.validate();

for (const file of [
    'src/brand/kurau.theme.json',
    'src/brand/kurau.persona.json',
    'src/brand/locales/es.json',
    'locales/es.json',
]) {
    try {
        JSON.parse(fs.readFileSync(path.join(rootPath, file), 'utf8'));
    } catch (error) {
        errors.push(`${file}: ${error.message}`);
    }
}

if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
}

console.log('kurau validation passed');
