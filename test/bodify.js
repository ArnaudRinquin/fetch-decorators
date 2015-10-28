import test from 'tape';
import { bodify } from '../src';

test('@bodify', (t) => {

  class TestClass {
    @bodify
    echo(original) {
      return function(options) {
        return {
          original,
          options,
        };
      };
    }
  }

  t.test('with a string', (t) => {
    t.plan(2);

    const subject = new TestClass();
    const data = 'anyString';
    const args = 'settings';
    const {options, original} = subject.echo(args)(data);

    t.deepEqual(options, { body: data }, 'it should return the original string as body');
    t.deepEqual(original, args, 'it should transmit original settings');
  });

  t.test('with an object', (t) => {
    t.plan(2);

    const subject = new TestClass();
    const data = {foo: 'bar'};
    const args = 'settings';
    const {options, original} = subject.echo(args)(data);

    t.deepEqual(options, { body: JSON.stringify(data) }, 'it should return the stringified data as body');
    t.deepEqual(original, args, 'it should transmit original settings');
  });

  t.test('with extra options', (t) => {
    t.plan(2);

    const subject = new TestClass();
    const data = {foo: 'bar'};
    const args = 'settings';
    const extraOptions = { method: 'POST' };
    const {options, original} = subject.echo(args)(data, extraOptions);

    t.deepEqual(options, { body: JSON.stringify(data), method: 'POST' }, 'it should merge body and extra options');
    t.deepEqual(original, args, 'it should transmit original settings');
  });

});
