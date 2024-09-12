class Playable extends Draggable {
  constructor() {
    super(0, 0);
    this.controlButtons = [];
    this.playInterval = null;
    this.playSpeed = 50;
    this.status = -1;
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
        b.setCoordinates(this.x + this.w - b.w, this.y + this.h + 5);
      } else {
        const x = this.x + (this.w - b.w) / 2 + (i % 2 ? 1 : -1) * 40;
        b.setCoordinates(x, this.y - 40);
      }
    });
  }

  getStatus() {
    return this.status;
  }

  isInitialized() {
    return this.getStatus() > -1;
  }

  checkCompleted() {
    this.updateStatus(
      +(
        this.getInput() instanceof InputLayer &&
        this.getOutput() instanceof OutputLayer
      ),
    );
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

  toggleMlp() {
    this.getStatus() > -1 ? this.destroyMlp() : this.initializeMlp();
    this.updateStatus(this.getStatus() > -1 ? -1 : 0);
  }

  togglePlay() {
    this.getStatus() == 3 ? this.pause() : this.play();
    this.updateStatus(this.getStatus() == 3 ? 1 : 3);
  }

  goOnce() {
    this.getStatus() == 2 ? this.executeOnce() : this.fetchNext();
    this.updateStatus(this.getStatus() == 2 ? 1 : 2);
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
    mlp.setTotalParams();
    this.setOrigin(mlp);
    this.initialized = true;
    params && this.origin.import(params);

    !this.isPropsShown() && this.togglePropsShown();
    mainOrganizer.setActiveLine(null);
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

  executeOnce() {
    const inputValues = this.getInput().setValues();
    const outputValues = this.getOutput().setValues();
    this.origin.goOneCycle(inputValues, outputValues);
  }

  fetchNext() {
    this.getInput().fetchNext();
    this.getOutput().fetchNext();
  }
}
