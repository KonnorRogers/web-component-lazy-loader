// @ts-check
import { assert } from "@esm-bundle/chai";
import { MyComponent } from "./fixtures/components.js";
import { CustomElementsRegistryStub } from "./mocks/custom-element-registry";
import { html, fixture } from "@open-wc/testing"

import LazyLoader from "web-component-lazy-loader"

let loader
let customElementRegistryStub = new CustomElementsRegistryStub()


setup(() => {
  loader = null
  customElementRegistryStub.clear()
})

teardown(() => {
  loader.stop()
})

test("Should register the element if loaded later.", async () => {
  loader = new LazyLoader({
    "my-component": {
      register (tagName) {
        window.customElements.define(tagName, MyComponent)
      }
    }
  })

  loader.start()

  assert.isNotOk(window.customElements.get("my-component"))

  await fixture(html`<my-component></my-component>`)

  assert.isOk(window.customElements.get("my-component"))
})

test("Should register the component if the loader is started after the element exists.", async () => {
  loader = new LazyLoader({
    "my-component": {
      register (tagName) {
        window.customElements.define(tagName, MyComponent)
      }
    }
  })

  await fixture(html`<my-component></my-component>`)

  assert.isNotOk(window.customElements.get("my-component"))

  loader.start()

  assert.isOk(window.customElements.get("my-component"))
})

test("Should register the component when components reassigned", async () => {
  loader = new LazyLoader()

  await fixture(html`<my-component></my-component>`)

  assert.isNotOk(window.customElements.get("my-component"))

  loader.start()

  assert.isNotOk(window.customElements.get("my-component"))

  loader.setComponents({
    "my-component": {
      register (tagName) {
        window.customElements.define(tagName, MyComponent)
      }
    }
  })

  assert.isOk(window.customElements.get("my-component"))
})

test("Should register the component when component added", async () => {
  loader = new LazyLoader()

  await fixture(html`<my-component></my-component>`)

  assert.isNotOk(window.customElements.get("my-component"))

  loader.start()

  assert.isNotOk(window.customElements.get("my-component"))

  loader.components.set("my-component", {
    register (tagName) {
      window.customElements.define(tagName, MyComponent)
    }
  })

  /**
   * Because the tag already exists, it won't get picked up until we call `initialCheck`
   */
  assert.isNotOk(window.customElements.get("my-component"))

  loader.initialCheck()

  assert.isOk(window.customElements.get("my-component"))
})

test("Should not register if the loader is stopped", async () => {
  loader = new LazyLoader({
    "my-component": {
      register (tagName) {
        window.customElements.define(tagName, MyComponent)
      }
    }
  })

  loader.start()

  assert.isNotOk(window.customElements.get("my-component"))

  loader.stop()

  await fixture(html`<my-component></my-component>`)

  assert.isNotOk(window.customElements.get("my-component"))

  loader.initialCheck()

  assert.isNotOk(window.customElements.get("my-component"))

  loader.start()

  assert.isOk(window.customElements.get("my-component"))
})
