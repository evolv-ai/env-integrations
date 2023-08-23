// import JSDOMEnvironment from "jest-environment-jsdom";
import { applyMap, convertValue, getValue } from "../src/values";

// const jsdom = JSDOMEnvironment;

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}


// source retrievals

test('explicit value', () => {
    let metric = {value: 'test'};
    expect(getConvertedValue(metric)).toBe('test');
});

test('explicit value', () => {
    let metric = {value: 5, type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

//expressions source
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

// test('expression with default value', () => {
//     window.test = 'test';

//     let metric = {source: "expression", key: 'window.nomatch_test', default: 'dtest'};
//     expect(getConvertedValue(metric)).toBe('dtest');
// });


//localStorage source
test('localStorage string value', () => {
    window.localStorage.setItem('test', 'ltest');

    let metric = {source: "localStorage", "key": 'test'};
    expect(getConvertedValue(metric)).toBe('ltest');
});

test('localStorage number value', () => {
    window.localStorage.setItem('test', 5);

    let metric = {source: "localStorage", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

test('localStorage boolean value', () => {
    window.localStorage.setItem('test', true);

    let metric = {source: "localStorage", "key": 'test', type: 'boolean'};
    expect(getConvertedValue(metric)).toBe(true);
});

test('localStorage boolean false value', () => {
    window.localStorage.setItem('test', false);

    let metric = {source: "localStorage", "key": 'test', type: 'boolean'};
    expect(getConvertedValue(metric)).toBe(false);
});

//sessionStorage source
test('sessionStorage string value', () => {
    window.sessionStorage.setItem('test', 'stest');

    let metric = {source: "sessionStorage", "key": 'test'};
    expect(getConvertedValue(metric)).toBe('stest');
});

test('sessionStorage number value', () => {
    window.sessionStorage.setItem('test', 5);

    let metric = {source: "sessionStorage", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});


//cookie source
test('cookie string value', () => {
    window.document.cookie = 'test=ctest'

    let metric = {source: "cookie", "key": 'test', type: 'string'};
    expect(getConvertedValue(metric)).toBe('ctest');
});

test('cookie number value', () => {
    window.document.cookie = 'test=5'

    let metric = {source: "cookie", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});


//query source
test('query string value', () => {
    delete window.location;
    window.location = {href: 'http://localhost/?test=qtest#hash'};

    let metric = {source: "query", "key": 'test', type: 'string'};
    expect(getConvertedValue(metric)).toBe('qtest');
});

test('query number value', () => {
    delete window.location;
    window.location = {href: 'http://localhost/?test=5#hash'};
    
    let metric = {source: "query", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

//dom source
test('dom extract string value', () => {
    window.document.body.innerHTML = `<div class="test">dtest</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'string', extract: {attribute:"textContent"}};
    expect(getConvertedValue(metric, target)).toBe('dtest');
});

test('dom extract number value', () => {
    window.document.body.innerHTML = `<div class="test">tes5</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'number', extract: {attribute:"textContent"}};
    expect(getConvertedValue(metric,target)).toBe(5);
});

test('dom extract number value with parse', () => {
    window.document.body.innerHTML = `<div class="test">3test5</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'number', extract: {attribute:"textContent", parse:'test(.*)'}};
    expect(getConvertedValue(metric,target)).toBe(5);
});


//with maps

test('map first', () => {
    let metric = {source: 'expression', "key": "test", map:[
        {when: "test", value: "first"}
    ]};
    expect(applyMap('test',metric)).toBe('first');
});

test('map second', () => {
    let metric = {value: 'test', map:[
        {when: "testmore", value: "first"},
        {when: "test", value: "second"}
    ]};
    expect(applyMap('test', metric)).toBe('second');
});

test('map no match', () => {
    let metric = {value: 'test', map:[
        {when: "testnot", value: "first"}
    ]};
    expect(applyMap('test', metric)).toBe(undefined);
});

test('map no match, but with default', () => {
    let metric = {default: 'dtest', map:[
        {when: "testnot", value: "first"}
    ]};
    expect(applyMap('test', metric)).toBe('dtest');
});


test('map to number', () => {
    let metric = {value: 'test',  map:[
        {when: "test", value: 5}
    ]};
    expect(applyMap('test', metric)).toBe(5);
});

// not supported yet
// test('map from number', () => {
//     let metric = {type: 'number', map:[
//         {when: {operator: '>=', value: 5}, value: "first"}
//     ]};
//     expect(applyMap(5, metric)).toBe('first');
// });
