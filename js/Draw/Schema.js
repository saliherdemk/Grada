class Schema extends Draggable {
  constructor(mlp, cnv, x, y) {
    super(x, y);
    this.origin = mlp;
    this.canvas = cnv;

    this.layers = [];

    this.initialize();
  }

  initialize() {
    this.layers = [];
    this.origin.layers.forEach((layer, i) => {
      const newLayer = new DrawLayer(
        layer,
        this.canvas,
        this.x + i * 100,
        this.y,
        this.id,
      );
      if (i > 0) {
        const prevLayer = this.layers[i - 1];
        prevLayer.neurons.forEach((prevNeuron) => {
          newLayer.neurons.forEach((newNeuron) => {
            prevNeuron.addLine(new Line(prevNeuron, newNeuron));
          });
        });
      }
      this.layers.push(newLayer);
    });

    this.updateBorders();
  }

  updateBorders() {
    let lastX = 0,
      firstX = width,
      firstY = height,
      lastY = 0;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    this.x = firstX - 25;
    this.y = firstY - 25;
    this.h = lastY - firstY + 50;
  }

  removeLayer(layer) {
    let index = 0;
    for (let i = 0; i < this.layers.length; i++) {
      if (i > 0 && this.layers[i] == layer) {
        this.layers[i - 1].removeLines();
      }
    }
  }

  handlePressed() {
    this.layers.forEach((layer) => {
      layer.pressed();
    });
    if (organizer.getDragActive()) return;
    this.pressed();
  }

  handleReleased() {
    this.layers.forEach((layer) => {
      layer.released();
    });
    this.released();
  }

  handleDoubleClicked() {
    this.layers.forEach((layer) => layer.doubleClicked());
  }

  show() {
    const commands = [
      { func: "fill", args: [255, 255, 255, 0.5] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }
  draw() {
    this.layers.forEach((layer) => layer.draw());
    this.show();

    !organizer.getDragActive() && this.over();

    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class DrawLayer extends Draggable {
  constructor(layer, cnv, x, y) {
    super(x, y);
    this.origin = layer;
    this.canvas = cnv;
    this.w = 50;
    this.yGap = 40;
    this.h = this.yGap * (layer.neurons.length - 1) + 50;
    this.neurons = [];
    layer.neurons.forEach((neuron) => {
      this.neurons.push(new DrawNeuron(neuron, cnv));
    });

    this.y = y - this.h / 2;

    this.updateNeuronsCoordinates();
  }

  pushNeuron(nin = -1) {
    const hasNeighbor = nin === -1;
    const neuronInputSize = hasNeighbor
      ? this.neurons[0].origin.origin.w.length // This is just gets neighbors neuron inputSize
      : nin;
    const newNeuron = new Neuron(neuronInputSize);
    this.neurons.push(new DrawNeuron(newNeuron, this.canvas));
    this.updateNeuronsCoordinates();
  }

  popNeuron() {
    this.neurons.pop();
    this.updateNeuronsCoordinates();
  }

  setNeurons(neurons) {
    this.neurons = neurons;
    this.updateNeuronsCoordinates();
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  removeLines() {
    this.neurons.forEach((neuron) => (neuron.lines = []));
  }

  updateNeuronsCoordinates() {
    const neuronNum = this.neurons.length;
    this.h = this.yGap * (neuronNum - 1) + 50;

    let index = 0;
    this.neurons.forEach((neuron) => {
      const x = this.x + this.w / 2;
      const y = this.y + this.h / 2 + this.yGap * (index - (neuronNum - 1) / 2);

      if (index == Math.floor(neuronNum / 2)) {
        this.infoBoxY = y;
      }
      neuron.updateCoordinates(x, y);
      index++;
    });
  }

  show() {
    let commands = [
      { func: "noFill", args: [] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "fill", args: [255] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.show();
    this.neurons.forEach((neuron) => neuron.draw());

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class DrawNeuron {
  constructor(neuron, cnv, x, y) {
    this.origin = neuron;
    this.canvas = cnv;
    this.x = x;
    this.y = y;
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    const commands = [
      { func: "circle", args: [this.x, this.y, 25, 25] },
      { func: "fill", args: [0] },
      {
        func: "text",
        args: [this.output?.data.toFixed(2), this.x + 30, this.y],
      },
      {
        func: "text",
        args: [this.output?.grad.toFixed(2), this.x + 30, this.y + 25],
      },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.lines.forEach((line) => line.draw());
    this.show();
  }
}

class Line {
  constructor(fromNeuron, toNeuron) {
    this.from = fromNeuron;
    this.to = toNeuron;
  }

  show() {
    line(this.from.x, this.from.y, this.to.x, this.to.y);
  }

  draw() {
    this.show();
  }
}
