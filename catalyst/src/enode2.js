function initializeENode(sandbox) {
  return () => {
    const { debug, warn } = sandbox;

    function makeElements(HTMLString, typeSingle = false) {
      const template = document.createElement('template');
      try {
        template.innerHTML = HTMLString;
      } catch {
        warn('create elements: invalid HTML string', HTMLString);
        return [];
      }
      const array = Array.from(template.content.childNodes);
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
        warn('evaluate single: invalid XPath selector', relativeXPathString);
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
          `evaluate multiple: ${relativeXPathString} is not a valid XPath expression`,
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
        result = contextElement.querySelector(select);
      } catch {
        warn(`query single: ${select} is not a valid selector`);
        return [];
      }
      return result;
    }

    function queryMultiple(select, contextElement) {
      let result;
      try {
        result = contextElement.querySelectorAll(select);
      } catch {
        warn(`query multiple: ${select} is not a valid selector`);
        return [];
      }
      return result;
    }

    function toNodeArray(select, context = document.body, typeSingle = false) {
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
        if (Array.isArray(select)) return select[0];
      } else {
        if (typeof select === 'string') {
          if (select[0] === '<') return createElements(select, false);
          if (select[0] === '/' || select.slice(0, 2) === './')
            return evaluateMultiple(select, context);
          return queryMultiple(select, context);
        }
        if (select.constructor.name === 'ENode') return select.el;
        if (Array.isArray(select)) return select;
      }
      warn('to node array: input is of invalid type:', select);
      return [];
    }

    class ENode {
      constructor(select, context, type) {
        const el = toNodeArray(select, context, type);
        this.el = el;
        this.length = this.el.length;
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
          this.el.findIndex((node) => !node.classList.contains(className)) ===
            -1
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
          ...new Set(this.el.map((node) => toNodeArray(select, node))).flat(2),
        ]);
      }

      closest(selector) {
        return new ENode(this.el.map((node) => node.closest(selector)));
      }

      parent() {
        return new ENode([
          ...new Set(this.el.map((node) => node.parentElement)),
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
    }
  };
}

export default initializeENode;
