const CONTENT_TYPE_TO_RESPONSE_METHOD = {
  'application/json': 'json',
  'text/plain': 'text',
  'default': 'blob',
};

function getExtractionMethod(contentType) {
  return CONTENT_TYPE_TO_RESPONSE_METHOD[contentType] || CONTENT_TYPE_TO_RESPONSE_METHOD['default'];
}

const generateParser = (extractMethod) => (response) => response[extractMethod]().then(json => ({
  response,
  data: json,
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
  return function extractDecorator(target, key, description) {
    return {
      ...description,
      value(){
        return description.value.apply(this, arguments)
          .then(extracters[extractMethod]);
      },
    };
  };
}

export const extractText = generateDecorator('text');
export const extractJson = generateDecorator('json');
export const extractBlob = generateDecorator('blob');
export const extractAuto = generateDecorator('auto');
