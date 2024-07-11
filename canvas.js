var mlp;
function setup() {
  createCanvas(1920, 1080);
  let m = new MLP(3, [4, 4, 1]);

  mlp = m;

  xs = [
    [2.0, 3.0, -1.0],
    [3.0, -1.0, 0.5],
    [0.5, 1.0, 1.0],
    [1.0, 1.0, -1.0],
  ];
  ys = [1.0, -1.0, -1.0, 1.0];

  let k = 0;
  let intervalId = setInterval(() => {
    ypred = xs.map((x) => mlp.call(x));
    let loss = new Value(0);
    for (let i = 0; i < ys.length; i++) {
      loss = loss.add(ypred[i].sub(new Value(ys[i])).pow(new Value(2)));
    }

    m.parameters().forEach((p) => (p.grad = 0.0));
    loss.backprop();
    console.log(loss);
    m.parameters().forEach((p) => (p.data += -0.1 * p.grad));

    k++;
    if (k >= 20) {
      clearInterval(intervalId);
    }
  }, 500);
}

function draw() {
  background(220);
  // mlp.forEach((m) => m.draw());
  mlp.draw();
}
