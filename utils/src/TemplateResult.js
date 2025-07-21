import { UID } from './global.js';

export default class TemplateResult {
  #strings = [];

  #expressions = [];

  constructor(strings, expressions) {
    this.#strings = strings;
    this.#expressions = expressions;
    this.expressionMap = new Map();
  }

  #getTaggedHTML = (
    [strings, expressions] = [this.#strings, this.#expressions],
  ) => {
    let html = '';

    strings.forEach((string, index) => {
      const eventString = string.match(
        /^(.*)(\s|\r|\r?\n)*(@([\w-]*)(\s|\r|\r?\n)*=)/s,
      );
      const expression = expressions[index];

      if (typeof expression === 'undefined' || expression === null) {
        html += string;
      } else if (eventString) {
        const expressionKey = UID();
        html += `${eventString[1]} ${expressionKey}`;
        this.expressionMap.set(expressionKey, {
          type: 'listener',
          expression: [eventString[4], expression],
        });
      } else if (expression instanceof TemplateResult) {
        html += string;
        html += this.#getTaggedHTML([[''], [...expression.renderAll()]]);
      } else if (expression instanceof Node) {
        const expressionKey = UID();
        html += `${string}<template ${expressionKey}></template>`;
        this.expressionMap.set(expressionKey, {
          type: 'element',
          expression,
        });
      } else if (Array.isArray(expression)) {
        html += string;
        for (let i = 0; i < expression.length; i += 1) {
          html += this.#getTaggedHTML([[''], [expression[i]]]);
        }
      } else {
        html += `${string}${expression}`;
      }
    });

    return html;
  };

  renderAll = () => {
    const taggedHTML = this.#getTaggedHTML().trim();
    const template = document.createElement('template');
    template.innerHTML = taggedHTML;

    this.expressionMap.forEach(({ type, expression }, expressionKey) => {
      switch (type) {
        case 'listener': {
          const element = template.content.querySelector(`[${expressionKey}]`);
          element.addEventListener(expression[0], expression[1]);
          element.removeAttribute(expressionKey);
          break;
        }
        case 'element': {
          const element = template.content.querySelector(`[${expressionKey}]`);
          element.replaceWith(expression);
          break;
        }
        default:
          break;
      }
    });

    return template.content.childNodes;
  };

  render = () => this.renderAll()[0] || null;
}
