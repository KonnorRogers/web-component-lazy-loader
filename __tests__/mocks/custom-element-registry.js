// @ts-check
let counter = 0;

import Sinon from "sinon"

// These tests all run in the same tab so they pollute the global custom element registry.
// Some tests use this stub to be able to just test registration.
export class CustomElementsRegistryStub {
  constructor () {

    /**
    * @type {Map<string, CustomElementConstructor>}
    */
    this.map = new Map();

    Sinon.stub(window.customElements, 'get').callsFake(str => {
      return this.map.get(str);
    });

    const stub = Sinon.stub(window.customElements, 'define');
    stub.callsFake((str, ctor) => {
      if (this.map.get(str)) {
        return;
      }

      // Assign it a random string so it doesn't pollute globally.
      const randomTagName = str + '-' + counter.toString();
      counter++;
      stub.wrappedMethod.apply(window.customElements, [randomTagName, class extends ctor {}]);
      this.map.set(str, ctor);
    });
  }

  clear () {
    this.map.clear()
  }

  restore () {
    Sinon.restore()
  }
}
