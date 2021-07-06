const GeodaWorkerProxy = `
var exports={};
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js", "https://unpkg.com/jsgeoda@0.2.3/lib/index.js");

class GeodaWorkerProxy {
  constructor() {
    this.geoda = null;
  } 
  /**
   * Initialize the worker with jsgeoda.
   * Populated all jsgeoda functions in the worker for exposure through Comlink.
   * @returns {Boolean} True, after loaded.
   */
  async New() {
    if (this.geoda !== null) return true;
    var wasm = await exports.New();
    this.geoda = await exports.New();
    var allFunctions = this.getAllFuncs(this.geoda);
    for (const key of allFunctions) {
      this[key] = (...args) => this.handleFunction(key, args);
    }
    return true;
  }
  
    // thanks @ https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class/31055217
  getAllFuncs(toCheck) {
    var props = [];
    var obj = toCheck;
    do {
      props = props.concat(Object.getOwnPropertyNames(obj));
    } while ((obj = Object.getPrototypeOf(obj)) && obj != Object.prototype);
  
    return props.sort().filter(function (e, i, arr) {
      if (e != arr[i + 1] && typeof toCheck[e] == "function") return true;
    });
  }
  /**
   * Pass through of readGeoJson.
   * @param {String} url The url of the geojson file to be fetched.
   * @returns {String} A unique id of the geoda object.
   * @returns {GeoJson} Fetched geodata
   */
  async loadGeoJSON(url, geoIdColumn) {
    if (this.geoda === null) await this.New();
    var response = await fetch(url);
    var responseClone = response.clone();
    var [geojsonData, ab] = await Promise.all([
      response.json(),
      responseClone.arrayBuffer(),
    ]);

    if (
      !(isNaN(+geojsonData.features[0].properties[geoIdColumn])) 
      && "number" !== typeof geojsonData.features[0].properties[geoIdColumn])
    {   
      for (var i=0; i<geojsonData.features.length; i++) {
        geojsonData.features[i].properties[geoIdColumn] = +geojsonData.features[i].properties[geoIdColumn]
      }
    }

    var id = this.readGeoJSON(ab);
    return [id, geojsonData];
  }

  /**
   * Worker functions are slightly obfuscated, so this lists out availble Prototype functions.
   * @returns {Array} List of available functions.
   */
  async listFunctions() {
    if (this.geoda === null) await this.New();
    return this.getAllFuncs(this);
  }

  handleFunction(fn, args) {
    if (["New", "loadGeoJSON", "listFunctions"].includes(fn)) {
      return this[fn](...args);
    } else {
      return this.geoda[fn](...args);
    }
  }
}

const geodaWorker = new GeodaWorkerProxy();
Comlink.expose(geodaWorker)`

exports['GeodaWorkerProxy'] = GeodaWorkerProxy