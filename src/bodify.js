export function bodify(target, key, description) {
  return {
    ...description,
    value: function(data, extraOptions) {

      let body = data;

      if (typeof data !== 'string') {
        body = JSON.stringify(data);
      }

      const options = {
        ...extraOptions,
        body,
      };

      return description.value.call(this, options);
    },
  };
}
