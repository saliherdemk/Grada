var organizer;
var editOrganizer;
var iManager;

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

  iManager.applyTransforms();
  organizer.draw();
  editOrganizer.draw();
}

function mousePressed() {
  handlePress(mouseX, mouseY);
}

function mouseDragged() {
  handleDrag(mouseX, mouseY);
}

function mousePressed() {
  handlePress(mouseX, mouseY);
}

function mouseDragged() {
  handleDrag(mouseX, mouseY);
}

function mouseReleased() {
  handleRelease();
}

function touchStarted() {
  handlePress(touches[0].x, touches[0].y);
  return false;
}

function touchMoved() {
  handleDrag(touches[0].x, touches[0].y);
  return false;
}

function touchEnded() {
  handleRelease();
  return false;
}

function handlePress(x, y) {
  iManager.handlePress(x, y);
}

function handleDrag(x, y) {
  iManager.handleDrag(x, y);
}

function handleRelease() {
  iManager.handleRelease();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  editOrganizer.isEnabled() && editOrganizer.resize();
}
