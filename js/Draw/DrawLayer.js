class DrawLayer extends Draggable {
  constructor(layer, cnv, x, y, parent) {
    super(x, y);
    this.parent = parent;
    this.origin = layer;
    this.canvas = cnv;
    this.w = 50;
    this.yGap = 40;
    this.h = 0;
    this.y = y - this.h / 2;
    this.neurons = [];
    this.shownNeuronsIndexes = [];
    this.shownNeuronsNum = 0;
    this.shrinked = false;
    this.infoBoxH = 70;
    this.infoBoxY = 0;
    this.infoBoxLabel = this.getNeuronNum() - this.getShownNeuronNum();
    this.initializeNeurons();

    this.dots = [new Dot(this, true), new Dot(this, false)];
  }

  getShownNeuronNum() {
    return this.shownNeuronsNum;
  }

  // GIANT MESS
  shrink() {
    const shownNeuronsNum = getElementById("set-shown-neuron").value;
    this.shownNeuronsNum = shownNeuronsNum;
    const neuronNum = this.getNeuronNum();
    if (neuronNum < 3 || shownNeuronsNum == neuronNum) {
      this.expand();
      return;
    }
    this.infoBoxLabel = this.getNeuronNum() - this.getShownNeuronNum();

    if (shownNeuronsNum > 5) {
      return;
    }

    this.expand();
    const neurons = this.neurons;

    const mid = shownNeuronsNum / 2;
    for (let i = 0; i < neuronNum; i++) {
      if (!(i < mid || i >= neuronNum - mid)) {
        neurons[i].hide();
        continue;
      }

      this.shownNeuronsIndexes.push(i);
    }

    this.infoBoxLabel = this.getNeuronNum() - this.getShownNeuronNum();
    this.shrinked = true;
    this.updateNeuronsCoordinates();
  }

  expand() {
    this.neurons.forEach((n) => n.visible());
    this.shownNeuronsIndexes = [];
    this.shrinked = false;
    this.updateNeuronsCoordinates();
  }

  isShrinked() {
    return this.shrinked;
  }

  initializeNeurons() {
    this.neurons = [];
    this.origin.neurons.forEach((neuron) => {
      this.neurons.push(new DrawNeuron(neuron, this.canvas));
    });

    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    const isShrinked = this.isShrinked();
    const neurons = isShrinked
      ? this.shownNeuronsIndexes.map((index) => this.neurons[index])
      : this.neurons;

    const neuronNum = neurons.length;
    this.h = this.yGap * (neuronNum - 1) + this.w;
    this.infoBoxY = this.y;

    const midPoint = neuronNum / 2;
    neurons.forEach((neuron, i) => {
      const afterMid = isShrinked && i > midPoint;
      if (!afterMid) {
        this.infoBoxY += this.yGap;
      }
      const x = this.x + this.w / 2;
      const y = this.y + this.h / 2 + this.yGap * (i - (neuronNum - 1) / 2);

      neuron.updateCoordinates(x, y + (afterMid ? this.infoBoxH : 0));
    });
    this.h += isShrinked ? this.infoBoxH : 0;
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

  resetP5Settings() {
    const commands = [
      { func: "textSize", args: [12] },
      { func: "textAlign", args: [LEFT, BASELINE] },
      { func: "textLeading", args: [15] },
      { func: "fill", args: [255] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  showInfoBox() {
    const commands = [
      { func: "fill", args: [0] },
      { func: "textSize", args: [18] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textLeading", args: [4] },
      { func: "text", args: [`.\n.\n.\n`, this.x, this.infoBoxY, 50, 35] },
      {
        func: "text",
        args: [
          this.infoBoxLabel.toString(),
          this.x,
          this.infoBoxY + 25,
          50,
          35,
        ],
      },
      { func: "text", args: [`.\n.\n.\n`, this.x, this.infoBoxY + 45, 50, 35] },
    ];

    executeDrawingCommands(this.canvas, commands);
    this.resetP5Settings();
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
    this.isShrinked() && this.showInfoBox();
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
