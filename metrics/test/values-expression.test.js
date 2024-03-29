import { convertValue, getValue } from "../src/values";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}

//simple expressions

test('expression string value', () => {
    window.test = 'etest';

    let metric = {source: "expression", "key": 'window.test'};
    expect(getConvertedValue(metric)).toBe('etest');
});

test('expression number value', () => {
    window.test = 5;

    let metric = {source: "expression", key: 'window.test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

test('expression with no value', () => {
    window.test = 'test';

    let metric = {source: "expression", key: 'window.nomatch_test'};
    expect(getConvertedValue(metric)).toBe(undefined);
});

//default does not apply at getValue - should we keep this?
// test('expression with default value', () => {
//     window.test = 'test';

//     const metric = {source: "expression", key: 'window.not_test', default: 'dtest'};
//     expect(getConvertedValue(metric)).toBe('dtest');
// });


// complex expressions

test('expression number value', () => {
    window.test = {foo: 'test1'};

    let metric = {source: "expression", key: 'window.test.foo'};
    expect(getConvertedValue(metric)).toBe('test1');
});

test('expression number value', () => {
    window.test = {foo: ()=>'test2'};

    let metric = {source: "expression", key: 'window.test.foo()'};
    expect(getConvertedValue(metric)).toBe('test2');
});

test('expression number value', () => {
    window.test = ()=> ({foo: 'test3'});

    let metric = {source: "expression", key: 'window.test().foo'};
    expect(getConvertedValue(metric)).toBe('test3');
});

test('expression number value', () => {
    window.test = {foo: 'test4'};

    let metric = {source: "expression", key: 'window.test.bar'};
    expect(getConvertedValue(metric)).toBe(undefined);
});


//with macros

test('expression with :at macro', () => {
    window.test = {foo: ['test4','test5']};

    let metric = {source: "expression", key: 'window.test.foo:at(1)'};
    expect(getConvertedValue(metric)).toBe('test5');
});

test('expression with :at macro', () => {
    window.test = {foo: ['test4',{bar: 'test6'}]};

    let metric = {source: "expression", key: 'window.test.foo:at(1).bar'};
    expect(getConvertedValue(metric)).toBe('test6');
});

test('expression with :join macro', () => {
    window.test = {foo: ['test4','test7']};

    let metric = {source: "expression", key: 'window.test.foo:join'};
    expect(getConvertedValue(metric)).toBe('test4|test7');
});

test('expression with :join macro with post attributes', () => {
    window.test = {foo: [{bar:'test4'},{bar:'test8'}]};

    let metric = {source: "expression", key: 'window.test.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test4|test8');
});

test('expression with :join macro and blanks', () => {
    window.test = {foo: [{bart:'test4'},{bar:'test9'}]};

    let metric = {source: "expression", key: 'window.test.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test9');
});

test('expression with nested :join macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test10'}]},{foo:[{bar:'test11'}]}];

    let metric = {source: "expression", key: 'window.test:join.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test10|test11');
});

test('expression with :join macro explicit delimeter', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test12'}]},{foo:[{bar:'test13'}]}];

    let metric = {source: "expression", key: 'window.test:join(,).foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test12,test13');
});

test('expression with :join macro multiple explicit delimeters', () => {
    window.test = [{foo: [{bar:'test4'},{bar:'test12'}]},{foo:[{bar:'test13'}]}];

    let metric = {source: "expression", key: 'window.test:join(,).foo:join(|).bar'};
    expect(getConvertedValue(metric)).toBe('test4|test12,test13');
});


test('expression with :join and :at macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test14'}]},{foo:[{bar:'test15'},{bar:'test16'}]}];

    let metric = {source: "expression", key: 'window.test:at(1).foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test15|test16');
});


test('expression with :sum macro', () => {
    window.test = {foo:[{bar:18}, {bar:19}]};

    let metric = {source: "expression", key: 'window.test.foo:sum.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(37);
});

test('expression with :sum & :at macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:at(1).foo:sum.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(41);
});


test('expression with join, :sum macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:join.foo:sum.bar'};
    expect(getConvertedValue(metric)).toBe('17|41');
});