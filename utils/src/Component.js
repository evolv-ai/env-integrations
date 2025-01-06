import TemplateResult from './TemplateResult.js';

/**
 * @internal
 */
export default class Component {
  constructor(templateResult) {
    this.templateResult = templateResult;
    this.listeners = [];
    this.listenerKey = `listener-${Math.trunc(Math.random() * 10000000)
      .toString(32)
      .toUpperCase()}`;
    this.listenerIndex = 0;
    this.html = '';
  }

  getListenerAttribute = (index) => `${this.listenerKey}-${index}`;

  processTemplateResult = () => {
    const { strings, expressions } = this.templateResult;

    strings.forEach((string, index) => {
      const parts = string.match(/^(.*)(@([\w-]*)(\s|\r|\r?\n)*=)/s);
      const expression = expressions[index];

      if (index >= expressions.length) {
        this.html += string;
      } else if (parts) {
        this.html += `${parts[1]} ${this.getListenerAttribute(
          this.listenerIndex,
        )}="${index}"`;
        this.listeners.push([parts[3], expression]);
        this.listenerIndex += 1;
      } else if (expression === TemplateResult) {
        this.html += string;
        this.processTemplateResult(expression);
      } else if (Array.isArray(expression)) {
        this.html += string;
        expression.forEach((property) => this.processTemplateResult(property));
      } else {
        this.html += `${string}${expression}`;
      }
    });
  };

  render = () => {
    this.processTemplateResult(this.templateResult);

    const template = document.createElement('template');
    template.innerHTML = this.html;
    this.listeners.forEach(([eventType, expression], index) => {
      if (!(typeof expression === 'function')) {
        return;
      }

      const listenerAttribute = this.getListenerAttribute(index);

      const element = template.content.querySelector(`[${listenerAttribute}]`);
      element.addEventListener(eventType, expression);
      element.removeAttribute(listenerAttribute);
    });

    switch (template.content.children.length) {
      case 0:
        return null;
      case 1:
        return template.content.firstElementChild;
      default:
        return template.content.children;
    }
  };
}
