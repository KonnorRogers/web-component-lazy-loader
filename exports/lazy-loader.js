// @ts-check

/**
 * @typedef {object} LazyComponent
 * @property {(tagName: string) => void | Promise<void>} register - The function that registers the component.
 * @property {boolean} [force] - If we should skip the check to see if it's already been defined.
 */

/**
 * @typedef {Map<string, LazyComponent>} LazyComponentMap
 */

/**
 * @typedef {Element | ShadowRoot | Document} RootElement
 */

/**
 * Base implementation of the lazy loader.
 * Feel free to grab this if you want to extend the lazy loader implementation.
 */
export default class LazyLoaderClass {
  /**
   * @param {{ rootElement?: RootElement, components?: Record<string, LazyComponent> }} [options={}]
   */
  constructor(options = {}) {
    /**
     * @type {MutationObserver}
     */
    this.observer = new MutationObserver((mutations) => {
      for (const { addedNodes } of mutations) {
        for (const node of Array.from(addedNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.register(/** @type {Element} */ (node).tagName.toLowerCase());
          }
        }
      }
    });

    /**
     * @type {LazyComponentMap}
     */
    this.components = new Map(Object.entries(options.components || {}));

    /**
     * @type {RootElement}
     */
    this.rootElement = options.rootElement ? options.rootElement : document;

    /**
     * @type {boolean}
     */
    this.running = false;
  }

  // Annoying work around to using real setters.
  /**
   * Overwrite the existing "components" on the LazyLoader.
   * @param {Record<string, LazyComponent>} obj - Converts the components object to a map.
   */
  setComponents(obj) {
    this.components = new Map(Object.entries(obj || {}));
    this.initialCheck();
  }

  /**
   * Start listening for new tags and perform and initial dom check.
   * @return {LazyLoaderClass}
   */
  start() {
    // Listen for new undefined elements
    this.observer.observe(this.rootElement, { subtree: true, childList: true });
    this.running = true;
    this.initialCheck(this.rootElement);
    return this;
  }

  /**
   * @return {LazyLoaderClass}
   */
  stop() {
    this.observer.disconnect();
    this.running = false;
    return this;
  }

  /**
   * @param {string} tagName
   * @return {void}
   */
  register(tagName) {
    const component = this.components.get(tagName);

    if (component == null) return;

    if (this.shouldRegister(tagName)) {
      component.register(tagName);
    }
  }

  /**
   * Depending on when our LazyLoader starts, we may need to first run through the DOM
   * and check that there's nothing we need to register.

   * @param {RootElement} [root=document] - The root element to attach the mutation observer. Defaults to document, but could also be attached to a shadowRoot or child element.
   */
  initialCheck(root = document) {
    if (this.running === false) return;

    /** @type {string | undefined} */
    let rootTagName;

    if ("tagName" in root) {
      rootTagName = /** @type {string | undefined} */ (
        root.tagName.toLowerCase()
      );
    }

    if (rootTagName) {
      this.register(rootTagName);
    }

    const query = this.tagNames.join(", ");

    // Can't pass an empty querySelector.
    if (!query) return;

    // Grab all tags found, throw them in a Set so we get unique values only.
    const tags = new Set(
      Array.from(root.querySelectorAll(query)).map((el) =>
        el.tagName.toLowerCase(),
      ),
    );

    // Now iterate and register.
    tags.forEach((tagName) => {
      this.register(tagName);
    });
  }

  /**
   * Grab all tag names registered in components
   * @return {string[]}
   */
  get tagNames() {
    return [...this.components.keys()];
  }

  /**
   * Checks if we should register the component based on if "force" is true, or if its already registered.
   * if true, then we should call the register function next.
   * @param {string} tagName
   * @return {boolean}
   */
  shouldRegister(tagName) {
    const component = this.components.get(tagName);

    if (component == null) return false;
    if (component.force) return true;

    return !customElements.get(tagName);
  }
}
