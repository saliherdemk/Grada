onmessage = function (e) {
  const { min, max, data } = e.data;

  function normalizeArray(arr, min, max) {
    if (Array.isArray(arr)) {
      return arr.map((item) => normalizeArray(item, min, max));
    } else {
      return (arr - min) / (max - min);
    }
  }

  const normalized = normalizeArray(data, min, max);
  self.postMessage(normalized);
};
