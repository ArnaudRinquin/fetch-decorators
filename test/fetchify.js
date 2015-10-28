import { fetchify } from '../src';
import test from 'tape';
import fetchMock from 'fetch-mock';

test('@fetchify', (t) => {

  const responseBody = {received: 'data'};
  const requestBody = 'stuff';
  const baseOptions = {base: 'options'};

  fetchMock.mock([
    {
      name: 'regular',
      matcher: '/regular',
      response: {
        body: responseBody,
        status: 200,
      },
    },
    {
      name: 'custom',
      matcher: '/custom',
      response: {
        body: responseBody,
        status: 200,
      },
    },
  ]);

  class TextClass {
    @fetchify()
    simplest(){
      return '/regular';
    }

    @fetchify()
    originalArgs(firstHalf){
      return `${firstHalf}tom`;
    }

    @fetchify(baseOptions)
    baseOptions(){
      return '/regular';
    }

    @fetchify()
    willThrow() {
      return true;
    }
  }

  const subject = new TextClass();

  t.test('simplest case', (t) => {

    fetchMock.reset();
    t.plan(4);

    subject.simplest()().then((response) => {
      t.ok(response.json, 'it returns the original response');

      const calls = fetchMock.calls('regular');
      t.equal(calls.length, 1, 'it should call fetch once');

      const [url, options] = calls[0];
      t.equal(url, '/regular', 'it should call the right url');
      t.deepEqual(options, {}, 'it should send no meaningless options');
    });
  });

  t.test('orignal args', (t) => {
    fetchMock.reset();
    t.plan(1);
    subject.originalArgs('/cus')().then(() => {
      const [url] = fetchMock.calls('custom')[0];
      t.equal(url, '/custom', 'it should use original args on original function');
    });
  });

  t.test('base options', (t) => {
    fetchMock.reset();
    t.plan(1);

    subject.baseOptions()().then(() => {
      const options = fetchMock.calls('regular')[0][1];
      t.deepEqual(options, baseOptions, 'it should send the base options');
    });
  });

  t.test('additional options', (t) => {
    fetchMock.reset();
    t.plan(1);

    const additionalOptions = { body: requestBody };

    subject.baseOptions()(additionalOptions).then(() => {
      const expectedOptions = {
        ...baseOptions,
        ...additionalOptions,
      };

      const options = fetchMock.calls('regular')[0][1];
      t.deepEqual(options, expectedOptions, 'it should merge additional options in used options');
    });
  });

  t.test('ensure url is returned', (t) => {
    fetchMock.reset();
    t.plan(1);

    try {
      subject.willThrow()().then(() => {
        t.bail('promise succeded will it should not have');
      });
    } catch(e) {
      t.ok('it should throw an error if decorated function does return a string');
    }
  });
});
