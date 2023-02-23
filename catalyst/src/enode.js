function initializeENode(sandbox) {
  const { warn } = sandbox;

  function makeElements(HTMLString, typeSingle = false) {
    const template = document.createElement('template');
    try {
      template.innerHTML = HTMLString.trim();
    } catch {
      warn('create elements: invalid HTML string', HTMLString);
      return [];
    }
    const array = Array.from(template.content.children);
    if (typeSingle) return [array[0]];
    return array;
  }

  function evaluateSingle(XPathString, contextElement) {
    const relativeXPathString =
      XPathString[0] !== '.' ? `.${XPathString}` : XPathString;
    let result;
    try {
      result = document.evaluate(
        relativeXPathString,
        contextElement,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
    } catch {
      warn(
        `evaluate single: '${relativeXPathString}' is not a valid XPath expression`,
      );
    }
    return [result];
  }

  function evaluateMultiple(XPathString, contextElement) {
    const relativeXPathString =
      XPathString[0] !== '.' ? `.${XPathString}` : XPathString;
    let result;
    try {
      result = document.evaluate(
        relativeXPathString,
        contextElement,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );
    } catch {
      warn(
        `evaluate multiple: '${relativeXPathString}' is not a valid XPath expression`,
      );
      return [];
    }
    const length = result.snapshotLength;
    const array = new Array(length);
    for (let i = 0; i < length; i += 1) {
      array[i] = result.snapshotItem(i);
    }
    return array;
  }

  function querySingle(select, contextElement) {
    let result;
    try {
      const query = contextElement.querySelector(select);
      result = query ? [query] : [];
    } catch {
      warn(`query single: '${select}' is not a valid selector`);
      result = [];
    }
    return result;
  }

  function queryMultiple(select, contextElement) {
    let result;
    try {
      result = contextElement.querySelectorAll(select);
    } catch {
      warn(`query multiple: '${select}' is not a valid selector`);
      return [];
    }
    return Array.from(result);
  }

  function handleArrayLike(select, typeSingle) {
    const array = Array.from(select);
    return typeSingle ? [array[0]] : array;
  }

  function toNodeArray(select, context = document, typeSingle = false) {
    if (!select) return [];
    if (select instanceof Element) return [select];

    if (typeSingle) {
      if (typeof select === 'string') {
        if (select[0] === '<') return makeElements(select, true);
        if (select[0] === '/' || select.slice(0, 2) === './')
          return evaluateSingle(select, context);
        return querySingle(select, context);
      }
      if (select.constructor.name === 'ENode') return [select.el[0]];
      if (select.length > 0) handleArrayLike(select, true);
    } else {
      if (typeof select === 'string') {
        if (select[0] === '<') return makeElements(select, false);
        if (select[0] === '/' || select.slice(0, 2) === './')
          return evaluateMultiple(select, context);
        return queryMultiple(select, context);
      }
      if (select.constructor.name === 'ENode') return select.el;
      if (Object.prototype.hasOwnProperty.call(select, 'length'))
        return handleArrayLike(select, false);
    }
    warn('to node array: input is of invalid type:', select);
    return [];
  }

  return class ENode {
    constructor(select, context, type) {
      const array = toNodeArray(select, context, type);
      const { length } = array;
      this.array = array;
      this.el = this.array;
      this.length = length;
      for (let i = 0; i < length; i += 1) {
        this[i] = this.array[i];
      }
    }

    /**
     * Tests
     */

    exists() {
      return this.el.length > 0;
    }

    // Tests if all elements are connected
    isConnected() {
      return (
        this.exists() && this.el.findIndex((node) => !node.isConnected) === -1
      );
    }

    // Tests if all elements have the indicated class
    hasClass(className) {
      return (
        this.exists() &&
        this.el.findIndex((node) => !node.classList.contains(className)) === -1
      );
    }

    // Tests if enodes are identical
    isEqualTo(enode) {
      if (enode.constructor !== ENode) return false;
      if (this.length !== enode.length) return false;
      for (let i = 0; i < this.length; i += 1) {
        if (this.el[i] !== enode.el[i]) return false;
      }
      return true;
    }

    /**
     * Filters
     */

    // Returns all elements that match the selector
    filter(selector) {
      const { el } = this;
      if (!selector) return this;
      return new ENode(el.filter((node) => node.matches(selector)));
    }

    // Returns all elements containing selected text or matching the regular expression
    contains(text) {
      const { el } = this;

      if (text instanceof RegExp) {
        return new ENode(el.filter((node) => text.test(node.textContent)));
      }
      return new ENode(el.filter((node) => node.textContent.includes(text)));
    }

    /**
     * Navigation
     */

    find(select) {
      return new ENode([
        ...new Set(this.el.map((node) => toNodeArray(select, node)).flat(2)),
      ]);
    }

    closest(selector) {
      return new ENode(this.el.map((node) => node.closest(selector)));
    }

    parent() {
      return new ENode([
        ...new Set(
          this.el.map((node) => node.parentElement).filter((node) => node),
        ),
      ]);
    }

    children(selector) {
      return new ENode(
        this.el.reduce(
          (accumulator, current) =>
            accumulator.concat(Array.from(current.children)),
          [],
        ),
      ).filter(selector);
    }

    next() {
      return new ENode(
        this.el.map((node) => node.nextElementSibling).filter((node) => node),
      );
    }

    prev() {
      return new ENode(
        this.el
          .map((node) => node.previousElementSibling)
          .filter((node) => node),
      );
    }

    /**
     * Manipulating class
     */

    addClass(classString) {
      if (typeof classString !== 'string') {
        warn(`add class: invalid argument '${classString}', requires string`);
        return this;
      }
      this.el.forEach((node) => node.classList.add(...classString.split(' ')));
      return this;
    }

    removeClass(classString) {
      this.el.forEach((node) =>
        node.classList.remove(...classString.split(' ')),
      );
      return this;
    }

    /**
     * Insertion
     */

    append(source) {
      const [targetNode] = this.el;
      if (!targetNode) return this;
      const sourceENode = new ENode(source);
      sourceENode.el.forEach((sourceNode) => targetNode.append(sourceNode));
      return this;
    }

    prepend(source) {
      const [targetNode] = this.el;
      if (!targetNode) return this;
      const sourceENode = new ENode(source);
      sourceENode.el.reverse().forEach((sourceNode) => {
        targetNode.prepend(sourceNode);
      });
      return this;
    }

    beforeMe(items) {
      const enode = new ENode(items);
      enode.insertBefore(this);
      return this;
    }

    afterMe(items) {
      const enode = new ENode(items);
      enode.insertAfter(this);
      return this;
    }

    insertBefore(items) {
      const [node] = this.el;
      if (!node) return this;
      items.el.forEach((itemNode) =>
        itemNode.insertAdjacentElement('beforebegin', node),
      );
      return this;
    }

    insertAfter(items) {
      const [node] = this.el;
      if (!node) return this;
      items.el
        .reverse()
        .forEach((itemNode) =>
          itemNode.insertAdjacentElement('afterend', node),
        );
      return this;
    }

    wrap(item) {
      const { el } = this;
      return new ENode(
        el.map((element) => new ENode(element).wrapAll(item).firstDOM()),
      );
    }

    wrapAll(item) {
      const enode = new ENode(item);
      let wrapper = enode.el[0];
      while (wrapper.children.length) {
        wrapper = wrapper.firstElementChild;
      }
      const innerItem = new ENode(wrapper);

      this.first().beforeMe(enode);
      innerItem.append(this);
      return this;
    }

    /**
     * Idempotency
     */

    markOnce(attr) {
      const results = this.el.filter((node) => !node.getAttribute(attr));
      results.forEach((node) => node.setAttribute(attr, true));
      return new ENode(results);
    }

    /**
     * Events
     */

    on(eventTags, callback) {
      this.el.forEach((node) =>
        eventTags
          .split(' ')
          .forEach((eventTag) => node.addEventListener(eventTag, callback)),
      );
      return this;
    }

    /**
     * Content
     */

    html(string) {
      if (!string) return this.el.map((node) => node.innerHTML).join();

      this.el.forEach((node) => {
        const newNode = node;
        newNode.innerHTML = string;
      });
      return this;
    }

    text(string) {
      if (!string) return this.el.map((node) => node.textContent).join(' ');

      this.el.forEach((node) => {
        const newNode = node;
        newNode.textContent = string;
      });
      return this;
    }

    attr(attributes) {
      if (typeof attributes === 'string') {
        const prop = attributes;
        return this.el.map((node) => node.getAttribute(prop)).join(' ');
      }

      this.el.forEach((node) => {
        const keys = Object.keys(attributes);
        keys.forEach((key) => node.setAttribute(key, attributes[key]));
      });

      return this;
    }

    /**
     * Constructs
     */

    each(callback) {
      this.el.forEach((node, index, list) => {
        const enode = new ENode(node);
        callback.apply(null, [enode, index, list]);
      });
      return this;
    }

    watch(options = {}) {
      const defaultConfig = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true,
      };
      const config = { ...defaultConfig, ...options };
      let callbackA;
      const observer = new MutationObserver((mutations) => {
        if (callbackA) callbackA(mutations);
      });
      this.el.forEach((node) => observer.observe(node, config));

      return {
        then: (callbackB) => {
          callbackA = callbackB;
        },
      };
    }

    /**
     * Isolating elements
     */

    firstDOM() {
      return this.el[0];
    }

    // Deprecated
    firstDom() {
      return this.el[0];
    }

    lastDOM() {
      return this.el.slice(-1)[0];
    }

    // Deprecated
    lastDom() {
      return this.el.slice(-1)[0];
    }

    first() {
      return new ENode(this.firstDom());
    }

    last() {
      return new ENode(this.lastDom());
    }
  };
}

export default initializeENode;
