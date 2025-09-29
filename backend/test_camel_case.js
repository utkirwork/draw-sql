const { Yii2Plugin } = require('./dist/plugins/Yii2Plugin');

const plugin = new Yii2Plugin({});

console.log('Testing toCamelCase method:');
console.log('users ->', plugin.toCamelCase('users'));
console.log('user_profiles ->', plugin.toCamelCase('user_profiles'));
console.log('user-profiles ->', plugin.toCamelCase('user-profiles'));

console.log('\nTesting toPascalCase method:');
console.log('users ->', plugin.toPascalCase('users'));
console.log('user_profiles ->', plugin.toPascalCase('user_profiles'));
console.log('user-profiles ->', plugin.toPascalCase('user-profiles'));
