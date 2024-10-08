class Playable extends Draggable {
  constructor() {
    super(0, 0);
    this.controlButtons = [];
    this.status = -1;
    this.recordNum = 0;
    this.msPerStepText = "";
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
        b.setCoordinates(this.x + this.w - b.w, this.y + this.h + 10);
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
        this.getInput() instanceof InputLayer &&
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
        break;
      case 0:
        playBtn.visible().disable();
        fetchBtn.visible().disable();
        initBtn.setText("Terminate MLP").setTheme("red").visible();
        this.layers.forEach((l) => l.updateButtons(true));
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
    mlp.setLr(this.lr);
    mlp.setBatchSize(this.batchSize);

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

    mlp.setErrFunc(this.errFunc);
    mlp.setTotalParams();
    this.setOrigin(mlp);

    if (!this.isPropsShown()) {
      this.togglePropsShown();
    }

    mainOrganizer.setActiveLine(null);
    this.setLoading(false);
  }

  destroyMlp() {
    this.pause();
    this.clearOrigin();
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
    const outputData = this.getOutput()?.getData() ?? null;
    await this.origin.trainOneStep(inputData, outputData);
    this.updateParameters();
    this.setMsPerStepText(performance.now() - startTime + "ms / step");
  }

  fetchNext() {
    this.getInput().fetchNext();
    this.getOutput()?.fetchNext();
  }
}
