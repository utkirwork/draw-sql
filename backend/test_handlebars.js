const Handlebars = require('handlebars');

// Test template
const template = 'namespace {{namespace}}\\dto\\{{modelNameLower}};';

// Test data
const data = {
    namespace: 'app\\test',
    modelNameLower: 'users'
};

console.log('Template:', template);
console.log('Data:', JSON.stringify(data, null, 2));

try {
    const compiled = Handlebars.compile(template);
    const result = compiled(data);
    console.log('Result:', result);
    
    if (result.includes('{{')) {
        console.log('❌ Found unresolved variables');
    } else {
        console.log('✅ All variables resolved');
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}

