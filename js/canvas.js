var schemas = [];
var organizer;
var editOrganizer;

function setup() {
  const mainCanvas = createCanvas(windowWidth, windowHeight);
  const editCanvas = createGraphics(windowWidth, windowHeight);

  organizer = new Organizer();
  editOrganizer = new EditOrganizer(editCanvas);

  let mlp = new MLP([
    new Layer(2, 3),
    new Layer(3, 2),
    new Layer(2, 1),
    new Layer(1, 5),
  ]);

  schemas.push(new Schema(mlp, mainCanvas, 300, 300));

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
  schemas.forEach((schema) => schema.draw());

  editOrganizer.draw();
}

function mousePressed() {
  if (editOrganizer.isEnabled()) return;
  schemas.forEach((schema) => schema.handlePressed());
}

function mouseReleased() {
  schemas.forEach((schema) => schema.handleReleased());
}

function doubleClicked() {
  schemas.forEach((schema) => schema.handleDoubleClicked());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  editOrganizer.resize();
}
