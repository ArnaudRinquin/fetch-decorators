const CONTENT_TYPE_TO_RESPONSE_METHOD = {
  'application/json': 'json',
  'text/plain': 'text',
  'default': 'blob',
};

function getExtractionMethod(contentType) {
  return CONTENT_TYPE_TO_RESPONSE_METHOD[contentType] || CONTENT_TYPE_TO_RESPONSE_METHOD['default'];
}

const generateParser = (extractMethod) => (response) => response[extractMethod]().then(data => ({
  response,
  data,
}));

export const extracters = {
  json: generateParser('json'),
  text: generateParser('text'),
  blob: generateParser('blob'),
  auto: function extractAuto(response) {
    const contentType = response.headers.get('Content-Type');
    const extractMethod = getExtractionMethod(contentType);
    return generateParser(extractMethod)(response);
  },
};

function generateDecorator(extractMethod) {

  const makeWrapper = (originalFn) => {
    return () => {
      const result = originalFn.apply(this, arguments);
      if (typeof result === 'function') {
        return makeWrapper(result);
      }
      if(typeof result.then === 'function') {
        return result.then(extracters[extractMethod]);
      }
      if(typeof result[extractMethod]) {
        return extracters[extractMethod](result);
      }

      throw new Error('Can not extract data or propagate extraction');
    };
  };


  return function extractDecorator(target, key, description) {
    return {
      ...description,
      value: makeWrapper(description.value),
    };
  };
}

export const extractText = generateDecorator('text');
export const extractJson = generateDecorator('json');
export const extractBlob = generateDecorator('blob');
export const extractAuto = generateDecorator('auto');
