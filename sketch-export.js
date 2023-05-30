/**
* A wrapper library for CCapture.js that helps exporting your sketch as a video
* It can also be used to record multiple variables over time and play them while exporting
* @author Luca Cattaneo <luca.cattaneo@mekit.it>
* @version 1.0.0
* @license MIT
*/

"use strict";

let sExport = {
  capturer: false,
  export: false,
  record: false,
  playback: false,
  playbackEnded: false,
  vars: {},
  storage: {},
  frameCountDelay: 0,
};

/**
 * Set the configurations for the export
 * @summary Use this function inside p5.js setup() function 
 * @param {Object} options - custom options
 * @param {Bolean} options.format - inherit from CCapture.js
 * @param {Bolean} options.verbose - inherit from CCapture.js
 * @param {Number} options.fps - export frame rate
 * @param {Function} options.onPlaybackStart - a callback fired when the playback has started
 * @param {Function} options.onPlaybackEnd - a callback fired when the playback has ended
 */
function sketchExportSetup(options){
  // Default settings
  let defaultSettings = {
    format: 'webm',
    verbose: true,
    fps: 30,
    onPlaybackStart: null,
    onPlaybackEnd: null,
  };

  if (!options) options = {};

  // Extend options
  var settings = {};
  for(var key in defaultSettings){
    if(options.hasOwnProperty(key)){
      settings[key] = options[key];
    } else {
      settings[key] = defaultSettings[key];
    }
  }
  
  if (settings.onPlaybackStart){
    sExport.onPlaybackStart = settings.onPlaybackStart;
  }
  if (settings.onPlaybackEnd){
    sExport.onPlaybackEnd = settings.onPlaybackEnd;
  }

  sExport.fps = settings.fps;
  sExport.capturer = new CCapture({
    format: settings.format,
    framerate: settings.fps,
    verbose: settings.verbose,
  })

  sketchExportReadParams();
}

/**
 * Read the url params to start the export or recording
 * Exporting example
 * ?export=true
 * Recording example
 * ?record=mouse,
 * Playing
 * ?play=mouse
 * Playing + Exporting
 * ?play=mouse&export=true
 */
function sketchExportReadParams(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  if (urlParams.get('export') == 'true'){
    sExport.export = true;
  }

  let record = urlParams.get('record');
  if (record){
    let names = record.split(',');
    names.forEach(name => {
      sExport.vars[name] = {};
      sExport.vars[name].record = true;
      sExport.storage[name] = [];
      console.debug('SketchExport: recording ' + name);
      // While recording, we can't export
      sExport.export = false;
      sExport.record = true;
    });
  }

  let play = urlParams.get('play');
  if (play){
    let names = play.split(',');
    let storage = localStorage.getItem('sketchRecordStorage');
    if (storage){
      storage = JSON.parse(storage);
      names.forEach(name => {
        sExport.vars[name] = {};
        sExport.vars[name].play = false;
        
        if (storage[name] !== undefined){
          sExport.storage[name] = storage[name];
          if (sExport.storage[name].length > 0){
            console.debug('SketchExport: playing ' + name);
            sExport.vars[name].play = true;
            sExport.playback = true;
          }
        }
        if (!sExport.vars[name].play){
          console.debug('SketchExport: missing storage; store data using ?' + name + '=record');
        }
      });
      if (sExport.playback){
        if (typeof sExport.onPlaybackStart == 'function'){
          sExport.onPlaybackStart();
        }
      }
    }
    
  }
}

// ** EXPORT **
// ------------

/**
 * Instantiate the CCapture.js capturer
 * Use this function inside draw() before sketchExport()
 */
function sketchExportStart(){
  if (!sExport.export){
    return;
  }
  sExport.capturer.start();
  console.debug('SketchExport: export started');
}

/**
 * Capture each frame of the canvas with CCapture.js
 * Use this function inside draw() after sketchExportStart()
 */
function sketchExport(){
  if (!sExport.export){
    return;
  }

  sExport.capturer.capture(canvas);
  
  if (sExport.playbackEnded){
    if (typeof sExport.onPlaybackEnd == 'function'){
      sExport.onPlaybackEnd();
    }
  }
}

/**
 * Terminate the export with CCapture.js
 * Use this function inside draw() after sketchExport()
 */
function sketchExportEnd(){
  if (!sExport.export){
    return;
  }
  sExport.capturer.save();
  sExport.capturer.stop();
  console.debug('SketchExport: export ended');
  noLoop();
}

// ** RECORDING **
// ---------------

/**
 * Use this function inside draw() to start your recording at a specific frame
 * Example
 * if (frameCount == 1){
 *   sketchExportStart();
 * }
 */
function sketchRecordStart(){
  if (!sExport.export && sExport.record){
    sExport.frameCountDelay = frameCount;
    console.debug('SketchExport: recording started');
  } 
}

/**
 * Use this function inside draw() to stop your recording at a specific frame
 * Example
 * if (frameCount == 6 * fps){
 *   sketchRecordStop();
 * }
 */
function sketchRecordStop(){
  if (!sExport.export && sExport.record){
    console.debug('SketchExport: recording stopped');
    noLoop();
    // Save all data in the storage
    if (sExport.storage){
      localStorage.setItem('sketchRecordStorage', JSON.stringify(sExport.storage));
      console.debug('SketchExport: storage saved');
    }
  }
}

/**
 * Record and get the variable value over time
 * @param {string} name - machine name to be used in the url; see sketchExportReadParams() 
 * @param {mixed} data - value to be stored
 * @returns {mixed} the original value or the playblack value during playing
 */
function sketchRecordData(name, data){
  sketchRecordDataStore(name, data);
  return sketchRecordDataGet(name, data);
}

/**
 * Record the variable value over time
 * @param {string} name - machine name
 * @param {mixed} data - value to be stored
 */
function sketchRecordDataStore(name, data){
  if (sExport.vars[name] !== undefined && !sExport.vars[name].record){
    return; 
  }
  if (sExport.vars[name] !== undefined){
    sExport.storage[name].push(data);
  }
}

/**
 * Get the variable value over time
 * @param {string} name - machine name
 * @param {mixed} data - value to be stored
 * @returns {mixed} the original value or the playblack value during playing
 */
function sketchRecordDataGet(name, data){
  if (sExport.playback && sExport.vars[name] !== undefined){
    if (sExport.storage[name][frameCount] !== undefined){
      return sExport.storage[name][frameCount];
    } else {
      sExport.playbackEnded = true;
    }
  }
  return data;
}