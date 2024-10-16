class Playable extends Draggable {
  constructor() {
    super(0, 0);
    this.controlButtons = [];
    this.status = -1;
    this.recordNum = 0;
    this.msPerStepText = "";
    this.inputComponent = null;
    this.outputComponent = null;
    this.calculationComponent = null;
    this.graphComponent = null;
    this.initializeButtons();
  }

  getInitBtn() {
    return this.controlButtons[0];
  }

  getPlayBtn() {
    return this.controlButtons[1];
  }

  getFetchBtn() {
    return this.controlButtons[2];
  }

  setInputComponent(component) {
    this.inputComponent = component;
    mainOrganizer.removeComponent(component);
    this.checkCompleted();
  }

  getInput() {
    return this.inputComponent;
  }

  setOutputComponent(component) {
    this.outputComponent = component;
    mainOrganizer.removeComponent(component);
    this.checkCompleted();
  }

  getOutput() {
    return this.outputComponent;
  }

  clearInput() {
    mainOrganizer.addComponent(this.inputComponent);
    this.inputComponent = null;
    this.checkCompleted();
  }

  clearOutput() {
    mainOrganizer.addComponent(this.outputComponent);
    this.outputComponent = null;
    this.checkCompleted();
  }

  setCalculationComponent(calcComponent) {
    calcComponent.setCoordinates(
      this.x - (calcComponent.w - this.w) / 2,
      this.y + this.h + 100,
    );
    this.calculationComponent = calcComponent;
  }

  removeCalculationComponent() {
    this.calculationComponent?.destroy();
    this.calculationComponent = null;
    this.dots[0].free();
  }

  setGraphComponent(graphComponent) {
    graphComponent.setCoordinates(
      this.x - (graphComponent.w - this.w) / 2,
      this.y - 400,
    );
    graphComponent.setData(this.origin.getLossData());
    this.graphComponent = graphComponent;
  }

  removeGraphComponent() {
    this.graphComponent?.destroy();
    this.graphComponent = null;
    this.dots[1].free();
  }

  setMsPerStepText(value) {
    this.msPerStepText = value;
  }

  initializeButtons() {
    this.controlButtons = [
      this.createButton("Initialize MLP", () => this.toggleMlp(), 100, 35),
      this.createButton("Play", () => this.togglePlay(), 75, 35, "cyan").hide(),
      this.createButton(
        "Fetch Next",
        () => this.goOnce(),
        75,
        35,
        "yellow",
      ).hide(),
    ];
    this.updateButtonsCoordinates();
  }

  createButton(text, action, w, h, theme = "blue") {
    const button = new TextButton(text, action);
    button.setDimensions(w, h).setTheme(theme);
    return button;
  }

  updateButtonsCoordinates() {
    this.controlButtons.forEach((b, i) => {
      if (i == 0) {
        b.setCoordinates(this.x + this.w - b.w, this.y + this.h + 15);
      } else {
        const x = this.x + (this.w - b.w) / 2 + (i % 2 ? 1 : -1) * 40;
        b.setCoordinates(x, this.y - 45);
      }
    });
  }

  getStatus() {
    return this.status;
  }

  isInitialized() {
    return this.getStatus() > -1;
  }

  setRecordNum(recordNum) {
    this.recordNum = recordNum;
  }

  checkCompleted() {
    const isEval = this.getMode() == "eval";
    this.pause();
    this.updateStatus(
      +(
        (this.getInput() instanceof InputLayer ||
          this.getInput() instanceof DigitComponent) &&
        (isEval || this.getOutput() instanceof OutputLayer)
      ),
    );

    if (!this.origin) return;
    this.origin.recordNum =
      this.getStatus() == 1 ? this.getInput().recordNum : 0;
  }

  updateStatus(status) {
    this.status = status;
    const fetchBtn = this.getFetchBtn();
    const playBtn = this.getPlayBtn();
    const initBtn = this.getInitBtn();
    const ioLayers = [this.getInput(), this.getOutput()];

    fetchBtn.hide();
    playBtn.hide();
    initBtn.hide();

    switch (this.status) {
      case -1:
        initBtn.setText("Initialize MLP").setTheme("blue").visible();
        this.layers.forEach((l) => l.updateButtons(false));
        this.dots.forEach((d) => d.hide());
        break;
      case 0:
        playBtn.visible().disable();
        fetchBtn.visible().disable();
        initBtn.setText("Terminate MLP").setTheme("red").visible();
        this.layers.forEach((l) => l.updateButtons(true));
        this.dots.forEach((d) => d.visible());
        break;
      case 1:
        fetchBtn.setText("Fetch Next").setTheme("yellow").visible();
        playBtn.setText("Play").visible();
        initBtn.setText("Terminate MLP").setTheme("red").visible();
        ioLayers.forEach((io) => io?.updateButtons(false));
        break;
      case 2:
        fetchBtn.setText("Execute").setTheme("green").visible();
        playBtn.visible().disable();
        initBtn.visible().disable();
        ioLayers.forEach((io) => io?.updateButtons(true));

        break;
      case 3:
        playBtn.setText("Pause").visible();
        fetchBtn.visible().disable();
        initBtn.visible().disable();
        ioLayers.forEach((io) => io?.updateButtons(true));

        break;

      default:
        break;
    }
  }

  async toggleMlp() {
    this.getStatus() > -1 ? this.destroyMlp() : await this.initializeMlp();
    this.updateStatus(this.getStatus() > -1 ? -1 : 0);
  }

  togglePlay() {
    this.getStatus() == 1 && this.play();
    this.updateStatus(this.getStatus() == 3 ? 1 : 3);
  }

  goOnce() {
    this.getStatus() == 2 ? this.executeOnce() : this.fetchNext();
    this.updateStatus(this.getStatus() == 2 ? 1 : 2);
  }

  async createDenseLayer(nin, nout, actFunc) {
    return new Promise((resolve, reject) => {
      const denseLayer = new DenseLayer();
      const worker = new Worker("js/Workers/denseLayerWorker.js");

      worker.onmessage = (e) => {
        const { weights, biases, outputs } = e.data;

        denseLayer.initialize(weights, biases, outputs, actFunc);
        worker.terminate();
        resolve(denseLayer);
      };

      worker.onerror = (error) => {
        reject(new Error(`Worker error: ${error.message}`));
      };

      worker.postMessage({ nin, nout });
    });
  }

  async initializeMlp() {
    const mlp = new MLP();
    const layers = this.layers;

    this.setLoading(true);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const { prev } = layer.parent.getPrevAndNext(layer);

      if (layer.isComponent() || prev == null || prev?.isComponent()) continue;

      const layerOrigin = await this.createDenseLayer(
        layers[i - 1].neurons.length,
        layer.neurons.length,
        layer.actFunc,
      );

      this.setLoadingText(`${i + 1}/${layers.length}`);

      mlp.addLayer(layerOrigin);
    }
    mlp.setLr(this.lr);
    mlp.setBatchSize(this.batchSize);
    mlp.setMode(this.mode);
    mlp.setErrFunc(this.errFunc);
    mlp.setTotalParams();
    this.setOrigin(mlp);

    !this.isPropsShown() && this.togglePropsShown();

    mainOrganizer.setActiveLine(null);
    this.setLoading(false);
  }

  destroyMlp() {
    this.pause();
    this.clearOrigin();
    this.removeCalculationComponent();
    this.removeGraphComponent();
    this.isPropsShown() && this.togglePropsShown();
    this.getInput()?.clearLines();
    this.getOutput()?.clearLines();
  }

  clearOrigin() {
    this.origin.destroy();
    this.origin = null;
  }

  reboot() {
    if (this.getStatus() == 3) {
      this.pause();
      this.play();
    }
  }

  async play() {
    this.fetchNext();
    await this.executeOnce();
    this.getStatus() == 3 && setTimeout(() => this.play(), 0);
  }

  pause() {
    this.updateStatus(1);
  }

  async executeOnce() {
    let startTime = performance.now();
    const inputData = this.getInput().getData();
    this.calculationComponent?.setInputData(
      inputData.slice(0, 5).map((row) => row.slice(0, 5)),
      [parseInt(this.batchSize), this.getInput().shape[1]],
    );
    const outputData = this.getOutput()?.getData() ?? null;
    const mlp_output = await this.origin.forward(inputData);
    this.calculationComponent && this.setCalculationData();
    await this.origin.backward(mlp_output, outputData);
    this.updateParameters();
    this.graphComponent?.setData(this.origin.getLossData());
    this.setMsPerStepText(performance.now() - startTime + "ms / step");
  }

  fetchNext() {
    this.getInput().fetchNext();
    this.getOutput()?.fetchNext();
  }
}
