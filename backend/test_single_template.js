const { Yii2Plugin } = require('./dist/plugins/Yii2Plugin');

// Test data
const testTable = {
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
        }
    ],
    relationships: []
};

const config = {
    namespace: 'app\\test',
    outputPath: './test_output_new'
};

async function testSingleTemplate() {
    try {
        console.log('Testing single template...');
        
        const plugin = new Yii2Plugin(config);
        
        // Test prepareCreateDtoData
        const dtoData = plugin.prepareCreateDtoData(testTable);
        console.log('DTO Data:', JSON.stringify(dtoData, null, 2));
        
        // Test template rendering
        const dtoContent = plugin.templateEngine.render('create-dto', dtoData);
        console.log('\nDTO Content:');
        console.log(dtoContent.substring(0, 500) + '...');
        
        // Check for unresolved variables
        if (dtoContent.includes('{{')) {
            console.log('\n❌ Found unresolved variables in DTO template');
        } else {
            console.log('\n✅ All variables resolved in DTO template');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSingleTemplate();

