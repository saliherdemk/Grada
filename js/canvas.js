let organizer;
let editOrganizer;
let iManager;

function setup() {
  const mainCanvas = createCanvas(windowWidth, windowHeight);
  mainCanvas.mouseWheel(scaleCanvas);

  const editCanvas = createGraphics(windowWidth, windowHeight);

  organizer = new Organizer(mainCanvas);
  editOrganizer = new EditOrganizer(editCanvas);
  iManager = new InteractionManager();

  organizer.addSchema(new Schema(300, 300));
}

function draw() {
  background(255);

  push();
  iManager.applyTransforms();
  organizer.draw();
  pop();
  editOrganizer.draw();
}

function mousePressed() {
  !editOrganizer.isEnabled() && iManager.handlePress();
}

function mouseDragged() {
  !editOrganizer.isEnabled() && iManager.handleDrag();
}

function mouseReleased() {
  iManager.handleRelease();
}

// touches[0].x, touches[0].y We don't need simultaneous touches
function touchStarted() {
  mousePressed();
}

function touchMoved() {
  mouseDragged();
}

function touchEnded() {
  mouseReleased();
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k == "e") {
    organizer.schemas.forEach((schema) => schema.handleKeyPressed());
  }
  if (k == "escape" && editOrganizer.isEnabled()) {
    editOrganizer.disable();
  }
}

function doubleClicked() {
  organizer.schemas.forEach((schema) => schema.handleDoubleClicked());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  editOrganizer.isEnabled() && editOrganizer.resize();
}
