export function fetchify(baseOptions) {
  return function(target, key, description) {
    return {
      ...description,
      value: function() {
        const url = description.value.apply(this, arguments);

        if (typeof url !== 'string') {
          throw new Error('@fetchify decorated functions must return a string, instead returned:', url);
        }

        return function(additionalOptions) {
          return fetch(url, {
            ...baseOptions,
            ...additionalOptions,
          });
        };
      },
    };
  };
}
