onmessage = (e) => {
  const obj = e.data;
  const jsonStr = JSON.stringify(obj, null, 2);
  self.postMessage(jsonStr);
};
