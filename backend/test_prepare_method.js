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

async function testPrepareMethod() {
    try {
        console.log('Testing prepareCreateDtoData method...');
        
        const plugin = new Yii2Plugin(config);
        
        // Test prepareCreateDtoData directly
        const dtoData = plugin.prepareCreateDtoData(testTable);
        console.log('DTO Data keys:', Object.keys(dtoData));
        console.log('modelNameLower value:', dtoData.modelNameLower);
        console.log('modelName value:', dtoData.modelName);
        console.log('namespace value:', dtoData.namespace);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testPrepareMethod();
