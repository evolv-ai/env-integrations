
import { processConfig } from "../src/metrics";


test('simple test', () => {
  window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

  expect(processConfig({apply:[]}));
});

// test('simple test with polling', () => {
//   window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

//   expect(processConfig({apply:[]}));
// });

// test('op-async test', () => {
//   window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

//   expect(processConfig({apply:[]}));
// });

//need to define how we use mutate and collect for this test
// test('dom test', () => {
//   window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

//   expect(processConfig({apply:[]}));
// });
