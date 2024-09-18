onmessage = function (e) {
  const { data, numClasses } = e.data;
  const encoded = [];

  for (const category of data) {
    const vector = new Array(numClasses).fill(0);
    if (category >= 0 && category < numClasses) {
      vector[category] = 1;
    }
    encoded.push(vector);
  }
  self.postMessage(encoded);
};
