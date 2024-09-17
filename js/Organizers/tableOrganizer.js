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
    addEventToElement("mnist-button", "click", () => this.createMNIST());
    addEventToElement("flat-btn", "click", () => this.flatten());
    addEventToElement("one-hot-encode-btn", "click", () => this.oneHotEncode());
  }

  oneHotEncode() {
    const categories = this.yData;

    if (categories[0] instanceof Array) return;

    this.disableAll();
    setElementProperties("one-hot-encode-btn", { loading: true });

    const chunkSize = 1000;
    let encoded = [];
    let startIndex = 0;

    const processChunk = (numClasses) => {
      const endIndex = Math.min(startIndex + chunkSize, categories.length);
      this.oneHotWorker.postMessage({
        categories: categories.slice(startIndex, endIndex),
        numClasses,
      });
      startIndex = endIndex;
    };

    this.getMaxWorker.postMessage(categories);

    this.getMaxWorker.onmessage = (e) => {
      processChunk(e.data);
    };

    this.oneHotWorker.onmessage = (event) => {
      const { encodedChunk, numClasses } = event.data;
      encoded.push(...encodedChunk);
      setElementProperties("onehot-progress-bar", {
        innerText: `${startIndex}/ ${categories.length}`,
      });

      if (startIndex >= categories.length) {
        this.yData = encoded;
        this.enableAll();
        this.setLayout();
        setElementProperties("one-hot-encode-btn", { loading: false });
      } else {
        processChunk(numClasses);
      }
    };
  }

  flatten() {
    this.disableAll();
    setElementProperties("flat-btn", { loading: true });

    const chunkSize = 1000;
    let flattenXData = [];
    let startIndex = 0;

    const processChunk = () => {
      const endIndex = Math.min(startIndex + chunkSize, this.xData.length);
      this.flattenWorker.postMessage(this.xData.slice(startIndex, endIndex));
      startIndex = endIndex;
    };

    this.flattenWorker.onmessage = (event) => {
      flattenXData.push(...event.data);
      setElementProperties("flat-progress-bar", {
        innerText: `${startIndex}/ ${this.xData.length}`,
      });

      if (startIndex >= this.xData.length) {
        this.xData = flattenXData;
        this.enableAll();
        this.setLayout();
        setElementProperties("flat-btn", { loading: false });
      } else {
        processChunk();
      }
    };

    processChunk();
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
  }

  reset() {
    this.name = "";
    this.xData = [];
    this.yData = [];
    this.xLabels = [];
    this.yLabels = [];
  }

  setEditDatasetLayout() {
    removeClass(getElementById("edit-dataset-container"), "hidden");
    removeClass(getElementById("create-dataset-btn"), "hidden");
    setElementProperties("x-shape", { innerText: getShape(this.xData) });
    setElementProperties("y-shape", { innerText: getShape(this.yData) });
    setElementProperties("edit-dataset-name", { value: this.name });
  }

  setCreateDatasetLayout() {
    this.reset();
    removeClass(getElementById("scrollable-container"), "hidden");
    removeClass(getElementById("create-dataset-btn"), "hidden");
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

  initializeWorkers() {
    this.flattenWorker = new Worker("/js/Workers/flattenWorker.js");
    this.oneHotWorker = new Worker("/js/Workers/oneHotWorker.js");
    this.getMaxWorker = new Worker("/js/Workers/getMaxWorker.js");
  }

  enable() {
    this.initializeWorkers();
    this.setLayout();
    mainOrganizer.disable();
    removeClass(getElementById("create-dataset-container"), "hidden");
  }

  reset() {
    this.name = "";
    this.xData = [];
    this.yData = [];
    this.xLabels = [];
    this.yLabels = [];
    this.mode = 1;
  }

  terminateWorkers() {
    [this.flattenWorker, this.getMaxWorker, this.oneHotWorker].forEach((w) =>
      w.terminate(),
    );
  }

  resetButtons() {
    setElementProperties("flat-btn", { loading: false });
    setElementProperties("import-dataset", { loading: false });
    setElementProperties("one-hot-encode-btn", { loading: false });
    setElementProperties("flat-progress-bar", { innerText: "" });
    setElementProperties("onehot-progress-bar", { innerText: "" });
  }

  disable() {
    this.reset();
    this.terminateWorkers();
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

  disableAll() {
    setElementProperties("create-dataset-container", { loading: "true" });
  }

  enableAll() {
    setElementProperties("create-dataset-container", { loading: "false" });
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

  createMNIST() {
    this.disableAll();
    setElementProperties("mnist-button", { loading: "true" });
    fetch("../Data/new.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        this.setPreparedDataset(data, "MNIST");
      })
      .catch((error) => {
        alert(error);
      })
      .finally(() => {
        this.enableAll();
        setElementProperties("mnist-button", { loading: "false" });
      });
  }
}
