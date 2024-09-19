class DataProcessor extends FunctionalTable {
  constructor() {
    super();
    this.chunkSize = 1000;
    this.initialize();
  }

  enable() {
    this.initializeWorkers();
  }

  disable() {
    this.terminateWorkers();
  }

  initializeWorkers() {
    const workerPath = "../../../js/Workers/";

    this.flattenWorker = new Worker(workerPath + "flattenWorker.js");
    this.oneHotWorker = new Worker(workerPath + "oneHotWorker.js");
    this.getMinMaxWorker = new Worker(workerPath + "getMinMaxWorker.js");
    this.normalizerWorker = new Worker(workerPath + "minMaxNormalizeWorker.js");
  }

  terminateWorkers() {
    this.flattenWorker?.terminate();
    this.getMinMaxWorker?.terminate();
    this.oneHotWorker?.terminate();
    this.normalizerWorker?.terminate();
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
    addEventToElement("mnist-button", "click", () => this.createMNIST());
    addEventToElement("flat-btn", "click", () => this.flatten());
    addEventToElement("one-hot-encode-btn", "click", () => this.oneHotEncode());
    addEventToElement("min-max-btn", "click", () => this.minMaxNormalization());
    addEventToElement("download-dataset-btn", "click", () =>
      this.downloadDataset(),
    );
  }

  onProcessFinish(btnId) {
    this.enableAll();
    this.setLayout();
    setElementProperties(btnId, { loading: false });
  }

  getMinMax(data, progressBarId) {
    return new Promise((resolve) => {
      let index = 0;
      let min = Infinity;
      let max = -Infinity;

      const processChunk = () => {
        const endIndex = Math.min(index + this.chunkSize, data.length);
        this.getMinMaxWorker.postMessage(data.slice(index, endIndex));
        index = endIndex;
      };

      this.getMinMaxWorker.onmessage = (e) => {
        min = Math.min(min, e.data.min);
        max = Math.max(max, e.data.max);
        const terminate = index >= data.length;

        setElementProperties(progressBarId, {
          innerText: `${terminate ? "Done!" : "Finding min-max..."}\nmin: ${min} max: ${max}\n ${index} / ${data.length}`,
        });

        terminate ? resolve({ min, max }) : processChunk();
      };

      processChunk();
    });
  }

  flatten() {
    this.disableAll();
    setElementProperties("flat-btn", { loading: true });

    const promise = this.processInChunks(
      this.flattenWorker,
      this.xData,
      {},
      "flat-progress-bar",
      "Flatting...",
    );
    promise.then((result) => {
      this.xData = result;
      this.onProcessFinish("flat-btn");
    });
  }

  oneHotEncode() {
    const data = this.yData;

    if (data[0] instanceof Array) return;

    this.disableAll();
    setElementProperties("one-hot-encode-btn", { loading: true });

    this.getMinMax(data, "onehot-progress-bar").then((result) => {
      const promise = this.processInChunks(
        this.oneHotWorker,
        data,
        { numClasses: result.max + 1 },
        "onehot-progress-bar",
        "Encoding...",
      );
      promise.then((r) => {
        this.yData = r;
        this.onProcessFinish("one-hot-encode-btn");
      });
    });
  }

  minMaxNormalization() {
    const xData = this.xData;
    this.disableAll();
    setElementProperties("min-max-btn", { loading: true });

    this.getMinMax(xData, "normalize-progress-bar").then((result) => {
      const { min, max } = result;
      const promise = this.processInChunks(
        this.normalizerWorker,
        xData,
        { min, max },
        "normalize-progress-bar",
        "Normalizing...",
      );
      promise.then((r) => {
        this.xData = r;
        this.onProcessFinish("min-max-btn");
      });
    });
  }

  processInChunks(worker, data, params, barId, updateText) {
    return new Promise((resolve) => {
      let result = [];
      let index = 0;

      const processChunk = () => {
        const endIndex = Math.min(index + this.chunkSize, data.length);
        worker.postMessage({ ...params, data: data.slice(index, endIndex) });
        index = endIndex;
      };

      worker.onmessage = (event) => {
        result.push(...event.data);
        const terminate = index >= data.length;

        setElementProperties(barId, {
          innerText: `${terminate ? "Done!" : updateText}\n${index}/ ${data.length}`,
        });

        terminate ? resolve(result) : processChunk();
      };
      processChunk();
    });
  }
}
