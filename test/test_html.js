import { strictEqual } from 'assert';
import { createSignal, h, setDocument} from '../src/index.js';
import { JSDOM } from 'jsdom';

describe('Test DOM generation', () => {
  it('should generate the correct DOM structure', () => {
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    setDocument(dom.window.document);
    
    const [count, setCount] = createSignal(0);
    const [state, setState] = createSignal(false);

    const CopThis = (props) => state() ? h("div", props) : h("h1", props);

    const CopThat = (props) => h("div", props);

    const outerDiv = h(
      "div",
      {},
      h("div", { data: count, "class": "bongo" }, h(CopThis, { "class": "hello" }), h(CopThat, {})),
      h("div", {}, count)
    );

    // Assert the resulting DOM structure
    strictEqual(
      outerDiv.innerHTML,
      '<div data="0" class="bongo"><h1 class="hello"></h1><div></div></div><div>0</div>'
    );

    setCount(23);
    strictEqual(
      outerDiv.innerHTML,
      '<div data="23" class="bongo"><h1 class="hello"></h1><div></div></div><div>23</div>'
    );

    setCount(42);
    strictEqual(
      outerDiv.innerHTML,
      '<div data="42" class="bongo"><h1 class="hello"></h1><div></div></div><div>42</div>'
    );

    setState(true);
    strictEqual(
      outerDiv.innerHTML,
      '<div data="42" class="bongo"><div class="hello"></div><div></div></div><div>42</div>'
    );
  });
});

describe('Test DOM components', () => {
  it('should support nested, pass through DOM components', () => {
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    setDocument(dom.window.document);
 
    const Component = () => (
      h("div")
    );
    
    const Outer = () => (
      h(Component)
    )

    const outerDiv = h("div", {}, h(Outer));

    strictEqual(
      outerDiv.innerHTML,
      '<div></div>'
    );

  });
});
