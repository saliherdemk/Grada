onmessage = function (e) {
  const { nin, nout } = e.data;

  const weights = Array.from({ length: nin }, (_) =>
    Array.from({ length: nout }, (_) => Math.random() * 0.1 - 0.05),
  );
  const biases = Array(nout).fill(Math.random() * 0.1 - 0.05);
  const outputs = [Array(nout).fill(0)];

  postMessage({ weights, biases, outputs });
};
