class TableOrganizer extends DataProcessor {
  constructor() {
    super();
    this.name = "";
    this.xData = [];
    this.yData = [];
    this.xLabels = [];
    this.yLabels = [];
    this.mode = 1;
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
    super.enable();
    this.setLayout();
    mainOrganizer.disable();
    removeClass(getElementById("create-dataset-container"), "hidden");
  }

  disable() {
    super.disable();
    this.reset();
    this.resetButtons();
    this.enableAll();
    mainOrganizer.enable();
  }

  getData() {
    return { x: this.xData, y: this.yData, xL: this.xLabels, yL: this.yLabels };
  }

  createdataset() {
    this.mode == 1 && this.setdatafromtable();
    datasetorganizer.adddataset(new dataset(this.name, this.getdata()));
  }

  downloadDataset() {
    this.mode == 1 && this.setdatafromtable();
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
