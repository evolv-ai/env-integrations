function initializeStore(sandbox) {
  return {
    instrumentDOM: (data) => {
      const argumentArray = [];

      Object.keys(data).forEach((key) => {
        const dataItem = data[key];
        const select = Object.getOwnPropertyDescriptor(dataItem, 'dom').get;
        const options = {};
        if (Object.prototype.hasOwnProperty.call(options, 'asClass'))
          options.asClass = dataItem.asClass;

        argumentArray.push([key, select, options]);
      });

      sandbox.instrument.add(argumentArray);
    },
  };
}

export default initializeStore;
