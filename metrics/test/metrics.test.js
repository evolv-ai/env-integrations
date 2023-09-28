
import { processConfig } from "../src/metrics";


test('empty config', () => {
  window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

  expect(processConfig({apply:[]}));
});

// test('single metric config', () => {
//     window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;
  
//     expect(processConfig({apply:[]}));
//   });


// test('multiple metric config', () => {
// window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

// expect(processConfig({apply:[]}));
// });