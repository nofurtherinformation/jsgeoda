// load webassembly
// https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
import jsgeoda from './jsgeoda';
import GeoDaWasm from './geoda-proxy';
import {GeodaWorkerProxy} from './geoda-worker';
import * as Comlink from "comlink";
// jsgeoda_wasm is a global variable that caches the return from
// initialization of libgeoda WASM module
// var jsgeoda_wasm = null;

/**
 * Create a `GeoDaWasm` instance built using WASM.
 *
 * @example
 * const jsgeoda = require('jsgeoda')
 * let geoda = await jsgeoda.New()
 *
 * @returns {Object} geoda - a GeoDaWasm instance built from WASM
 */
function New(){
  return new Promise((resolve) => {
    jsgeoda().then((wasm) => {
      // jsgeoda_wasm = wasm;
      const geoda = new GeoDaWasm(wasm);
      resolve(geoda);
    });
  });
}

function NewWorker(){
  console.log(GeodaWorkerProxy)
  const blob = new Blob([
      GeodaWorkerProxy 
    ], 
    { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const worker =  new Worker(url);
  return Comlink.wrap(worker);
}

exports.New = New;
exports.NewWorker = NewWorker;