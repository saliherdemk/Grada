function flattenArray(arr) {
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

onmessage = (event) => {
  const { data } = event;

  const flattenedData = data.map((_x) =>
    flattenArray(_x instanceof Array ? _x : [_x]),
  );

  self.postMessage(flattenedData);
};
