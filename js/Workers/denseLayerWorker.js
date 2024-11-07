onmessage = function (e) {
  const { nin, nout } = e.data;

  const weights = Array.from({ length: nin }, (_) =>
    Array.from(
      { length: nout },
      (_) => (Math.random() * 2 - 1) * Math.sqrt(1 / nin),
    ),
  );

  const biases = Array.from({ length: nout }, () => Math.random() * 0.1 - 0.05);
  const outputs = [Array.from({ length: nout }).fill(0)];

  postMessage({ weights, biases, outputs });
};
