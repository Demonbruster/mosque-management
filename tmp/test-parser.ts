import { resolveTemplateVariables } from '../backend/src/lib/template-parser';

const mockPerson = {
  first_name: 'Zaid',
  last_name: 'Ibn Thabit',
};

const template1 = 'Assalamu Alaikum {{first_name}}! Your donation of {{amount}} is received.';
const context1 = { amount: '$50' };

const result1 = resolveTemplateVariables(template1, mockPerson, context1);
console.log('Test 1 (Named Variables):');
console.log('Result:', result1);
console.log(
  'Status:',
  result1 === 'Assalamu Alaikum Zaid! Your donation of $50 is received.' ? 'PASS' : 'FAIL',
);

const template2 = 'Hello {{1}}, your code is {{2}}.';
const context2 = { variables: ['Zaid', '12345'] };

const result2 = resolveTemplateVariables(template2, mockPerson, context2);
console.log('\nTest 2 (Indexed Variables):');
console.log('Result:', result2);
console.log('Status:', result2 === 'Hello Zaid, your code is 12345.' ? 'PASS' : 'FAIL');

const template3 = 'Testing {{unknown}} and {{first_name}}';
const result3 = resolveTemplateVariables(template3, mockPerson);
console.log('\nTest 3 (Unknown Variable):');
console.log('Result:', result3);
console.log('Status:', result3 === 'Testing {{unknown}} and Zaid' ? 'PASS' : 'FAIL');
