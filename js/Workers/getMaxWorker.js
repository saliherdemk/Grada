onmessage = function (e) {
  self.postMessage(
    e.data.reduce((max, current) => (current > max ? current : max), 0) + 1,
  );
};
