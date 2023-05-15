import { strictEqual } from './assert.js';
import { createSignal } from '../src/index.js';
import { jsx, setDocument } from '../src/jsx-runtime.js';
import { JSDOM } from 'jsdom';

describe('Test DOM generation', () => {
  it('should generate the correct DOM structure', () => {

    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    setDocument(dom.window.document);   
    const [count, setCount] = createSignal(0);
    const [state, setState] = createSignal(false);

    const CopThis = (props) => state() ? jsx("div", props) : jsx("h1", props);

    const CopThat = (props) => jsx("div", props);

    const outerDiv = jsx(
      "div",
      {},
      jsx("div", { data: count, "class": "bongo" }, jsx(CopThis, { "class": "hello" }), jsx(CopThat, {})),
      jsx("div", {}, count)
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
    // const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    // setDocument(dom.window.document);
 
    const Component = () => (
      jsx("div")
    );
    
    const Outer = () => (
      jsx(Component)
    )

    const outerDiv = jsx("div", {}, jsx(Outer));

    strictEqual(
      outerDiv.innerHTML,
      '<div></div>'
    );

  });
});
