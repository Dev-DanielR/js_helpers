# JS Helpers

A collection of light-weight helper functions designed to provide small DX improvements to browser clients running vanilla js.

The recommended way to install this repo is to clone with degit directly into your public assets folder.
```sh
cd /path/to/web/assets
degit https://github.com/Dev-DanielR/js_helpers.git js_helpers
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

Provides a wrapper around the Fetch API to simplify HTTP requests and robustly handle various payload formats.

#### API Reference

**`fetchRequest(spec, controller = null, data = null)`**
Performs an HTTP request with flexible input handling.

*   **`spec`**: The request specification string in the format `"METHOD:URL"` (e.g., `'POST:http://api.example.com'`).
*   **`controller`** (Optional): An `AbortController` to allow cancellation of the request.
*   **`data`** (Optional): The request payload. Supported types include:
    *   `FormData`: Sent directly as the request body.
    *   `string`: Treated as a CSS selector; used to construct `FormData`.
    *   `Object`: Encoded as `application/x-www-form-urlencoded`, unless it contains arrays, `File`, or `Blob`, in which case `multipart/form-data` is used.
    *   `null`: No request body is sent.

## Usage Examples

### `events.js` Example (Subscription)

```javascript
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

### `fetch.js` Example (POST Request with JSON Data)

```javascript
import { fetchRequest } from './fetch.js';

const payload = { username: 'alice', password: 'secret' };
const spec = 'POST:http://localhost:3000/api/login';

// data is an Object, handled as application/x-www-form-urlencoded
fetchRequest(spec, null, payload);
```
