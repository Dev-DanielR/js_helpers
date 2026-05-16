/**
 * Performs an HTTP request using the Fetch API with flexible data handling.
 *
 * @param {string} spec - Combined request specification string in the format "METHOD:URL".
 *   - METHOD: e.g. "GET", "POST", "PUT", "DELETE"
 *   - URL: full request URL (can include protocol, port, query params, etc.)
 * @param {AbortController} [controller=null] - Optional AbortController to allow request cancellation.
 * @param {FormData|string|Object|null} [data=null] - Request payload:
 *   - `FormData`: sent directly
 *   - `string`: treated as a CSS selector for a form, converted to `FormData`
 *   - `Object`: encoded as `application/x-www-form-urlencoded` unless it contains arrays, `File`, or `Blob`, in which case multipart `FormData` is used
 *   - `null`: no body is sent
 * @returns {Promise<Response>} A promise resolving to the Fetch API `Response` object.
 *
 * @example
 * // GET request to localhost
 * fetchRequest('GET:http://localhost:3000/api/items');
 *
 * @example
 * // POST request with data
 * fetchRequest('POST:http://localhost:3000/api/login', null, { username: 'alice', password: 'secret' });
 */
function fetchRequest(spec, controller = null, data = null) {
    const colonIndex = spec.indexOf(':');
    if (colonIndex === -1) throw new Error('Invalid spec format. Use "METHOD:URL".');

    const method = spec.slice(0, colonIndex).toUpperCase();
    const url    = spec.slice(colonIndex + 1);

    const payload = { method };
    if (controller) payload.signal = controller.signal;

    if (data !== null) {
        if (data instanceof FormData) {
            payload.body = data;
        }
        else if (typeof data === 'string') {
            payload.body = new FormData(document.querySelector(data));
        }
        else if (typeof data === 'object') {
            const isMultipart = Object.values(data).some(v =>
                Array.isArray(v) || v instanceof File || v instanceof Blob
            );

            if (isMultipart) {
                payload.body = new FormData();
                for (const k in data) {
                    const val = data[k];
                    if (!Array.isArray(val)) payload.body.append(k, val);
                    else val.forEach(item => payload.body.append(k, item));
                }
            } else {
                payload.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                payload.body    = new URLSearchParams(data).toString();
            }
        }
        else {
            throw new Error('Unsupported data type for httpRequest');
        }
    }
    return fetch(url, payload);
}