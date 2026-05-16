/**
 * Subscribes to a DOM event with custom matching and control flags.
 *
 * @param {string} spec - Combined event specification string in the format:
 *   "eventName:phase+control"
 *   - eventName: e.g. "click"
 *   - phase: "bubble" (default) or "capture"
 *   - control: "default", "block", "prevent", or "stop"
 * @param {(e: Event) => boolean} [match] - Optional predicate function to filter events.
 * @param {(e: Event) => void} func - The callback function to execute when the event matches.
 * @returns {() => void} A function that removes the event listener when called.
 *
 * @example
 * // Subscribe to clicks in capture phase, blocking default behavior
 * const unsubscribe = subscribe(
 *   'click:capture+block',
 *   matchDetailId('main_modal'),
 *   () => Modal_open(id)
 * );
 *
 * // Later, remove the listener
 * unsubscribe();
 */
function subscribe(spec, match, func) {
    const [name, flags = 'bubble+default'] = spec.split(':');
    const [phase, control] = flags.split('+');

    const handler = e => {
        if (e.detail?.signal?.aborted) return;
        if (!match || match(e)) {
            if (['block', 'prevent'].includes(control)) e.preventDefault();
            if (['block', 'stop'].includes(control))    e.stopPropagation();
            func(e);
        }
    };

    const options = { capture: phase === 'capture' };
    document.addEventListener(name, handler, options);
    return () => document.removeEventListener(name, handler, options);
}


/**
 * Dispatches a custom DOM event with optional data and abort controller.
 *
 * @param {string} name - The name of the event to dispatch.
 * @param {Object} data - The detail payload to attach to the event.
 * @param {AbortController} [controller=null] - Optional AbortController to attach a signal for cancellation.
 * @returns {void}
 *
 * @example
 * // Launch a custom event with data
 * launch('user_login', { id: 42, username: 'alice' });
 *
 * // Launch with an AbortController
 * const controller = new AbortController();
 * launch('task_start', { taskId: 'abc123' }, controller);
 * controller.abort(); // Cancels downstream listeners
 */
function launch(name, data, controller = null) {
    if (controller) data.signal = controller.signal;
    document.dispatchEvent(new CustomEvent(name, { detail: data }));
}

/**
 * Matches events where the target is exactly the given reference element.
 *
 * @param {Element} ref - The reference element to match against.
 * @returns {(e: Event) => boolean} Predicate function for event matching.
 *
 * @example
 * subscribe('click', matchExactTarget(myDiv), e => console.log('Exact div clicked'));
 */
const matchExactTarget = ref => e => e.target === ref;

/**
 * Matches events where the target is contained within the given reference element.
 *
 * @param {Element} ref - The reference element to check containment.
 * @returns {(e: Event) => boolean} Predicate function for event matching.
 *
 * @example
 * subscribe('click', matchContainsTarget(container), e => console.log('Click inside container'));
 */
const matchContainsTarget = ref => e => ref.contains(e.target);

/**
 * Matches events where the target's closest ancestor matches the reference element's tag and class.
 *
 * @param {Element} ref - The reference element whose tag and class are used for matching.
 * @returns {(e: Event) => boolean} Predicate function for event matching.
 *
 * @example
 * subscribe('click', matchClosestTarget(myButton), e => console.log('Closest match triggered'));
 */
const matchClosestTarget = ref => e => e.target.closest(ref.tagName.toLowerCase() + '.' + ref.className);

/**
 * Matches events where the event detail contains a specific ID.
 *
 * @param {string|number} id - The ID to match against the event detail.
 * @returns {(e: Event) => boolean} Predicate function for event matching.
 *
 * @example
 * subscribe('task_done', matchDetailId('abc123'), e => console.log('Task completed'));
 */
const matchDetailId = id => e => e.detail?.id === id;

/**
 * Matches events if the given object exists (is not undefined).
 *
 * @param {*} obj - The object to check for existence.
 * @returns {() => boolean} Predicate function that returns true if the object is defined.
 *
 * @example
 * const myObj = { foo: 'bar' };
 * subscribe('init', matchExists(myObj), e => console.log('Object exists!'));
 */
const matchExists = obj => () => obj !== undefined;
