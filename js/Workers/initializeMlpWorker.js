importScripts("../../js/MLP/Neuron.js");
importScripts("../../js/MLP/Value.js");

onmessage = function (e) {
  console.log(Array.from({ length: e.data }, () => new Neuron(e.data)));
};
