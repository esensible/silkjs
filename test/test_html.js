import { strictEqual } from 'assert';
import { createSignal, createElement, setDocument} from '../src/index.js';
import { JSDOM } from 'jsdom';

describe('Test DOM generation', () => {
  it('should generate the correct DOM structure', () => {
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    setDocument(dom.window.document);
    
    const [count, setCount] = createSignal(0);
    const [state, setState] = createSignal(false);

    const CopThis = (props) => state() ? createElement("div", props) : createElement("h1", props);

    const CopThat = (props) => createElement("div", props);

    const outerDiv = createElement(
      "div",
      {},
      createElement("div", { data: count, "class": "bongo" }, createElement(CopThis, { "class": "hello" }), createElement(CopThat, {})),
      createElement("div", {}, count)
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
      createElement("div")
    );
    
    const Outer = () => (
      createElement(Component)
    )

    const outerDiv = createElement("div", {}, createElement(Outer));

    strictEqual(
      outerDiv.innerHTML,
      '<div></div>'
    );

  });
});
