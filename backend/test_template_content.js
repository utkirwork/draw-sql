const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templatePath = path.join(__dirname, 'dist/templates/yii2/create-dto.hbs');
const templateContent = fs.readFileSync(templatePath, 'utf-8');

console.log('Template content (first 200 chars):');
console.log(templateContent.substring(0, 200));

console.log('\nLooking for {{modelNameLower}}:');
if (templateContent.includes('{{modelNameLower}}')) {
    console.log('✅ Found {{modelNameLower}} in template');
} else {
    console.log('❌ {{modelNameLower}} not found in template');
}

// Test compilation
try {
    const compiled = Handlebars.compile(templateContent);
    console.log('\n✅ Template compiled successfully');
} catch (error) {
    console.log('\n❌ Template compilation failed:', error.message);
}
