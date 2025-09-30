const { Yii2Plugin } = require('./dist/plugins/Yii2Plugin');

// Test data
const testTables = [
    {
        id: 'users',
        name: 'users',
        x: 100,
        y: 100,
        columns: [
            {
                id: 'id',
                name: 'id',
                type: 'INTEGER',
                primaryKey: true,
                autoIncrement: true
            },
            {
                id: 'name',
                name: 'name',
                type: 'VARCHAR(255)',
                nullable: false
            },
            {
                id: 'email',
                name: 'email',
                type: 'VARCHAR(255)',
                nullable: false
            }
        ],
        relationships: []
    }
];

const config = {
    namespace: 'app\\test',
    outputPath: './test_output_new'
};

async function testTemplateVariables() {
    try {
        console.log('Testing template variables...');
        
        const plugin = new Yii2Plugin(config);
        const files = await plugin.generateFiles(testTables);
        
        // Check for unresolved template variables
        const problematicFiles = files.filter(file => 
            file.content.includes('{{modelNameLower}}') ||
            file.content.includes('{{modelName}}') ||
            file.content.includes('{{namespace}}')
        );
        
        if (problematicFiles.length > 0) {
            console.log('\n❌ Found files with unresolved template variables:');
            problematicFiles.forEach(file => {
                const unresolved = [];
                if (file.content.includes('{{modelNameLower}}')) unresolved.push('{{modelNameLower}}');
                if (file.content.includes('{{modelName}}')) unresolved.push('{{modelName}}');
                if (file.content.includes('{{namespace}}')) unresolved.push('{{namespace}}');
                
                console.log(`- ${file.path}${file.filename}: ${unresolved.join(', ')}`);
            });
        } else {
            console.log('\n✅ All template variables resolved correctly!');
        }
        
        console.log(`\nGenerated ${files.length} files total.`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testTemplateVariables();

