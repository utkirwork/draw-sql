const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Load template
const templatePath = path.join(__dirname, 'dist/templates/yii2/create-dto.hbs');
const templateContent = fs.readFileSync(templatePath, 'utf-8');
const compiled = Handlebars.compile(templateContent);

// Test data
const data = {
    namespace: 'app\\test',
    modelName: 'Users',
    modelNameLower: 'users',
    columns: [
        {
            name: 'id',
            primaryKey: true,
            isTimestamp: false
        },
        {
            name: 'name',
            primaryKey: false,
            isTimestamp: false
        }
    ],
    hasStatus: false
};

console.log('Data:', JSON.stringify(data, null, 2));

try {
    const result = compiled(data);
    console.log('\nResult (first 300 chars):');
    console.log(result.substring(0, 300));
    
    if (result.includes('{{modelNameLower}}')) {
        console.log('\n❌ Found unresolved {{modelNameLower}}');
    } else {
        console.log('\n✅ All variables resolved');
    }
    
} catch (error) {
    console.error('❌ Render failed:', error.message);
}




