
const { checkWhen } = require('../src/when');

test('value not matching', () => {
    expect(checkWhen('test',{value:'this'})).toBe(false);
});

test('value matching', () => {
  expect(checkWhen('test',{value:'test'})).toBe(true);
});

test('regex matching', () => {
    expect(checkWhen('test.*more',{value:'testing and more'})).toBe(true);
});

test('regex not matching', () => {
    expect(checkWhen('test.*smore',{value:'testing and more'})).toBe(false);
});

test('number matching with >', () => {
    expect(checkWhen({operator: "<", value: 5}, {value: 4, type: 'number'})).toBe(true);
});

test('number not matchin with <', () => {
    expect(checkWhen({operator: ">", value: 5}, {value: 4, type: 'number'})).toBe(false);
});

test('number matching with >=', () => {
    expect(checkWhen({operator: ">=", value: 5}, {value: 5, type: 'number'})).toBe(true);
});

test('value matching with getValue', () => {
    window.lastTest = 'test';
    expect(checkWhen('test', {source: "expression", "key": 'window.lastTest'})).toBe(true);
});

test('value not matching with getValue', () => {
    window.lastTest = 't3st';
    expect(checkWhen('test', {source: "expression", "key": 'window.lastTest'})).toBe(false);
});
