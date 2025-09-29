const Handlebars = require('handlebars');

// Simple test
const template = 'Hello {{name}}, your ID is {{id}}';
const data = { name: 'John', id: 123 };

console.log('Template:', template);
console.log('Data:', JSON.stringify(data, null, 2));

const compiled = Handlebars.compile(template);
const result = compiled(data);

console.log('Result:', result);

// Test with problematic template
const template2 = 'namespace {{namespace}}\\dto\\{{modelNameLower}};';
const data2 = { 
    namespace: 'app\\test', 
    modelNameLower: 'users' 
};

console.log('\nTemplate2:', template2);
console.log('Data2:', JSON.stringify(data2, null, 2));

const compiled2 = Handlebars.compile(template2);
const result2 = compiled2(data2);

console.log('Result2:', result2);
