const Handlebars = require('handlebars');

// Test different combinations
const tests = [
    {
        name: 'Only modelNameLower',
        template: '{{modelNameLower}}',
        data: { modelNameLower: 'users' }
    },
    {
        name: 'Only namespace',
        template: '{{namespace}}',
        data: { namespace: 'app\\test' }
    },
    {
        name: 'Both separate',
        template: '{{namespace}} and {{modelNameLower}}',
        data: { namespace: 'app\\test', modelNameLower: 'users' }
    },
    {
        name: 'Both in namespace format',
        template: '{{namespace}}\\dto\\{{modelNameLower}}',
        data: { namespace: 'app\\test', modelNameLower: 'users' }
    },
    {
        name: 'With backslashes',
        template: '{{namespace}}\\\\dto\\\\{{modelNameLower}}',
        data: { namespace: 'app\\test', modelNameLower: 'users' }
    }
];

tests.forEach(test => {
    console.log(`\n${test.name}:`);
    console.log('Template:', test.template);
    console.log('Data:', JSON.stringify(test.data, null, 2));
    
    const compiled = Handlebars.compile(test.template);
    const result = compiled(test.data);
    console.log('Result:', result);
    
    if (result.includes('{{')) {
        console.log('❌ Unresolved variables found');
    } else {
        console.log('✅ All variables resolved');
    }
});
