# Purpose

To lazy load web components when they're discovered in the DOM.

## How it works



## Installation

```bash
npm install web-component-lazy-loader
```

## Getting Started

```js
import LazyLoader from "web-component-lazy-loader"

const lazyLoader = new LazyLoader({
  rootElement: document, // document is the default, but can be any Element or ShadowRoot
  components: {
    "sl-button": {
      // Auto-registering components
      register () { import("@shoelace-style/shoelace/dist/components/button/button.js") }
    }
    "my-component": {
      // Manually registering components
      register (tagName) {
        // !IMPORTANT! For most bundlers, you shouldn't use the `tagName` parameter
        // in the dynamic import because it will not be statically analyzable.
        // If you're using importmaps, do what you want.
        import("my-component").then((module) => {
          window.customElements.define(tagName, module.MyComponent)
        }
      }
    },
    "my-other-component": {
      // { force: true } says not to check if the component has already been registered.
      force: true,
      register (tagName) {
        import("my-other-component").then((module) => {
          window.customElements.define(tagName)
        })
      }
    }
  }
})

// Start scanning via MutationObserver and perform an initial sweep
lazyLoader.start()

// If for some reason you want to stop later
lazyLoader.stop()
```

## Adding components later

### Appending

```js
const lazyLoader = new LazyLoader()

lazyLoader.start()

// LazyLoader converts objects to a Map() under the hood, so `components` is actually a Map()
lazyLoader.components.set("sl-button", {
  register () { import("@shoelace-style/shoelace/dist/components/button/button.js") }
})

// If the tag already exists in the DOM, it won't be discovered, so we need to run the initial sweep again.
lazyLoader.initialCheck()
```

> [!IMPORTANT]
> When appending a new component and the loader has already started, it will not check for existing tags
> in the DOM. You would need to perform `lazyLoader.initialCheck()` again.


### Adding a new map

```js
const lazyLoader = new LazyLoader()

// This will overwrite all previous components
lazyLoader.setComponents({
  "sl-button": {
    register () { import("@shoelace-style/shoelace/dist/components/button/button.js") }
  }
})

lazyLoader.start()
```

## Why?

By using static `import()` functions we can play nicely with bundlers and get code-splitting
for free and not rely on static references to the file.

## Contributing

`exports/` is publicly available files
`internal/` is...well...internal.

`exports` and `internal` shouldn't write their own `.d.ts` that are co-located.

`types/` is where you place your handwritten `.d.ts` files.
