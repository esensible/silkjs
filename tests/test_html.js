const { JSDOM } = require("jsdom");
const assert = require('assert');
const { createSignal, h, effectsMap} = require('../src/main.js');

describe('Test DOM generation', function() {
  it('should generate the correct DOM structure', function() {
    const count = createSignal(0);
    const state = createSignal(false);

    const CopThis = function(props) {
      if (state.get()) {
        return h("div", props);
      }
      return h("h1", props);
    };

    const CopThat = function(props) {
      return h("div", props);
    };

    const outerDiv = h(
      "div",
      {},
      h("div", { data: count.get, "class": "bongo" }, h(CopThis, {"class": "hello"}), h(CopThat, {})),
      h("div", {}, count.get)
    );

    // Assert the resulting DOM structure
    assert.strictEqual(
        outerDiv.innerHTML,
      '<div data="0" class="bongo"><h1 class="hello"></h1><div></div></div><div>0</div>'
    );

    console.log(effectsMap);
    count.set(23);
    count.set(84);
    assert.strictEqual(
        outerDiv.innerHTML,
        '<div data="23" class="bongo"><h1 class="hello"></h1><div></div></div><div>23</div>'
        );
  
  });
});
