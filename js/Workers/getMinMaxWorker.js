function flattenArray(arr) {
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

onmessage = function (e) {
  const data = e.data;

  const isMultiDim = Array.isArray(data[0][0]);

  const flattenedData = isMultiDim
    ? data.map((_x) => flattenArray(_x instanceof Array ? _x : [_x]))
    : data;

  let max = -Infinity;
  let min = Infinity;

  flattenedData.forEach((el) => {
    if (el instanceof Array) {
      for (let i = 0; i < el.length; i++) {
        const val = el[i];
        max = Math.max(val, max);
        min = Math.min(val, min);
      }
    } else {
      max = Math.max(el, max);
      min = Math.min(el, min);
    }
  });

  self.postMessage({ max, min });
};
