class HiddenLayer extends FunctionalLayerView {
  constructor(x, y) {
    super(x, y, 55, 0);
    this.parent = null;
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

  updateButtons(hide) {
    const button = this.removeButton;
    hide ? button.hide() : button.visible();
    this.getDots().forEach((d) => d.setColor(hide ? "cyan" : "red"));
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
    if (targetLayer instanceof Component) {
      targetLayer.connectLayer(this);
      return;
    }
    if (this.parent == targetLayer.parent) return;

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  async connectNeurons(targetLayer, batchSize = 10000) {
    const parent = this.parent;
    const totalConnections = this.neurons.length * targetLayer.neurons.length;
    let processedConnections = 0;
    parent.setLoading(true);

    for (let i = 0; i < this.neurons.length; i++) {
      const n1 = this.neurons[i];
      n1.removeLines();

      for (let j = 0; j < targetLayer.neurons.length; j++) {
        const n2 = targetLayer.neurons[j];
        n1.addLine(new Line(n1, n2));

        parent.setLoadingText(
          ~~((processedConnections++ / totalConnections) * 100) + "%",
        );

        if (processedConnections % batchSize === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }

    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
    parent.setLoading(false);
  }

  handleRemove() {
    this.isIsolated() ? this.parent.destroy() : this.isolate();
  }

  isIsolated() {
    return (
      this.parent.layers.length == 1 &&
      !this.parent.getInput() &&
      !this.parent.getOutput()
    );
  }

  isolate() {
    const parent = this.parent;
    const { prev, next, index } = parent.getPrevAndNext(this);

    if (prev) {
      prev.clearLines(this);
    } else {
      parent.getInput()?.clearLines();
    }

    if (next) {
      this.clearLines(next);
    } else {
      parent.getOutput()?.clearLines();
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

  postUpdateCoordinates() {
    super.postUpdateCoordinates();
    this.parent.updateBorders();
  }

  destroy() {
    this.parent = null;
    super.destroy();
  }
}
