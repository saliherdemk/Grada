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
