import test from 'tape';
import {
  extractJson,
  extractText,
  extractBlob,
  extractAuto,
} from '../src';

const samples = {
  blob: 'blob - foobar is my signature test value',
  json: {foo: 'bar'},
  text: 'foobar is my signature test value',
};

function makeFakeReponse(responses, contentType) {
  return {
    headers: {
      get() {
        return contentType;
      },
    },
    json: () => Promise.resolve(responses.json),
    text: () => Promise.resolve(responses.text),
    blob: () => Promise.resolve(responses.blob),
  };
}

test('@extractJson', (t) => {

  t.plan(2);

  const fakeResponse = makeFakeReponse(samples);

  class TestClass {
    @extractJson
    decorated() {
      return () => Promise.resolve(fakeResponse);
    }
  }

  const subject = new TestClass();

  subject.decorated()().then(function({response, data}) {
    t.equal(response, fakeResponse, 'the promise must resolve with original response');
    t.equal(data, samples.json, 'the promise must resolve with the response json');
  });

});

test('@extractText', (t) => {

  t.plan(2);

  const fakeResponse = makeFakeReponse(samples);

  class TestClass {
    @extractText
    decorated() {
      return () => Promise.resolve(fakeResponse);
    }
  }

  const subject = new TestClass();

  subject.decorated()().then(function({response, data}) {
    t.equal(response, fakeResponse, 'the promise must resolve with original response');
    t.equal(data, samples.text, 'the promise must resolve with the response text');
  });

});

test('@extractBlob', (t) => {

  t.plan(2);

  const fakeResponse = makeFakeReponse(samples);

  class TestClass {
    @extractBlob
    decorated() {
      return () => Promise.resolve(fakeResponse);
    }
  }

  const subject = new TestClass();

  subject.decorated()().then(function({response, data}) {
    t.equal(response, fakeResponse, 'the promise must resolve with original response');
    t.equal(data, samples.blob, 'the promise must resolve with the response blob');
  });

});

test('@extractAuto', (t) => {

  t.plan(6);

  const fakeJsonResponse = makeFakeReponse(samples, 'application/json');
  const fakeTextResponse = makeFakeReponse(samples, 'text/plain');
  const fakeNoContentTypeResponse = makeFakeReponse(samples, null);

  class TestClass {
    @extractAuto
    jsonContentType() {
      return () => Promise.resolve(fakeJsonResponse);
    }

    @extractAuto
    textContentType() {
      return () => Promise.resolve(fakeTextResponse);
    }

    @extractAuto
    noContentType() {
      return () => Promise.resolve(fakeNoContentTypeResponse);
    }
  }

  const subject = new TestClass();

  subject.jsonContentType()().then(function({response, data}) {
    t.equal(response, fakeJsonResponse, 'the promise must resolve with original response');
    t.equal(data, samples.json, 'the promise must resolve with the response json');
  });

  subject.textContentType()().then(function({response, data}) {
    t.equal(response, fakeTextResponse, 'the promise must resolve with original response');
    t.equal(data, samples.text, 'the promise must resolve with the response text');
  });

  subject.noContentType()().then(function({response, data}) {
    t.equal(response, fakeNoContentTypeResponse, 'the promise must resolve with original response');
    t.equal(data, samples.blob, 'the promise must resolve with the response blob');
  });

});
