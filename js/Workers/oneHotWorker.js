onmessage = function (e) {
  const { categories, numClasses } = e.data;
  const encoded = [];

  for (const category of categories) {
    const vector = new Array(numClasses).fill(0);
    if (category >= 0 && category < numClasses) {
      vector[category] = 1;
    }
    encoded.push(vector);
  }
  self.postMessage({ encodedChunk: encoded, numClasses: numClasses });
};
