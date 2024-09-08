class Playable extends Draggable {
  constructor() {
    super(0, 0);
    this.initialized = false;
    this.controlButtons = [];
    this.playInterval = null;
    this.playSpeed = 50;
    this.dataStatus = -1;

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

  initializeButtons() {
    const playBtn = this.createButton(
      "Play",
      this.togglePlay.bind(this),
      75,
      35,
      "cyan",
    );
    playBtn.hide();

    const fetchBtn = this.createButton(
      "Fetch Next",
      this.goOnce.bind(this),
      75,
      35,
      "yellow",
    );
    fetchBtn.hide();

    this.controlButtons = [
      this.createButton("Initialize MLP", () => this.toggleMlp(), 100, 35),
      playBtn,
      fetchBtn,
    ];
    this.updateStatus(-1);
    this.updateButtonsCoordinates();
  }

  createButton(text, action, w, h, theme = "blue") {
    const button = new TextButton(text, action);
    button.setDimensions(w, h).setTheme(theme);
    return button;
  }

  updateButtons() {
    const initBtn = this.getInitBtn();
    const fetchBtn = this.getFetchBtn();
    const playBtn = this.getPlayBtn();

    if (this.isInitialized()) {
      const isComplete =
        this.getInputLayer() instanceof InputLayer &&
        this.getOutputLayer() instanceof OutputLayer;

      initBtn.setText("Terminate MLP").setTheme("red");
      fetchBtn.visible();
      playBtn.visible();

      if (!isComplete) {
        fetchBtn.disable();
        playBtn.disable();
      }
      return;
    }
    initBtn.setText("Initialize MLP").setTheme("blue");
    fetchBtn.hide();
    playBtn.hide();
  }

  updateButtonsCoordinates() {
    this.controlButtons.forEach((b, i) => {
      if (i == 0) {
        b.setCoordinates(this.x + this.w - b.w, this.y + this.h + 5);
      } else {
        const x = this.x + (this.w - b.w) / 2 + (i % 2 ? 1 : -1) * 40;
        b.setCoordinates(x, this.y - 40);
      }
    });
  }

  getInputLayer() {
    return this.layers[0];
  }

  getOutputLayer() {
    return this.layers[this.layers.length - 1];
  }

  getDataStatus() {
    return this.dataStatus;
  }

  isInitialized() {
    return this.initialized;
  }

  setInitialized(value) {
    this.initialized = value;
  }

  updateStatus(status) {
    this.dataStatus = status;
    const fetchBtn = this.getFetchBtn();
    const playBtn = this.getPlayBtn();
    const initBtn = this.getInitBtn();
    const isDataAvailable = this.getDataStatus() > 0;
    const isPlaying = !!this.playInterval;

    fetchBtn
      .setTheme(isDataAvailable ? "green" : "yellow")
      .setText(isDataAvailable ? "Execute" : "Fetch Next");

    playBtn.setText(isPlaying ? "Pause" : "Play");

    if (isDataAvailable) {
      fetchBtn.enable();
      playBtn.disable();
      initBtn.disable();
    } else {
      playBtn.enable();
      isPlaying ? fetchBtn.disable() : fetchBtn.enable();
      isPlaying ? initBtn.disable() : initBtn.enable();
    }
  }

  checkMlpCompleted() {
    const isComplete =
      this.getInputLayer() instanceof InputLayer &&
      this.getOutputLayer() instanceof OutputLayer;

    this.controlButtons.forEach((b) => b[isComplete ? "enable" : "disable"]());
    this.getInitBtn().enable();
  }

  toggleMlp() {
    this.isInitialized() ? this.destroyMlp() : this.initializeMlp();
    this.layers.forEach((layer) => layer.updateButtons());
  }

  initializeMlp(params = null) {
    const mlp = new MLP([], this.lr, this.batchSize);
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const { prev } = layer.parent.getPrevAndNext(layer);
      if (layer.isComponent() || prev == null || prev?.isComponent()) continue;

      const layerOrigin = new Layer(
        this.layers[i - 1].neurons.length,
        layer.neurons.length,
        layer.actFunc,
      );
      layer.setOrigin(layerOrigin);
      mlp.addLayer(layerOrigin);
    }
    mlp.setErrFunc(this.errFunc);
    this.setOrigin(mlp);
    this.initialized = true;
    params && this.origin.import(params);

    !this.isPropsShown() && this.togglePropsShown();
    this.updateButtons();
    mainOrganizer.setActiveLine(null);
  }

  destroyMlp() {
    this.pause();
    this.clearOrigin();
    this.initialized = false;
    this.isPropsShown() && this.togglePropsShown();
    this.updateButtons();
  }

  clearOrigin() {
    this.origin.destroy();
    this.layers.forEach((layer) => layer.clearOrigin());
    this.origin = null;
  }

  setPlaySpeed(ms) {
    this.playSpeed = ms;
    if (this.playInterval) {
      this.pause();
      this.play();
    }
  }

  play() {
    this.playInterval = setInterval(() => {
      this.fetchNext();
      this.executeOnce();
    }, this.playSpeed);
  }

  pause() {
    clearInterval(this.playInterval);
    this.playInterval = null;
  }

  togglePlay() {
    this.playInterval ? this.pause() : this.play();
    this.updateStatus(0);
  }

  goOnce() {
    this.getDataStatus() > 0 ? this.executeOnce() : this.fetchNext();
  }

  executeOnce() {
    const inputValues = this.getInputLayer().setValues();
    const outputValues = this.getOutputLayer().setValues();

    this.origin.goOneCycle(inputValues, outputValues);
    this.updateStatus(0);
  }

  fetchNext() {
    this.getInputLayer().fetchNext();
    this.getOutputLayer().fetchNext();
    this.updateStatus(1);
  }
}
