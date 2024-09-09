class FunctionalLayerView extends LayerView {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.parent = null;
    this.removeButton;
    this.inputDot = null;
    this.outputDot = null;
  }

  initialize() {
    this.inputDot = new Dot(this);
    this.outputDot = new Dot(this);

    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.initializeNeurons();
    this.initializeParent();
    this.postUpdateCoordinates();
  }

  initializeParent() {
    const inactive = this instanceof IOLayer || this instanceof DigitInputGrid;
    this.parent = new MlpView(inactive);
    const parent = this.parent;
    parent.pushLayer(this);
    mainOrganizer.addMlpView(parent);
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.pushNeuron();
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  adjustNeuronNum(neuronNum) {
    const diff = neuronNum - this.getNeuronNum();
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.pushNeuron() : this.popNeuron();
    }
    this.getNeuronNum() > 4 ? this.shrink() : this.expand();
    this.setShownNeuronsNum(Math.min(this.getNeuronNum(), 4));
    this.postUpdateCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.inputDot, this.outputDot, this.removeButton, this].filter(
      Boolean,
    );
  }

  doubleClicked() {
    const allowed =
      iManager.checkRollout(this) && !editLayerOrganizer.getSelected();

    allowed && editLayerOrganizer.enable(this);
  }

  isComponent() {
    return this instanceof Component;
  }

  parentInitialized() {
    return this.parent.isInitialized();
  }

  postUpdateCoordinates() {
    this.updateNeuronsCoordinates();
    this.updateDotsCoordinates();
    this.parent.updateBorders();
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot?.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  updateButtons() {
    const button = this.removeButton;
    this.parentInitialized() ? button.hide() : button.visible();
  }

  replace(layer) {
    this.copyNeurons(layer);

    const isShrank = layer.isShrank();
    const neuronsNum = isShrank
      ? layer.getShownNeuronsNum()
      : layer.getNeuronNum();

    this[isShrank ? "shrink" : "expand"]();
    this.setShownNeuronsNum(neuronsNum);

    this.setLabel(layer.label);
    this.setActFunc(layer.actFunc);
    this.postUpdateCoordinates();
  }

  copyNeurons(from) {
    super.copyNeurons(from) && this.reconnectLayer();
  }

  reconnectLayer() {
    const { prev, next } = this.parent.getPrevAndNext(this);
    this.isolate();

    prev && prev.connectLayer(this);
    next && this.connectLayer(next);
  }

  connectLayer(targetLayer) {
    // FIXME get rid of repeated code blocks
    const isEqual = this.getNeuronNum() === targetLayer.getNeuronNum();
    if (targetLayer.isComponent() && !isEqual) {
      const newLayer = new HiddenLayer(0, 0);
      newLayer.adjustNeuronNum(targetLayer.getNeuronNum());
      this.connectLayer(newLayer);
      newLayer.connectLayer(targetLayer);
      this.parent.resetCoordinates();
      return;
    }
    if (
      (targetLayer.parentInitialized() && !this.isComponent()) ||
      this.parent == targetLayer.parent
    )
      return;

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  connectNeurons(targetLayer) {
    if (targetLayer.isComponent() || this.isComponent()) {
      this.neurons.forEach((n1, i) => {
        n1.removeLines();
        n1.addLine(new WeightlessLine(n1, targetLayer.neurons[i]));
      });
    } else {
      this.neurons.forEach((n1) => {
        n1.removeLines();
        targetLayer.neurons.forEach((n2) => {
          n1.addLine(new Line(n1, n2));
        });
      });
    }
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
  }

  getDots() {
    let dots = [];
    this.inputDot && dots.push(this.inputDot);
    this.outputDot && dots.push(this.outputDot);
    return dots;
  }

  setParent(parent) {
    this.parent = parent;
  }

  handleRemove() {
    this.isIsolated() ? this.parent.destroy() : this.isolate();
  }

  isIsolated() {
    return this.parent.layers.length == 1;
  }

  isolate() {
    const parent = this.parent;
    const { prev, next, index } = parent.getPrevAndNext(this);
    prev && prev.clearLines(this);
    next && this.clearLines(next);
    this.splitLayers(index).forEach((l) => this.createNewMlp(l));
  }

  clearLines(targetLayer) {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.outputDot.free();
    targetLayer.inputDot.free();
  }

  createNewMlp(layers) {
    if (!layers.length) return;

    const newMlp = new MlpView();
    newMlp.setLayers(layers);
    mainOrganizer.addMlpView(newMlp);
  }

  splitLayers(index) {
    const parent = this.parent;
    const layers = parent.getLayers();

    const before = layers.slice(0, index);
    const at = layers.slice(index, index + 1);
    const after = layers.slice(index + 1);

    parent.setLayers([]);
    parent.destroy();

    return [before, at, after];
  }

  clearOrigin() {}

  destroy() {
    this.parent = null;

    this.removeButton.destroy();
    this.removeButton = null;

    this.getDots().forEach((dot) => dot.destroy());
    this.inputDot = null;
    this.outputDot = null;
    super.destroy();
  }

  draw() {
    this.getDots().forEach((dot) => dot.draw());
    this.removeButton.draw();
    this.show();
    this.isShrank() && this.showInfoBox();

    this.neurons.forEach((neuron) => neuron.draw());
  }
}
