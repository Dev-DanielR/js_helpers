/**
 * Performs an HTTP request using the Fetch API.
 *
 * @param {string} spec - Combined request specification string in the format "METHOD URL".
 *   - METHOD: e.g. "GET", "POST", "PUT", "DELETE"
 *   - URL: full request URL (can include protocol, port, query params, etc.)
 *
 * @param {AbortSignal|null} [signal=null] - Optional abort signal to allow request cancellation.
 *
 * @param {Object|Object[]} [headers={}] - Request headers.
 *   - Can be a single plain object: `{ 'Authorization': 'Bearer token' }`
 *   - Or an array of objects: `[ { 'Authorization': 'Bearer token' }, { 'Content-Type': 'application/json' } ]`
 *   - If multiple objects are provided, they are merged left-to-right.
 *
 * @param {Object|FormData|string|null} [data=null] - Request body.
 *   - Requires a `Content-Type` header to encode the data correctly.
 *   - If `application/json`: encoded with `JSON.stringify`.
 *   - If `application/x-www-form-urlencoded`: encoded with `URLSearchParams`.
 *   - If `multipart/form-data`: converted to `FormData`.
 *   - If `null` or omitted: no body is sent.
 *
 * @returns {Promise<Response>} A promise resolving to the Fetch API `Response` object.
 *
 * @throws {Error} If `spec` is invalid or if `Content-Type` is missing/unsupported.
 *
 * @example
 * // Simple GET request
 * fetchRequest('GET https://api.example.com/items');
 *
 * @example
 * // POST request with JSON body
 * fetchRequest('POST https://api.example.com/login', null, [
 *   { 'Content-Type': 'application/json' }
 * ], {
 *   username: 'alice',
 *   password: 'secret'
 * });
 *
 * @example
 * // Multipart form upload
 * fetchRequest('POST https://api.example.com/upload', null, [
 *   { 'Content-Type': 'multipart/form-data' }
 * ], {
 *   file: myFile,
 *   description: 'Test upload'
 * });
 *
 * @example
 * // Array of headers objects
 * fetchRequest('POST https://api.example.com/login', null, [
 *   { 'Authorization': 'Bearer token' },
 *   { 'Content-Type': 'application/json' }
 * ], {
 *   username: 'test_user',
 *   password: 'secret'
 * });
 */
function fetchRequest(spec, signal = null, headers = {}, data = null) {
    const [method, url] = spec.split(' ', 2);
    if (!url) throw new Error('Invalid spec format. Use "METHOD URL".');

    const payload = { method };
    if (signal) payload.signal = signal;

    if (headers) {
        if (!Array.isArray(headers)) payload.headers = { ...headers };
        else payload.headers = Object.assign({}, ...headers);
    }

    if (data) {
        if (!payload.headers['Content-Type']) {
            throw new Error('Missing Content-Type header');
        }

        const contentType = payload.headers['Content-Type'];
        if (contentType === 'application/json') {
            payload.body = JSON.stringify(data);
        }
        else if (contentType === 'application/x-www-form-urlencoded') {
            payload.body = new URLSearchParams(data).toString();
        }
        else if (contentType === 'multipart/form-data') {
            payload.body = new FormData();
            for (const k in data) {
                const val = data[k];
                if (!Array.isArray(val)) payload.body.append(k, val);
                else val.forEach(item => payload.body.append(k, item));
            }
            delete payload.headers['Content-Type']; //Remove so the browser sets boundary
        }
        else {
            throw new Error(`Unsupported Content-Type ${contentType}`);
        }
    }
    return fetch(url, payload);
}

/**
 * Creates a header object that disables caching for HTTP requests.
 *
 * @returns {Object} Header object with `Cache-Control` set to `"no-cache"`.
 *
 * @example
 * // Force the request to bypass caches
 * const headers = headerNoCache();
 * // { 'Cache-Control': 'no-cache' }
 */
function headerNoCache() {
    return { 'Cache-Control': 'no-cache' };
}


/**
 * Creates an Authorization header object for Bearer tokens.
 *
 * @param {string} token - The bearer token string.
 * @returns {Object} Header object with `Authorization` set.
 *
 * @example
 * const headers = headerAuthorize('myToken');
 * // { Authorization: 'Bearer myToken' }
 */
function headerAuthorize(token) {
    return { 'Authorization' : `Bearer ${token}` };
}

/**
 * Builds Content-Type and Accept headers from shorthand type names.
 *
 * @param {string} outgoing - Shorthand for the request body type.
 *   - Supported: "json", "form-urlencoded", "form-data", "html", "text"
 * @param {string} incoming - Shorthand for the expected response type.
 *   - Supported: same as above
 * @returns {Object} Header object with `Content-Type` and `Accept`.
 *
 * @throws {Error} If either shorthand is unsupported.
 *
 * @example
 * const headers = headerTypes('json', 'html');
 * // { 'Content-Type': 'application/json', 'Accept': 'text/html' }
 */
function headerTypes(outgoing, incoming) {
    const types = {
        'json'            : 'application/json',
        'form-urlencoded' : 'application/x-www-form-urlencoded',
        'form-data'       : 'multipart/form-data',
        'html'            : 'text/html',
        'text'            : 'text/plain',
    };

    if (!types[outgoing]) throw new Error(`Unsupported outgoing type: ${outgoing}`);
    if (!types[incoming]) throw new Error(`Unsupported incoming type: ${incoming}`);
    return { 'Content-Type': types[outgoing], 'Accept': types[incoming] };
}