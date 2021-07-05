// load webassembly
// https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
import jsgeoda from './jsgeoda';
import GeoDaWasm from './geoda-proxy';
import GeodaWorkerProxy from './GeodaWorkerProxy';
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import Blob from ("cross-blob");
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
function New({
  useWorker=false
}) {
  if (useWorker){
    const blob = new Blob([
        'importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");var exports={};',
        jsgeoda.toString(), 
        GeodaWorkerProxy,
        'const geodaWorker = new GeodaWorkerProxy();Comlink.expose(geodaWorker);'
      ], 
      { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker =  new Worker(url);
    return Comlink.wrap(worker);
  } else {
    return new Promise((resolve) => {
      jsgeoda().then((wasm) => {
        // jsgeoda_wasm = wasm;
        const geoda = new GeoDaWasm(wasm);
        resolve(geoda);
      });
    });

  }
}

exports.New = New;
