# JS Helpers

A collection of light-weight helper functions designed to provide small DX improvements to browser clients running vanilla js.

## Installation

The recommended way to install this repository is using [degit](https://github.com/Rich-Harris/degit):

```sh
cd /path/to/web/assets
degit https://github.com/Dev-DanielR/js_helpers.git/src js_helpers
```

## Current helpers

### `events.js`

Provides utilities for subscribing to, matching, and dispatching custom DOM events.

#### API Reference

**`subscribe(spec, match, func)`**
Subscribes a handler function to a specific event with optional filtering logic.

*   **`spec`**: The event specification string in the format `"eventName:phase+control"` (e.g., `'click:capture+block'`).
    *   `eventName`: The name of the DOM event (e.g., `click`).
    *   `phase`: `"bubble"` (default) or `"capture"`.
    *   `control`: `"default"`, `"block"`, `"prevent"`, or `"stop"`.
*   **`match`** (Optional): A predicate function to filter events based on the event details.
*   **`func`**: The callback function executed when an event matches.
*   Returns: A cleanup function that removes the event listener.

**Event Matching Predicates:**
The module provides pre-defined functions for matching events against DOM targets or detail data:

*   `matchExactTarget(ref)`: Matches if `e.target` is exactly the reference element.
*   `matchContainsTarget(ref)`: Matches if `e.target` is contained within the reference element.
*   `matchClosestTarget(ref)`: Matches based on the tag and class of the target's closest ancestor.
*   `matchDetailId(id)`: Matches if `e.detail.id` equals the provided ID.
*   `matchExists(obj)`: Matches if an object is defined (not `undefined`).

**`launch(name, data, controller = null)`**
Dispatches a custom DOM event with optional data and supports cancellation via an `AbortController`.

### `fetch.js`

Provides a wrapper around the native Fetch API to simplify HTTP requests and handle various payload formats (JSON, URL-encoded, FormData).

#### API Reference

**`fetchRequest(spec, signal = null, headers = {}, data = null)`**
Performs an HTTP request with flexible input handling.

*   **`spec`**: The request specification string in the format `"METHOD URL"` (e.g., `'POST https://api.example.com'`).
*   **`signal`** (Optional): An `AbortSignal` to allow request cancellation.
*   **`headers`** (Optional): Request headers, provided as an object or array of objects.
*   **`data`** (Optional): The request payload. Supported types are:
    *   `Object`: Encoded as `application/x-www-form-urlencoded`.
    *   `FormData`: Sent directly as the request body (for `multipart/form-data`).
    *   `string`: Used to construct form data.
    *   `null`: No request body is sent.

**Header predicates:**
The module provides pre-defined functions to generate commonly used headers:

*   `headerNoCache()`: Sets `Cache-Control` to `no-cache`.
*   `headerAuthorize(token)`: Sets `Authorization` to `Bearer <token>`
*   `headerTypes(outgoing, incoming)`: Sets 'Content-Type' and 'Accept' via shorthands: `json`, `form-urlencoded`, `form-data`, `html`, `text`.

## Usage Examples

### `events.js` Example (Suscribe to div click )

```js
import { subscribe, matchExactTarget } from './events.js';

const myDiv = document.getElementById('my-target');

// Subscribe to clicks on the exact target element
const unsubscribe = subscribe(
    'click',
    matchExactTarget(myDiv),
    () => console.log('Exact div clicked')
);

// Later, remove the listener
unsubscribe();
```

### `fetch.js` Example (Cancellable POST request with headers and JSON data)

```js
import { fetchRequest, headerAuthorize, headerTypes } from './fetch.js';

const controller = new AbortController();

//Performs the fetch request
fetchRequest(
    'POST https://api.example.com/login',
    controller.signal,
    [headerAuthorize('my_secret_123'), headerTypes('json', 'json')],
    { username: 'alice', password: 'secret' }
).then(async res => {
    const { success, error } = await res.json();
    console.log(success ? 'Login OK!' : error);
});

//Cancel request if timeout is exceeded
setTimeout(() => {
    console.log('Could not login!');
    controller.abort();
}, 1000);
```