# fetch-decorators

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A set of [ES7 decorators](https://github.com/wycats/javascript-decorators) around the `fetch` api

## Decorators

* `@request`: decorates a function returning a url to a `fetch` request with your options and data.
* `@parseJson`: decorates a function returning a `Response` to parse its result to json.
* `@parseText`: decorates a function returning a `Response` to parse its result to text.
* `@parseBlob`: decorates a function returning a `Response` to parse its result to blob.
* `@parseAuto`: decorates a function returning a `Response` to parse its result automatically based on response content type.
* `@jsonStringify`: stringify the first (or more) argument so you don't have to.

### @request(options:?object)

This helper wraps the original function into a fetch call so it may just return a string, and then be called with optional data, headers, options.


`(originalArgs) => url:string`

becomes:

`(originalArgs) => (data:?string, options:?object) => fetchResponse:promise`

```js
class Users {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  @request()
  get(userId) {
    return `${this.baseUrl}/users/${userId}`;
  }

  @request({
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

// Later...

const userApi = new UserApi('/api');

userApi.createUser()(JSON.stringify({
  firstName: 'Walter',
  lastName: 'White',
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

### @jsonStringify(argsCount:?int=1)

This helper will wrap original function so the first `argsCount` passed arguments are passed through `JSON.stringify` before they are to original function.

`(arg0:string, arg1:any, ...) => orignalResult`

becomes:

`(arg0:object, arg1:any, ...) => orignalResult`

##  FAQ

> Is it just syntactic sugar?

Yes.

> I have a more complex case where my [ headers are dynamic | I have to change fetch options | whatever ]. How do I do?

Then you should manually write your call to `fetch` instead of shoehorning these decorators in your code.
