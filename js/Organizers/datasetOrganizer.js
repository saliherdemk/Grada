class DatasetOrganizer {
  constructor() {
    this.lastDatasetId = -1;
    this.datasets = [];
  }

  createButtonForDataset(name, id) {
    const btn = createButton("dataset-scrollable");
    btn.innerText = name;
    btn.setAttribute("id", id);
    btn.onclick = () => {
      const dataset = this.getDatasetById(id);
      const trainX = structuredClone(dataset.trainX);
      const trainY = structuredClone(dataset.trainY).reverse();
      const inputLayer = new InputLayer(name, trainX);
      const outputLayer = new OutputLayer(name, trainY);

      const inputMlpView = new MlpView(0, 0, inputLayer);
      mainOrganizer.addMlpView(inputMlpView);
      const outputMlpView = new MlpView(0, 0, outputLayer);
      mainOrganizer.addMlpView(outputMlpView);
    };
    btn.classList.add("btn", "btn-gray");
  }

  addDataset(name, data) {
    const id = this.getDatasetId();
    this.datasets.push(new Dataset(id, name, data));
    this.createButtonForDataset(name, id);
  }

  getDatasetId() {
    return ++this.lastDatasetId;
  }

  getDatasetById(id) {
    return this.datasets.find((d) => d.id == id);
  }
}
