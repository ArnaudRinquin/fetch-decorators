import test from 'tape';
import { bodify } from '../src';

test('@bodify', (t) => {

  class TestClass {
    @bodify
    echo(options) {
      return options;
    }
  }

  t.test('with a string', (t) => {
    t.plan(1);

    const subject = new TestClass();
    const data = 'anyString';
    const result = subject.echo(data);

    t.deepEqual(result, { body: data }, 'it should return the original string as body');
  });

  t.test('with an object', (t) => {
    t.plan(1);

    const subject = new TestClass();
    const data = {foo: 'bar'};
    const result = subject.echo(data);

    t.deepEqual(result, { body: JSON.stringify(data) }, 'it should return the stringified data as body');
  });

  t.test('with extra options', (t) => {
    t.plan(1);

    const subject = new TestClass();
    const data = {foo: 'bar'};
    const extraOptions = { method: 'POST' };
    const result = subject.echo(data, extraOptions);

    t.deepEqual(result, { body: JSON.stringify(data), method: 'POST' }, 'it should merge body and extra options');
  });

});
