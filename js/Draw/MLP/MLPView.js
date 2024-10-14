class MlpView extends Playable {
  constructor() {
    super();
    this.zenMode = false;
    this.loading = false;
    this.loadingText = "";
    this.layers = [];
    this.dots = [new CalculationDot(this), new GraphDot(this)];
    this.label = "MLP1";
    this.origin = null;
    this.lr = 0.1;
    this.batchSize = 1;
    this.errFunc = "mse";
    this.mode = "train";
    this.propsShown = false;
    this.selected = false;
  }

  getAllParameters() {
    let layersParameters = [];

    for (let i = 1; i < this.layers.length; i++) {
      const neurons = [...this.layers[i].neurons];

      const lines = this.layers[i - 1].neurons.map((prevNeuron) => {
        return this.layers[i].neurons.map((_, j) => {
          let a = prevNeuron.lines[j];
          return a;
        });
      });

      layersParameters.push({ lines, neurons });
    }

    return layersParameters;
  }

  setLoadingText(text) {
    this.loadingText = text;
  }

  setLoading(state) {
    this.loading = state;
  }

  isLoading() {
    return this.loading;
  }

  isInactive() {
    return this.layers[0].isComponent() && this.layers.length === 1;
  }

  select() {
    this.selected = true;
  }

  deSelect() {
    this.selected = false;
  }

  isSelected() {
    return this.selected;
  }

  setCoordinates(x, y) {
    this.updateLayersCoordinates(x, y);
    super.setCoordinates(x, y);
    this.updateButtonsCoordinates();
  }

  setLabel(label) {
    this.label = label;
  }

  setLr(lr) {
    this.lr = lr;
    this.origin?.setLr(lr);
  }

  setErrFunc(errFunc) {
    this.errFunc = errFunc;
    this.origin?.setErrFunc(errFunc);
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
    this.origin?.setBatchSize(batchSize);
  }

  handleSetMode(mode) {
    this.setMode(mode);
    this.isInitialized() && this.checkCompleted();
  }

  handleSetZenMode(mode) {
    mode == "true" ? this.openZenMode() : this.closeZenMode();
  }

  openZenMode() {
    this.zenMode = true;
  }

  closeZenMode() {
    this.zenMode = false;
  }

  setMode(mode) {
    this.mode = mode;
    this.origin?.setMode(mode);
  }

  getMode() {
    return this.mode;
  }

  setLayers(layers) {
    this.layers = layers;
    layers.forEach((l) => l.setParent(this));
    this.updateBorders();
  }

  isPropsShown() {
    return this.propsShown;
  }

  togglePropsShown() {
    this.propsShown = !this.propsShown;
  }

  updateLayersCoordinates(newX, newY) {
    const prevX = this.x;
    const prevY = this.y;
    this.layers.forEach((layer) => {
      layer.updateCoordinates(newX + layer.x - prevX, newY + layer.y - prevY);
    });
  }

  updateDotsCoordinates() {
    this.dots.forEach((d) => d.updateCoordinates());
  }

  getPrevAndNext(layer) {
    const layers = this.getLayers();
    const index = layers.indexOf(layer);
    return { prev: layers[index - 1], next: layers[index + 1], index: index };
  }

  getLayers() {
    return this.layers;
  }

  sliceData(weights, biases, z, outputs) {
    const maxRows = 5;
    const maxCols = 5;
    const slicedW = weights.data
      .slice(0, maxRows)
      .map((row) => row.slice(0, maxCols));

    const slicedB = biases.data.slice(0, maxRows);

    const slicedZ = z.data
      .slice(0, maxRows)
      .map((row) => row.slice(0, maxCols));

    const slicedO = outputs.data
      .slice(0, maxRows)
      .map((row) => row.slice(0, maxCols));

    return {
      slicedW,
      slicedB,
      slicedZ,
      slicedO,
      sw: weights.shape,
      sb: biases.shape,
      sz: z.shape,
      so: outputs.shape,
    };
  }

  updateParameters() {
    const layersElements = this.getAllParameters();
    const layers = this.origin.layers;
    const slicedDataAll = [];

    for (let i = 0; i < layers.length; i++) {
      const { weights, biases, z, outputs } = layers[i];
      if (this.calculationComponent) {
        slicedDataAll.push(this.sliceData(weights, biases, z, outputs));
      }
      const { lines, neurons } = layersElements[i];
      for (let i = 0; i < neurons.length; i++) {
        neurons[i].setOutput(outputs.data[0][i]);
        neurons[i].setBias(biases.data[i]);
        neurons[i].setBiasGrad(biases.grad?.[i] ?? 0);
      }

      for (let j = 0; j < lines.length; j++) {
        for (let k = 0; k < lines[0].length; k++) {
          lines[j][k].setWeight(weights.data[j][k]);
          lines[j][k].setGrad(weights.grad?.[j][k] ?? 0);
        }
      }
    }
    this.calculationComponent?.setData(slicedDataAll);
  }

  setOrigin(obj) {
    this.origin = obj;
    this.updateParameters();
  }

  moveLayers(targetMlpView) {
    this.getLayers().forEach((layer) => {
      targetMlpView.pushLayer(layer);
    });

    targetMlpView.updateBorders();

    this.setLayers([]);
    this.destroy();
  }

  pushLayer(layer) {
    layer.parent = this;
    this.layers.push(layer);
  }

  updateBorders() {
    let lastX = -Infinity,
      firstX = Infinity,
      firstY = Infinity,
      lastY = -Infinity;
    const layers = this.getLayers();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.isComponent()) continue;

      lastX = Math.max(layer.x + layer.w, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    super.setCoordinates(firstX - 35, firstY - 35);
    this.w = lastX - firstX + 70;
    this.h = lastY - firstY + 75;
    this.updateButtonsCoordinates();
    this.updateDotsCoordinates();
  }

  getLayerReversed() {
    return reverseArray(
      [
        this.getInput(),
        ...this.getLayers(),
        this.getOutput(),
        this.calculationComponent,
        this.graphComponent,
      ].filter(Boolean),
    );
  }

  getPressables() {
    const pressables = this.getLayerReversed().flatMap((layer) => [
      ...layer.getPressables(),
      layer,
    ]);

    return [...pressables, ...this.controlButtons, ...this.dots].filter(
      Boolean,
    );
  }

  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    let lastX = originLayer.x;

    const input = this.getInput();
    input?.setCoordinates(
      lastX - input.w - 50,
      originLayer.y - (input.h - originLayer.h) / 2,
    );

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = lastX + (index != 0) * 50;
      lastX = x + layer.w;
      layer.setCoordinates(x, y);
    });

    const output = this.getOutput();
    output?.setCoordinates(
      lastX + 50,
      originLayer.y - (output.h - originLayer.h) / 2,
    );

    originLayer.parent.updateBorders();
    const calcComponent = this.calculationComponent;
    calcComponent?.setCoordinates(
      this.x - (calcComponent.w - this.w) / 2,
      this.y + this.h + 100,
    );
    const graphComponent = this.graphComponent;
    graphComponent?.setCoordinates(
      this.x - (graphComponent.w - this.w) / 2,
      this.y - 400,
    );
  }

  handlePressed() {
    if (!this.isLoading() && !this.zenMode) {
      this.getPressables().forEach((p) => p.handlePressed());
    }
    super.handlePressed();
  }

  handleKeyPressed() {
    iManager.isHovered(this) && this.resetCoordinates();
  }

  handleReleased() {
    this.getLayers().forEach((layer) => {
      layer.released();
    });
    this.released();
  }

  handleDoubleClicked() {
    if (this.isLoading()) return;
    !this.zenMode && this.getLayerReversed().forEach((l) => l.doubleClicked());

    if (this.isInactive() || iManager.isBusy()) {
      iManager.handleRelease();
      return;
    }
    iManager.checkRollout(this) && editMLPOrganizer.setSelected(this);
    iManager.handleRelease();
    // Double click fires after two clicks =
    // pressed-released pressed-released handleDoubleClicked
    // iManager selected values: obj->null->obj->null -> obj
    // So we need to call handleRelease to free iManager
  }

  destroy() {
    this.getInput()?.clearLines();
    this.getOutput()?.clearLines();
    this.getLayers().forEach((l) => l.destroy());
    this.calculationComponent?.destroy();
    this.setLayers([]);
    if (editMLPOrganizer.getSelected() == this) {
      editMLPOrganizer.disable();
    }
    mainOrganizer.removeMlpView(this);
  }

  getProps() {
    return {
      lr: this.lr,
      errFunc: this.errFunc,
      batchSize: this.batchSize,
    };
  }

  getOriginProps() {
    const {
      totalParams = 0,
      stepCounter = 0,
      epoch = 0,
    } = this.origin ? this.origin.getProps() : {};
    return { totalParams, stepCounter, epoch };
  }

  getTrainCommands() {
    const x = this.x + 5;
    const y = this.y + this.h;
    const { lr, batchSize } = this.getProps();
    const { stepCounter, epoch } = this.getOriginProps();
    const commands = [
      { func: "text", args: [`Learning Rate: ${lr}`, x, y + 60] },
      {
        func: "text",
        args: [
          `Step: ${stepCounter} - ${this.msPerStepText}\nEpoch: ${epoch}\nBatch Size: ${batchSize}`,
          x,
          y + 15,
        ],
      },
    ];

    return commands;
  }

  showProps() {
    const { errFunc } = this.getProps();
    const { totalParams } = this.getOriginProps();

    const x = this.x + 5;
    const y = this.y + this.h;
    const common = [
      { func: "text", args: [errFunc, x + this.w - 35, y - 10] },
      { func: "text", args: [`Total Parameters: ${totalParams}\n`, x, y - 10] },
    ];

    const commands = this.getMode() == "train" ? this.getTrainCommands() : [];

    executeDrawingCommands([...commands, ...common]);
  }

  show() {
    const commands = [
      { func: "stroke", args: [this.isSelected() ? "lightblue" : 123] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      { func: "noStroke", args: [] },
      { func: "text", args: [this.label, this.x + 5, this.y + 5, this.w, 25] },
    ];

    executeDrawingCommands(commands);
  }

  showZen() {
    LoadingIndiactor.drawText(this.x, this.y, this.w, this.h, "Zen Mode");
  }

  draw() {
    if (!this.isInactive()) {
      this.show();
      this.isPropsShown() && this.showProps();
      if (this.zenMode) {
        this.showZen();
        return;
      }
      this.controlButtons.forEach((btn) => btn.draw());
    }
    this.inputComponent?.draw();
    this.getLayers().forEach((layer) => layer.draw());
    this.outputComponent?.draw();
    this.dots.forEach((d) => d.draw());
    if (this.isLoading()) {
      LoadingIndiactor.drawText(
        this.x,
        this.y,
        this.w,
        this.h,
        this.loadingText,
      );
    }
    this.calculationComponent?.draw();
    this.graphComponent?.draw();
  }

  export() {
    const viewsProps = {
      layers: this.layers.map((layer) => layer.export()),
      label: this.label,
      lr: this.lr,
      batchSize: this.batchSize,
      errFunc: this.errFunc,
    };
    const originProps = this.origin?.export() ?? null;
    const sanitized = convertSetsToArrays({
      ...viewsProps,
      origin: originProps,
    });

    downloadJSON(sanitized, this.label);
  }

  async import(mlpData) {
    const { lr, batchSize, errFunc, label } = mlpData;
    this.setLr(lr);
    this.setBatchSize(batchSize);
    this.setErrFunc(errFunc);
    this.setLabel(label);
    this.setMode("eval");
    this.resetCoordinates();
    if (!mlpData.origin) return;
    await this.toggleMlp();
    this.origin.import(mlpData.origin);
    this.updateParameters();
  }
}
