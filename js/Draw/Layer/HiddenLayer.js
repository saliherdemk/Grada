class HiddenLayer extends FunctionalLayerView {
  constructor(x, y) {
    super(x, y, 55, 0);
    this.parent = null;
    this.origin = null;
    this.actFunc = "";
    this.initialize();
  }

  initialize() {
    this.initializeParent();
    this.postUpdateCoordinates();
  }

  initializeParent() {
    this.parent = new MlpView();
    const parent = this.parent;
    parent.pushLayer(this);
    mainOrganizer.addMlpView(parent);
  }

  updateButtons() {
    const button = this.removeButton;
    this.parentInitialized() ? button.hide() : button.visible();
  }

  replace(layer) {
    this.adjustNeuronNum(layer.getNeuronNum());

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

  adjustNeuronNum(from) {
    super.adjustNeuronNum(from) && this.reconnectLayer();
    this.setShownNeuronsNum(this.getNeuronNum()); // FIXME potantiel bug
  }

  reconnectLayer() {
    const { prev, next } = this.parent.getPrevAndNext(this);
    this.isolate();

    prev && prev.connectLayer(this);
    next && this.connectLayer(next);
  }

  connectLayer(targetLayer) {
    if (this.parent == targetLayer.parent) return;

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1) => {
      n1.removeLines();
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
  }

  handleRemove() {
    this.isIsolated() ? this.parent.destroy() : this.isolate();
  }

  isIsolated() {
    return this.parent.layers.length == 1 && !this.parent.inputComponent;
  }

  isolate() {
    const parent = this.parent;
    const { prev, next, index } = parent.getPrevAndNext(this);
    console.log(prev);

    if (prev) {
      prev.clearLines(this);
    } else {
      parent.getInput()?.clearLines();
    }
    next && this.clearLines(next);
    this.splitLayers(index).forEach((l) => this.createNewMlp(l));
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

  createNewMlp(layers) {
    if (!layers.length) return;

    const newMlp = new MlpView();
    newMlp.setLayers(layers);
    mainOrganizer.addMlpView(newMlp);
  }

  setParent(parent) {
    this.parent = parent;
  }

  parentInitialized() {
    return this.parent.isInitialized();
  }

  postUpdateCoordinates() {
    super.postUpdateCoordinates();
    this.parent.updateBorders();
  }

  updateButtons() {
    const button = this.removeButton;
    this.parentInitialized() ? button.hide() : button.visible();
  }

  clearOrigin() {
    this.neurons.forEach((n) => n.clearOrigin());
    this.origin = null;
  }

  setOrigin(obj) {
    // Thanks to MLP class, we can't get rid of this mess. There is no input layer in original MLP class and all weights belongs to target neurons. Too much work to change. Maybe later.
    const { prev } = this.parent.getPrevAndNext(this);
    for (let i = 0; i < this.neurons.length; i++) {
      for (let j = 0; j < prev.neurons.length; j++) {
        this.neurons[i].setOrigin(obj.neurons[i]);
        prev.neurons[j].lines[i].setOrigin(obj.neurons[i].w[j]);
      }
    }
    this.origin = obj;
  }

  destroy() {
    this.parent = null;
    super.destroy();
  }
}
