class DrawLayer extends Draggable {
  constructor(x, y, parent, cnv) {
    super(x, y, 50, 0);
    this.parent = parent;
    this.canvas = cnv;
    this.neurons = [];
    this.yGap = 40;
    this.infoBox = { h: 70, y: 0, val: 0 };
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };
    this.dots = parent ? [new Dot(this, true), new Dot(this, false)] : [];
    this.button;
    this.initializeNeurons();
    !this.isCopy() && this.initializeButton();
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.neurons.push(new DrawNeuron(this.canvas));
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  initializeButton() {
    this.button = new CanvasButton(loadImage("delete-icon.png"), () =>
      this.handleRemove(),
    );
    this.updateButtonCoordinates();
  }

  updateButtonCoordinates() {
    this.button.setCoordinates(this.x + this.button.w / 4, this.y + this.h);
  }

  isShrank() {
    return this.shrank || this.isCopy();
  }

  isCopy() {
    return !this.parent;
  }

  pushNeuron() {
    this.neurons.push(new DrawNeuron(this.canvas));
  }

  popNeuron() {
    this.neurons.pop();
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  getShownNeuronsNum() {
    return this.shownNeurons.num;
  }

  setCoordinates(x, y) {
    this.button?.setCoordinates(x + this.button.w / 4, y + this.h);
    this.x = x;
    this.y = y;
  }

  handleRemove() {
    if (this.isIsolated()) {
      this.destroy();
      return;
    }
    this.isolate();
  }

  isIsolated() {
    return this.parent.layers.length == 1;
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

  setShownNeuronsNum(shownNeuronsNum) {
    this.shownNeurons.num = this.isShrank()
      ? shownNeuronsNum
      : this.getNeuronNum();
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

    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      if (i < mid || i >= neuronNum - mid) {
        neuron.visible();
        this.shownNeurons.indexes.push(i);
        continue;
      }
      neuron.hide();
    }
    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    const isShrank = this.isShrank();
    const neurons = this.shownNeurons.indexes.map((i) => this.neurons[i]);

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

  reconnectNeurons() {
    const layers = this.parent.layers;
    const index = layers.indexOf(this);
    const prev = layers[index - 1];
    const next = layers[index + 1];

    if (prev) {
      prev.connectNeurons(this);
    }
    if (next) {
      this.connectNeurons(next);
    }
    this.updateButtonCoordinates();
    this.parent.updateBorders();
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1) => {
      n1.setLines([]);
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.dots[1].occupy();
    targetLayer.dots[0].occupy();
  }

  connectLayer(targetLayer) {
    if (this.parent === targetLayer.parent) return;

    if (targetLayer.dots[0].isOccupied()) {
      this.splitMLp(targetLayer);
    }

    this.connectNeurons(targetLayer);

    targetLayer.parent.layers.forEach((layer) => {
      this.parent.pushLayer(layer);
    });

    targetLayer.parent.destroy();
    targetLayer.parent.layers.forEach((layer) => {
      layer.parent = this.parent;
    });
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
    this.canvas = null;
    this.parent = null;
  }

  handlePressed() {
    this.pressed();
    this.dots.forEach((dot) => dot.handlePressed());
    this.button.handlePressed();
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
      { func: "fill", args: [255] },
    ];

    executeDrawingCommands(this.canvas, commands);
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
    this.button?.draw();
    !organizer.getDragActive() && this.over();

    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class Dot {
  constructor(parent, isInput) {
    this.parent = parent;
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
    this.parent.button.changeImg(organizer.getImageByKey("brokenLink"));
  }

  free() {
    this.occupied = false;
    const allFree = this.parent.dots.every((d) => !d.isOccupied());

    allFree && this.parent.button.changeImg(organizer.getImageByKey("delete"));
  }

  destroy() {
    this.parent = null;
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = this.isInput ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const commands = [
      { func: "fill", args: this.isOccupied() ? [0, 255, 0] : [255, 0, 0] },
      { func: "circle", args: [this.x, this.y, r, r] },
    ];

    executeDrawingCommands(this.parent.canvas, commands);
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

    const layer1 = activeLine.from.parent;
    const layer2 = this.parent;
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
