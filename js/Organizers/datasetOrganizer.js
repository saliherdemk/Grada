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
      mainOrganizer.addComponent(new InputLayer(id));
      mainOrganizer.addComponent(new OutputLayer(id));
    };
    btn.classList.add("btn", "btn-gray");
  }

  addDataset(dataset) {
    this.datasets.push(dataset);
  }

  getDatasetId() {
    return ++this.lastDatasetId;
  }

  getDatasetById(id) {
    return this.datasets.find((d) => d.id == id);
  }
}
