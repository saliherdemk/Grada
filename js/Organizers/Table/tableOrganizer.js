class TableOrganizer extends FunctionalTable {
  constructor() {
    super();
    this.name = "";
    this.xData = [];
    this.yData = [];
    this.xLabels = [];
    this.yLabels = [];
    this.mode = 1;
    this.initialize();
  }

  initialize() {
    addEventToElement("edit-dataset-name", "input", (e) =>
      this.setName(e.target.value),
    );
    addEventToElement("import-dataset-inp", "change", (e) =>
      this.importDataset(e),
    );
    addEventToElement("create-dataset-btn", "click", () =>
      this.createDataset(),
    );
    addEventToElement("mnist-train-button", "click", () =>
      this.createMNIST("train"),
    );
    addEventToElement("mnist-eval-button", "click", () =>
      this.createMNIST("eval"),
    );
    addEventToElement("download-dataset-btn", "click", () =>
      this.downloadDataset(),
    );
    addEventToElement("flat-btn", "click", () => this.flatten());
    addEventToElement("one-hot-encode-btn", "click", () => this.oneHotEncode());
    addEventToElement("min-max-btn", "click", () => this.minMaxNormalization());
  }

  setName(name) {
    this.name = name;
  }

  setMode(mode) {
    this.mode = mode;
    this.setLayout();
  }

  toggleMode() {
    this.mode = +!this.mode;
    this.setLayout();
  }

  hideAll() {
    addClass(getElementById("scrollable-container"), "hidden");
    addClass(getElementById("edit-dataset-container"), "hidden");
    addClass(getElementById("import-dataset-container"), "hidden");
    addClass(getElementById("create-dataset-btn"), "hidden");
    addClass(getElementById("download-dataset-btn"), "hidden");
  }

  setEditDatasetLayout() {
    removeClass(getElementById("edit-dataset-container"), "hidden");
    removeClass(getElementById("create-dataset-btn"), "hidden");
    removeClass(getElementById("download-dataset-btn"), "hidden");
    setElementProperties("x-shape", { innerText: getShape(this.xData) });
    setElementProperties("y-shape", { innerText: getShape(this.yData) });
    setElementProperties("edit-dataset-name", { value: this.name });
  }

  setCreateDatasetLayout() {
    this.reset();
    removeClass(getElementById("scrollable-container"), "hidden");
    removeClass(getElementById("create-dataset-btn"), "hidden");
    removeClass(getElementById("download-dataset-btn"), "hidden");
    this.initializeTable();
  }

  setLayout() {
    this.hideAll();
    switch (this.mode) {
      case 0:
        removeClass(getElementById("import-dataset-container"), "hidden");
        break;
      case 1:
        this.setCreateDatasetLayout();
        break;
      case 2:
        this.setEditDatasetLayout();
        break;
      default:
        break;
    }
  }

  reset() {
    this.name = "";
    this.xData = [];
    this.yData = [];
    this.xLabels = [];
    this.yLabels = [];
    this.mode = 1;
  }

  resetButtons() {
    setElementProperties("flat-btn", { loading: false });
    setElementProperties("import-dataset", { loading: false });
    setElementProperties("one-hot-encode-btn", { loading: false });
    setElementProperties("flat-progress-bar", { innerText: "" });
    setElementProperties("onehot-progress-bar", { innerText: "" });
  }

  enable() {
    dataProcessor.enable();
    this.setLayout();
    mainOrganizer.disable();
    removeClass(getElementById("create-dataset-container"), "hidden");
  }

  disable() {
    dataProcessor.disable();
    this.reset();
    this.resetButtons();
    this.enableAll();
    mainOrganizer.enable();
  }

  getData() {
    return { x: this.xData, y: this.yData, xL: this.xLabels, yL: this.yLabels };
  }

  createDataset() {
    this.mode == 1 && this.setDataFromTable();
    datasetOrganizer.addDataset(new Dataset(this.name, this.getData()));
    this.reset();
  }

  downloadDataset() {
    this.mode == 1 && this.setDataFromTable();
    downloadJSON({ x: this.xData, y: this.yData }, this.name);
  }

  disableAll() {
    setElementProperties("create-dataset-container", { loading: "true" });
  }

  enableAll() {
    setElementProperties("create-dataset-container", { loading: "false" });
  }

  setPreparedDataset(data, name) {
    const [x, y] = Object.values(data);
    this.xData = x;
    this.yData = y;

    this.xLabels = this.xData.map((_, i) => "X" + i);
    this.yLabels = this.yData.map((_, i) => "Y" + i);
    this.setName(name);
    this.setMode(2);
  }

  setDataFromTable() {
    const labelIndexes = [];
    const { table, rowCount, colCount } = this.getTableProps();

    for (const [key, value] of Object.entries(table.rows[0].cells)) {
      if (value.getAttribute("selected") == "true") {
        labelIndexes.push(key - 1);
      }
    }

    const data = [];

    for (let i = 1; i < rowCount - 1; i++) {
      const values = [];
      for (let j = 1; j < colCount; j++) {
        const cellInput = table.rows[i].cells[j].querySelector("input");
        values.push(cellInput.value);
      }
      data.push(values);
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const xValues = [];
      const yValues = [];

      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        if (i == 0) {
          if (labelIndexes.includes(j)) {
            this.yLabels.push(value);
            continue;
          }
          this.xLabels.push(value);
          continue;
        }

        if (labelIndexes.includes(j)) {
          yValues.push(value);
          continue;
        }
        xValues.push(value);
      }
      xValues.length && this.xData.push(xValues);
      yValues.length && this.yData.push(yValues);
    }

    this.name = getElementById("dataset-name-inp").value;
  }

  importDataset(e) {
    this.disableAll();
    setElementProperties("import-dataset", { loading: "true" });
    const fileInput = e.target;
    const files = fileInput.files;
    if (!files.length) return;

    const file = files[0];
    if (!(file.type === "application/json")) return;

    const readFileAsText = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    };
    readFileAsText(file)
      .then((result) => {
        const jsonData = JSON.parse(result);
        this.setPreparedDataset(jsonData, file.name);
      })
      .catch((error) => {
        console.error("Error parsing JSON or reading file:", error);
      })
      .finally(() => {
        this.enableAll();
        setElementProperties("import-dataset", { loading: "false" });
      });
  }

  async createMNIST(type) {
    this.disableAll();
    const buttonId = `mnist-${type}-button`;
    setElementProperties(buttonId, { loading: "true" });

    async function loadXData() {
      const allXData = [];

      // FIXME: change 10 to how many files there is
      for (let chunkNumber = 1; chunkNumber <= 10; chunkNumber++) {
        try {
          const module = await import(
            `../../../Data/mnist/${type}/xData/chunk_${chunkNumber}.js`
          );
          allXData.push(...module.default);
        } catch (error) {
          console.error(`Error loading xData chunk ${chunkNumber}:`, error);
        }
      }

      return allXData;
    }

    async function loadYData() {
      try {
        const module = await import(`../../../Data/mnist/${type}/yData.js`);
        return module.default;
      } catch (error) {
        console.error("Error loading yData:", error);
      }
    }

    const xDatas = await loadXData();
    const yDatas = await loadYData();

    this.setPreparedDataset({ xDatas, yDatas }, `MNIST-${type}`);
    this.enableAll();
    setElementProperties(buttonId, { loading: "false" });
  }

  onProcessFinish(btnId) {
    this.enableAll();
    this.setLayout();
    setElementProperties(btnId, { loading: false });
  }

  flatten() {
    this.disableAll();
    setElementProperties("flat-btn", { loading: true });

    const promise = dataProcessor.processInChunks(
      "flatten",
      this.xData,
      {},
      "flat-progress-bar",
      "Flatting...",
    );
    promise
      .then((result) => (this.xData = result))
      .catch((err) => alert(err))
      .finally(() => this.onProcessFinish("flat-btn"));
  }

  oneHotEncode() {
    const data = this.yData;

    if (data[0] instanceof Array) return;

    this.disableAll();
    setElementProperties("one-hot-encode-btn", { loading: true });

    dataProcessor.getMinMax(data, "onehot-progress-bar").then((result) => {
      const promise = dataProcessor.processInChunks(
        "oneHot",
        data,
        { numClasses: result.max + 1 },
        "onehot-progress-bar",
        "Encoding...",
      );
      promise
        .then((r) => (this.yData = r))
        .catch((err) => alert(err))
        .finally(() => this.onProcessFinish("one-hot-encode-btn"));
    });
  }

  minMaxNormalization() {
    const xData = this.xData;
    this.disableAll();
    setElementProperties("min-max-btn", { loading: true });

    dataProcessor.getMinMax(xData, "normalize-progress-bar").then((result) => {
      const { min, max } = result;
      const promise = dataProcessor.processInChunks(
        "normalizer",
        xData,
        { min, max },
        "normalize-progress-bar",
        "Normalizing...",
      );
      promise
        .then((r) => (this.xData = r))
        .catch((err) => alert(err))
        .finally(() => this.onProcessFinish("min-max-btn"));
    });
  }
}
