export class MyComponent extends HTMLElement {
  connectedCallback () {
    this.attachShadow({ mode: "open" })
    this.shadowRoot.innerHTML = `<div></div>`
  }
}
