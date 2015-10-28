export function bodify(target, key, description) {
  return {
    ...description,
    value: function() {
      const originalResult = description.value.apply(this, arguments);

      return function(data, extraOptions) {

        let body = data;

        if (typeof data !== 'string') {
          body = JSON.stringify(data);
        }

        const options = {
          ...extraOptions,
          body,
        };

        return originalResult(options);
      };
    },
  };
}
