class DataProcessor {
  constructor() {
    this.chunkSize = 1000;
  }

  enable() {
    this.initializeWorkers();
  }

  disable() {
    this.terminateWorkers();
  }

  initializeWorkers() {
    this.flattenWorker = new Worker("flattenWorker.js");
    this.oneHotWorker = new Worker("oneHotWorker.js");
    this.getMinMaxWorker = new Worker("getMinMaxWorker.js");
    this.normalizerWorker = new Worker("minMaxNormalizeWorker.js");
  }

  terminateWorkers() {
    this.flattenWorker?.terminate();
    this.getMinMaxWorker?.terminate();
    this.oneHotWorker?.terminate();
    this.normalizerWorker?.terminate();
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

  getWorker(workerName) {
    return this[workerName + "Worker"];
  }

  processInChunks(workerName, data, params, barId, updateText) {
    const worker = this.getWorker(workerName);
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
