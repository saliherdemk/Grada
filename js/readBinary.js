function readUbyteFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      resolve(new DataView(arrayBuffer));
    };
    reader.onerror = function () {
      reject(new Error("Failed to read file"));
    };
    reader.readAsArrayBuffer(file);
  });
}

async function readUbyteImages(dataView) {
  const numImages = dataView.getUint32(4, false);
  const numRows = dataView.getUint32(8, false);
  const numCols = dataView.getUint32(12, false);

  const images = [];
  let offset = 16; // Header length
  for (let i = 0; i < numImages; i++) {
    const image = [];
    for (let r = 0; r < numRows; r++) {
      const row = [];
      for (let c = 0; c < numCols; c++) {
        row.push(dataView.getUint8(offset++)); // Read each pixel
      }
      image.push(row);
    }
    images.push(image);
  }
  return images;
}

async function readUbyteLabels(dataView) {
  const numLabels = dataView.getUint32(4, false);

  const labels = [];
  let offset = 8; // Header length
  for (let i = 0; i < numLabels; i++) {
    labels.push(dataView.getUint8(offset++)); // Read each label
  }
  return labels;
}

async function convertMnistToJson(imagesFile, labelsFile) {
  const imagesView = await readUbyteFile(imagesFile);
  const labelsView = await readUbyteFile(labelsFile);

  const images = await readUbyteImages(imagesView);
  const labels = await readUbyteLabels(labelsView);

  const jsonData = images.map((image, index) => ({
    label: labels[index],
    image,
  }));

  return jsonData;
}

document.getElementById("convertButton").addEventListener("click", async () => {
  const outputElement = document.getElementById("output");
  outputElement.textContent = "Converting MNIST dataset...";

  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;

  if (files.length < 2) {
    outputElement.textContent = "Please upload both images and labels files.";
    return;
  }

  try {
    const [imagesFile, labelsFile] = files;
    const jsonData = await convertMnistToJson(imagesFile, labelsFile);

    outputElement.textContent = JSON.stringify(jsonData, null, 2);

    // Download JSON file
    const blob = new Blob([JSON.stringify(jsonData)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mnist_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    outputElement.textContent = `Error: ${error.message}`;
  }
});
