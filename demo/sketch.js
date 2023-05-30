let fps = 30;

function setup() {
  createCanvas(400, 400);
  frameRate(fps);

  sketchExportSetup({
    fps: fps
  })
}

function draw() {
  background(0);
  fill(255);
  rectMode(CENTER);
  translate(200, 200);
  rotate(frameCount / fps * TWO_PI * 0.5);
  rect(0, 0, 300, 30);

  // Start the export
  if (frameCount == 1){
    sketchExportStart();
  }
  // Capture the frame
  sketchExport();
  // Stop the export after 2 seconds
  if (frameCount == 2 * fps){
    sketchExportEnd();
  }
}