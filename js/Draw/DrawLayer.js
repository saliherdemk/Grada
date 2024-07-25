class DrawLayer extends Draggable {
  constructor(layer, cnv, x, y, parent) {
    super(x, y, 50, 0);
    this.parent = parent;
    this.origin = layer;
    this.canvas = cnv;
    this.yGap = 40;
    this.neurons = [];
    this.infoBox = { h: 70, y: 0, val: 0 };
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };
    this.dots = parent ? [new Dot(this, true), new Dot(this, false)] : [];
    this.button;
    this.initializeNeurons();
    !this.isCopy() && this.initializeButtons();
  }

  initializeButtons() {
    const clearButton = new CanvasButton(loadImage("broken-link.png"), () =>
      this.isolate(),
    );
    const deleteButton = new CanvasButton(loadImage("close-circle.png"), () =>
      this.destroy(),
    );
    // this.buttons.push(deleteButton);
    // this.buttons.push(clearButton);
  }

  isolate() {
    let parentLayers = this.parent.getLayers();
    if (this.dots[1].isOccupied()) {
      const targetLayer = parentLayers[parentLayers.indexOf(this) + 1];
      targetLayer.dots[0].free();
      this.splitMLp(targetLayer);
    }

    parentLayers = this.parent.getLayers();
    if (this.dots[0].isOccupied()) {
      const prevLayer = parentLayers[parentLayers.indexOf(this)];
      this.dots[0].free();
      prevLayer.splitMLp(this);
    }
  }

  initializeNeurons() {
    this.neurons = this.origin.neurons.map(
      (neuron) => new DrawNeuron(neuron, this.canvas),
    );
    this.setShownNeuronsNum(this.getNeuronNum());
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  getShownNeuronsNum() {
    return this.shownNeurons.num;
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    // this.buttons.forEach((button, i) => {
    //   const offsetX = i == 0 ? button.w - 15 : button.w / 4;
    //   const offsetY = i == 0 ? -15 : this.h;
    //   button.setCoordinates(this.x + offsetX, this.y + offsetY);
    // });
  }

  setShownNeuronsNum(shownNeuronsNum) {
    this.shownNeurons.num = shownNeuronsNum;
    this.setShownNeurons();
    editOrganizer.isEnabled && editOrganizer.setInfoText();
  }

  // GIANT MESS -> LESS GIANT MESS -> Acceptable mess
  setShownNeurons() {
    this.shownNeurons.indexes = [];
    const shownNeuronsNum = this.getShownNeuronsNum();
    const neuronNum = this.getNeuronNum();
    this.infoBox.val = neuronNum - shownNeuronsNum;

    const displayedNeuronsNum = this.parent
      ? shownNeuronsNum
      : Math.min(shownNeuronsNum, 5);
    const mid = displayedNeuronsNum / 2;

    this.neurons.forEach((neuron, i) => {
      if (i < mid || i >= neuronNum - mid) {
        neuron.visible();
        this.shownNeurons.indexes.push(i);
      } else {
        neuron.hide();
      }
    });

    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    const isShrank = this.isShrank();
    const neurons = isShrank
      ? this.shownNeurons.indexes.map((index) => this.neurons[index])
      : this.neurons;

    const neuronNum = neurons.length;
    this.h = this.yGap * (neuronNum - 1) + this.w;
    this.infoBox.y = this.y;

    const midPoint = neuronNum / 2;
    neurons.forEach((neuron, i) => {
      const afterMid = isShrank && i > midPoint;
      if (!afterMid) {
        this.infoBox.y += this.yGap;
      }
      const x = this.x + this.w / 2;
      const y = this.y + this.h / 2 + this.yGap * (i - (neuronNum - 1) / 2);

      neuron.updateCoordinates(x, y + (afterMid ? this.infoBox.h : 0));
    });

    this.h += isShrank ? this.infoBox.h : 0;
    this.dots.forEach((dot) => dot.updateCoordinates());
  }

  splitMLp(targetLayer) {
    const parentLayers = targetLayer.parent.layers;
    const splitIndex = parentLayers.indexOf(targetLayer);
    parentLayers[splitIndex - 1].clearLines();

    const newLayers = parentLayers.splice(0, splitIndex);

    const [x, y] = [newLayers[0].x, newLayers[0].y];

    // FIXME: Don't destroy and recreate, just move -> Done but not satisfying
    const newSchema = new Schema(new MLP(), organizer.getCanvas(), x, y);

    newSchema.setLayers(newLayers);
    organizer.addSchema(newSchema);
  }

  connectNeurons(targetNeurons) {
    this.neurons.forEach((n1) => {
      n1.setLines([]);
      targetNeurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
  }

  connectLayer(targetLayer) {
    if (targetLayer.dots[0].isOccupied()) {
      this.splitMLp(targetLayer);
    }

    this.connectNeurons(targetLayer.neurons);
    this.dots[1].occupy();
    targetLayer.dots[0].occupy();

    if (this.parent === targetLayer.parent) return;

    targetLayer.parent.layers.forEach((layer) => {
      this.parent.pushLayer(layer);
    });

    targetLayer.parent.destroy();
    targetLayer.parent.layers.forEach((layer) => {
      layer.parent = this.parent;
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

  replace(layer, shrank) {
    const diff = layer.getNeuronNum() - this.getNeuronNum();
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.origin.addNeuron() : this.origin.popNeuron();
    }

    this.initializeNeurons();
    this.reConnectNeurons();
    this.shrank = shrank;
    this.setShownNeuronsNum(
      shrank ? layer.getShownNeuronsNum() : layer.getNeuronNum(),
    );
    this.parent.resetCoordinates();
  }

  clearLines() {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.dots[1].free();
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
    this.neurons = [];
    this.dots.forEach((dot) => dot.destroy());
    this.dots = [];
    this.button = null;
    this.origin = null;
    this.canvas = null;

    this.parent = null;
  }

  isShrank() {
    return this.shrank || this.isCopy();
  }

  isCopy() {
    return !this.parent;
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

  handlePressed() {
    this.pressed();
    this.dots.forEach((dot) => dot.handlePressed());

    this.button.handlePressed();
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
    const infoBoxY = this.infoBox.y;
    const commands = [
      { func: "fill", args: [0] },
      { func: "textSize", args: [18] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textLeading", args: [4] },
      { func: "text", args: [`.\n.\n.\n`, this.x, infoBoxY, 50, 35] },
      {
        func: "text",
        args: [this.infoBox.val.toString(), this.x, infoBoxY + 25, 50, 35],
      },
      { func: "text", args: [`.\n.\n.\n`, this.x, infoBoxY + 45, 50, 35] },
    ];

    executeDrawingCommands(this.canvas, commands);
    this.resetP5Settings();
  }

  show() {
    const commands = [
      { func: "noFill", args: [] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "fill", args: [255] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.show();
    this.isShrank() && this.showInfoBox();

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
    this.updateCoordinates();
  }

  isOccupied() {
    return this.occupied;
  }

  occupy() {
    this.occupied = true;
  }

  free() {
    this.occupied = false;
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
    const r = this.r + (this.rollover ? 5 : 0);
    const commands = [
      { func: "fill", args: this.isOccupied() ? [0, 255, 0] : [255, 0, 0] },
      { func: "circle", args: [this.x, this.y, r, r] },
    ];

    executeDrawingCommands(this.origin.canvas, commands);
  }

  over() {
    const d = dist(mouseX, mouseY, this.x, this.y);
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

    if (activeLine.from === this) {
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
