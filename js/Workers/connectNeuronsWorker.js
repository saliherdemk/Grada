onmessage = (e) => {
  const { n, t } = e.data;

  n.forEach((n1) => {
    console.log(n1);
    n1.removeLines();
    t.forEach((n2) => {
      n1.addLine(new Line(n1, n2));
    });
  });

  self.postMessage(true);
};
