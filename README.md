# fetch-decorators

[![npm package](http://img.shields.io/npm/v/fetch-decorators.svg)](https://www.npmjs.com/package/fetch-decorators)
[![Build Status](https://img.shields.io/travis/ArnaudRinquin/fetch-decorators.svg)](https://travis-ci.org/ArnaudRinquin/fetch-decorators)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Code Climate](https://img.shields.io/codeclimate/github/ArnaudRinquin/fetch-decorators.svg)](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/github/ArnaudRinquin/fetch-decorators.svg)](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators/coverage)
[![npm package](http://img.shields.io/npm/l/fetch-decorators.svg)](https://www.npmjs.com/package/fetch-decorators)

A set of [composable](#composition) [ES7 decorators](https://github.com/wycats/javascript-decorators) around the `fetch` api

Automate things request and response body parsing so you don't have to.

No dependency (oh, except a [fetch polyfill](https://github.com/github/fetch) maybe)

## Usage TL;DR:

```sh
npm i -S fetch-decorators
```

```js
class Messages {
  @extractJson
  @bodify
  @fetchify({method: 'POST'})
  post(userId) {
    return `/users/${userId}/messages`;
  }
}

const messages = new Messages();

messages.post('ArnaudRinquin')({
  content: 'Hello World',
  public: true,
  draft: false,
}).then(({response, data}) => {
  // response === the original fetch response
  // data === the JSON object returned by the server
});

```

## Decorators

* [`@fetchify`](#fetchifyoptionsobject): decorates a function returning a url to a `fetch` call with your options.
* [`@bodify`](#bodify): prepare passed data (and extra options) into fetch-ready body options.
* [`@extractJson`, `@extractText,` `@extractBlob`](#extractjson-extracttext-extractblob): decorates a function returning a `Response` to extract its result as json, text or blob.
* [`@extractAuto`](#extractauto): decorates a function returning a `Response` to extract its result automatically based on response `Content-Type` header.

These decorators have been designed to be [composable](#composition), give it a try!

### @fetchify(options:?object)

This helper wraps the original function into a fetch call so it may just return a string, and then be called with optional data, headers, options.


`(originalArgs) => url:string`

becomes:

`(originalArgs) => (options:?object) => fetchResponse:promise`

```js
import { fetchify } from 'fetch-decorators';

class Users {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  @fetchify()
  get(userId) {
    return `${this.baseUrl}/users/${userId}`;
  }

  @fetchify({
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  create() {
    return `${this.baseUrl}/users`;
  }
}

const userApi = new UserApi('/api');

userApi.createUser()({
  body: JSON.stringify({
    firstName: 'Walter',
    lastName: 'White',
  }
})).then(function(response){
  // Regular `fetch` response
);

userApi.getUser('fakeUserId123')().then(function(response){
  // Regular `fetch` response
});
```

### @bodify

Takes body data and options and calls the decorated function with a proper fetch `options` object where `options.body` is passed data as a string.

`(options) => orignalResult`

becomes:

`(originalArgs) => (data:object, extraOptions:?object) => orignalResult(options)`

```js
import { bodify } from 'fetch-decorators';

class Messages {
  @bodify
  create(userId) {
    return function(options) {
      return fetch(`/api/users/${userId}/messages`, options);
    };
  }
}

const messages = new Messages();
const messages = {
  content: 'Hello',
  draft: false,
};
const options = { method: 'POST' };

users.create('fakeUserId')(message, options).then(function(response){
  // response === the original fetch response
});
```

### @extractJson, @extractText, @extractBlob

These decorators wrap functions returning a fetch promise with the matching Response extraction function.

`(originalArgs) => fetchResponse:promise`

becomes:

`(originalArgs) => extractionResult:promise`

where the `extractionResult` promise resolves with : `{response:Response, data:any}`

```js
import { extractJson } from 'fetch-decorators';

class Users {
  @extractJson
  get(userId) {
    return fetch(`/api/users/${userId}`);
  }
}

const users = new Users();

users.get('userId123').then(function({response, data}){
  // response === the original fetch response
  // data === the extracted data, here a `user` JSON object
});

```

### @extractAuto

This extractor has the same signature and behaviour as other extractors but will use the Reponse `Content-Type` header to determine the right Response method to use for data extraction.

Content types are matched this way:

```
'application/json': 'json'
'text/plain': 'text'
'default': 'blob'
```

## Composition

All these decorators where designed so it's easy to use them together, just stack them! _Note: obviously, the order matters._

```js
import {
  fetchify,
  bodify,
  extractJson,
} from 'fetch-decorators';

class Messages {
  @extractJson
  @bodify
  @fetchify({method: 'POST'})
  post(userId) {
    return `/users/${userId}/messages`;
  }

  // Approximate equivalent without decorators
  // Thanks to ES6, the volume of code is roughly the same
  // But the complexity is higher and you'll probably
  // have a lot of code duplication
  mehPost(userId, data, extraOptions) {
    return fetch(`/users/${userId}/messages`, {
      method: 'POST',
      ...extraOptions,
      body: JSON.stringify(data),
    }).then((response) => response.json());
  }
}

const messagesApi = new Messages();

// Request body, as an object
const message = {
  content: 'Hello World',
  public: true,
  draft: false,
};

// Some extra options
const authHeaders = {
  headers: {
    'X-AUTH-MUCH-SECURE': '123FOO456BAR',
  },
};

messagesApi.post('ArnaudRinquin')(message, authHeaders).then(({response, data}) => {
  // response === the original fetch response
  // data === the JSON object returned by the server
});
```

##  FAQ

> Is it just syntactic sugar?

Yes.

> I have a more complex case where my [ headers are dynamic | I have to change fetch options | whatever ]. How do I do?

Then you should manually write your call to `fetch` instead of shoehorning these decorators in your code.
