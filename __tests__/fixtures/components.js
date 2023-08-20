export class MyComponent extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `<div></div>`;
    }
  }
}
