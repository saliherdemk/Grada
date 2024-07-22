class DrawLayer extends Draggable {
  constructor(layer, cnv, x, y, parent) {
    super(x, y);
    this.parent = parent;
    this.origin = layer;
    this.canvas = cnv;
    this.w = 50;
    this.yGap = 40;
    this.h = this.yGap * (layer.neurons.length - 1) + 50;
    this.y = y - this.h / 2;
    this.neurons = [];
    this.initializeNeurons();

    this.dots = [new Dot(this, true), new Dot(this, false)];
  }

  initializeNeurons() {
    this.neurons = [];
    this.origin.neurons.forEach((neuron) => {
      this.neurons.push(new DrawNeuron(neuron, this.canvas));
    });

    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    const neuronNum = this.getNeuronNum();
    this.h = this.yGap * (neuronNum - 1) + this.w;

    let index = 0;
    this.neurons.forEach((neuron) => {
      const x = this.x + this.w / 2;
      const y = this.y + this.h / 2 + this.yGap * (index - (neuronNum - 1) / 2);

      neuron.updateCoordinates(x, y);
      index++;
    });

    this.dots?.forEach((dot) => dot.updateCoordinates());
  }

  connectNeurons(targetNeurons) {
    this.neurons.forEach((n1) => {
      n1.setLines([]);
      targetNeurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
  }

  splitMLp(targetLayer) {
    const parentLayers = targetLayer.parent.layers;
    const splitIndex = parentLayers.indexOf(targetLayer);
    const newLayers = parentLayers.splice(0, splitIndex);
    const [x, y] = [newLayers[0].x, newLayers[0].y];

    const newMlp = new MLP();
    newLayers.forEach((layer) => {
      newMlp.addLayer(layer.origin);
      layer.destroy();
    });

    const newSchema = new Schema(newMlp, organizer.getCanvas(), x, y);
    organizer.addSchema(newSchema);
  }

  connectLayer(targetLayer) {
    if (targetLayer.dots[0].isOccupied()) {
      this.splitMLp(targetLayer);
    }

    this.connectNeurons(targetLayer.neurons);
    this.dots[1].occupy();
    targetLayer.dots[0].occupy();

    const targetParent = targetLayer.parent;
    const parent = this.parent;
    if (parent == targetParent) return;

    targetParent.layers.forEach((l) => {
      parent.pushLayer(l);
    });

    targetParent.destroy();
    targetParent.layers.forEach((l) => {
      l.parent = parent;
    });
    targetLayer.origin.changeNin(this.getNeuronNum());
  }

  reConnectNeurons() {
    const layers = this.parent.layers;
    const index = layers.indexOf(this);
    const prev = layers[index - 1];
    const next = layers[index + 1];

    if (prev) {
      prev.connectNeurons(this.neurons);
      this.origin.changeNin(prev.getNeuronNum());
    }
    if (next) {
      this.connectNeurons(next.neurons);
      next.origin.changeNin(this.getNeuronNum());
    }

    this.parent.updateBorders();
  }

  replace(layer) {
    let diff = layer.getNeuronNum() - this.getNeuronNum();
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.origin.addNeuron() : this.origin.popNeuron();
    }

    this.initializeNeurons();
    this.reConnectNeurons();
    this.parent.resetCoordinates();
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
    this.neurons = [];

    this.dots.forEach((dot) => dot.destroy());
    this.dots = [];

    this.origin = null;
    this.canvas = null;
  }

  pushNeuron() {
    const neuronInputSize = this.neurons[0].origin.lines.length; // This is just gets neighbors neuron inputSize
    const newNeuron = new Neuron(neuronInputSize);
    this.neurons.push(new DrawNeuron(newNeuron, this.canvas));
  }

  popNeuron() {
    this.neurons.pop();
  }

  setNeurons(neurons) {
    this.neurons = neurons;
    this.updateNeuronsCoordinates();
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  handlePressed() {
    this.pressed();
    this.dots.forEach((dot) => dot.handlePressed());
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

    this.dots.forEach((dot) => dot.draw());
    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class Dot {
  constructor(parent, isInput) {
    this.origin = parent;
    this.isInput = isInput;
    this.rollover = false;
    this.occupied = false;
    this.r = 12;
    this.x = this.isInput ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  isOccupied() {
    return this.occupied;
  }

  occupy() {
    this.occupied = true;
  }
  destroy() {
    this.origin = null;
  }

  updateCoordinates() {
    const parent = this.origin;
    this.x = this.isInput ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  show() {
    let r = this.r + (this.rollover ? 5 : 0);
    let commands = [
      { func: "fill", args: this.isOccupied() ? [0, 255, 0] : [255, 0, 0] },
      { func: "circle", args: [this.x, this.y, r, r] },
    ];

    executeDrawingCommands(parent.canvas, commands);
  }

  over() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    this.rollover = d < this.r / 2;
  }

  combineSchemas() {
    const activeLine = organizer.getActiveLine();

    if (!activeLine || !activeLine.from) {
      return;
    }

    const layer1 = activeLine.from.origin;
    const layer2 = this.origin;

    const [majorLayer, minorLayer] = this.isInput
      ? [layer1, layer2]
      : [layer2, layer1];

    majorLayer.connectLayer(minorLayer);

    organizer.setActiveLine(null);
  }

  handlePressed() {
    if (!this.rollover) return;

    const activeLine = organizer.getActiveLine();

    if (!activeLine) {
      organizer.setActiveLine(new Line(this, null, true));
      return;
    }

    if (activeLine.from == this) {
      organizer.setActiveLine(null);
    } else {
      this.combineSchemas();
    }
  }

  draw() {
    this.show();
    this.over();
  }
}
