var mlps = [];

function setup() {
  createCanvas(1920, 1080);

  mlps.push(new MLP(4, [3, 5, 1], 600, 100));
  // mlps.push(new MLP(3, [3, 2, 1], 500, 300));

  // xs = [
  //   [2.0, 3.0, -1.0],
  //   [3.0, -1.0, 0.5],
  //   [0.5, 1.0, 1.0],
  //   [1.0, 1.0, -1.0],
  // ];
  // ys = [1.0, -1.0, -1.0, 1.0];
  //
  // let k = 0;
  // let intervalId = setInterval(() => {
  //   ypred = xs.map((x) => mlp.call(x));
  //   let loss = new Value(0);
  //   for (let i = 0; i < ys.length; i++) {
  //     loss = loss.add(ypred[i].sub(new Value(ys[i])).pow(new Value(2)));
  //   }
  //
  //   m.parameters().forEach((p) => (p.grad = 0.0));
  //   loss.backprop();
  //   m.parameters().forEach((p) => (p.data += -0.1 * p.grad));
  //
  //   k++;
  //   if (k >= 20) {
  //     clearInterval(intervalId);
  //   }
  // }, 500);
}

function draw() {
  background(220);
  mlps.forEach((m) => m.draw());
}

function mousePressed() {
  mlps.forEach((mlp) => mlp.handlePressed());
}

function mouseReleased() {
  mlps.forEach((mlp) => mlp.handleReleased());
}
