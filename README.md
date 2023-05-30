# p5.js Sketch Export

This wrapper can help you export your [p5.js](https://p5js.org/) sketch using [CCapture.js](https://github.com/spite/ccapture.js/) library.

## Setup

Load CCapture and sketch-export in your project.

```html
<script src="CCapture.all.min.js"></script>
<script src="sketch-export.js"></script>
<script src="sketch.js"></script>
```

Inside `sketch.js`, use `sketchExportSetup()` to instantiate the exporter and set the framerate equal to the sketch framerate.

```js

let fps = 30;

function setup() {
  createCanvas(1080, 1080);
  frameRate(fps);
  sketchExportSetup({
    fps: fps
  })
}
```

A the end of `draw()` use this pattern:

```js
function draw() {
  // Your visual here

  // Start the export
  if (frameCount == 1){
    sketchExportStart();
  }
  // Capture the frame
  sketchExport();
  // Stop the export after 6 seconds
  if (frameCount == 6 * fps){
    sketchExportEnd();
  }
}
```

The sketch is now ready to be exported.

## Export the sketch

To start the export, add `?export=true` to the url.

```
http://127.0.0.1:5500/demo/?export=true
```

Open the browser console to see the export progress.

## Record interactions

TBD
