# fetch-decorators

[![Build Status](https://travis-ci.org/ArnaudRinquin/fetch-decorators.svg)](https://travis-ci.org/ArnaudRinquin/fetch-decorators)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Code Climate](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators/badges/gpa.svg)](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators)
[![Test Coverage](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators/badges/coverage.svg)](https://codeclimate.com/github/ArnaudRinquin/fetch-decorators/coverage)

A set of composable [ES7 decorators](https://github.com/wycats/javascript-decorators) around the `fetch` api

## Decorators

* `@fetchify`: decorates a function returning a url to a `fetch` call with your options.
* `@extractJson`: decorates a function returning a `Response` to extract its result as json.
* `@extractText`: decorates a function returning a `Response` to extract its result as text.
* `@extractBlob`: decorates a function returning a `Response` to extract its result as blob.
* `@extractAuto`: decorates a function returning a `Response` to extract its result automatically based on response content type.
* `@bodify`: prepare passed data (and extra options) into fetch-ready body options.

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

### @bodify

Takes body data and options and calls the decorated function with a proper fetch `options` object where `options.body` is passed data as a string.

`(options) => orignalResult`

becomes:

`(data:object, extraOptions:?object) => orignalResult`

```js
import { bodify } from 'fetch-decorators';

class Users {
  @bodify
  create(options) {
    return fetch(`/api/users/`, options);
  }
}

const users = new Users();
const userData = {
  firstName: 'Jessie',
  lastName: 'Pinkman',
};
const options = { method: 'POST' };

users.create(userData, options).then(function(response){
  // response === the original fetch response
});
```

##  FAQ

> Is it just syntactic sugar?

Yes.

> I have a more complex case where my [ headers are dynamic | I have to change fetch options | whatever ]. How do I do?

Then you should manually write your call to `fetch` instead of shoehorning these decorators in your code.
