var organizer;
var editOrganizer;

function setup() {
  const mainCanvas = createCanvas(windowWidth, windowHeight);
  const editCanvas = createGraphics(windowWidth, windowHeight);
  organizer = new Organizer(mainCanvas);
  editOrganizer = new EditOrganizer(editCanvas);

  let mlp = new MLP([
    new Layer(0, 3),
    new Layer(3, 2),
    new Layer(2, 1),
    new Layer(1, 5),
  ]);

  organizer.addSchema(new Schema(300, 300));

  // let xs = [
  //   [2.0, 3.0, -1.0],
  //   [3.0, -1.0, 0.5],
  //   [0.5, 1.0, 1.0],
  //   [1.0, 1.0, -1.0],
  // ];
  //
  // let ys = [1.0, -1.0, -1.0, 1.0];
  //
  // console.log(mlp.train(xs, ys, 20));
}

function draw() {
  background(255);

  organizer.draw();
  editOrganizer.draw();
}

function mousePressed() {
  if (editOrganizer.isEnabled()) return;
  organizer.handlePressed();
}

function touchStarted() {
  mousePressed();
}

function mouseReleased() {
  organizer.handleReleased();
}

function touchEnded() {
  mouseReleased();
}

function doubleClicked() {
  organizer.handleDoubleClicked();
}

function keyPressed() {
  if (key === "Escape") {
    editOrganizer.disable();
    organizer.setActiveLine(null);
  }
  organizer.handleKeyPressed(key);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  editOrganizer.isEnabled() && editOrganizer.resize();
}
