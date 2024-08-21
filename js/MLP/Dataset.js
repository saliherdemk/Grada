class Dataset {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.trainX = [];
    this.trainY = [];
    this.labels = [];
    this.setData(data);
  }

  setName(name) {
    this.name = name;
  }

  // setData(data) {
  //   for (let i = 0; i < data.length; i++) {
  //     const row = data[i];
  //     const values = [];
  //
  //     for (let j = 0; j < row.length; j++) {
  //       const value = row[j];
  //       if (i == 0) {
  //         this.labels.push(value);
  //         continue;
  //       }
  //       if (j == row.length - 1) {
  //         this.trainY.push(value);
  //         continue;
  //       }
  //       values.push(value);
  //     }
  //     values.length && this.trainX.push(values);
  //   }
  // }
  setData(data) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const values = [];

      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        // if (i == 0) {
        //   this.labels.push(value);
        //   continue;
        // }
        if (j == row.length - 1) {
          this.trainY.push(value);
          continue;
        }
        values.push(value);
      }
      values.length && this.trainX.push(values);
    }
  }
}
