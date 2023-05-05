import { strictEqual } from 'assert';
import { createSignal, createEffect } from '../src/index.js';

describe('Test createSignal', () => {
  it('should create a signal with initial value', () => {
    const [signal, _] = createSignal(-3);
    strictEqual(signal(), -3);
  });

  it('should update signal value on set', () => {
    const [signal, setSignal] = createSignal(0);
    setSignal(42);
    strictEqual(signal(), 42);
  });

  it('should notify subscribers on value change', () => {
    const [signal, setSignal] = createSignal(0);
    let notifiedValue = null;

    createEffect(() => {
      notifiedValue = signal();
    });

    setSignal(42);
    strictEqual(notifiedValue, 42);
  });
});

describe('Test nested effects', () => {
  it('should run the effect callback', () => {
    const [counter, setCounter] = createSignal(0);
    const [state, setState] = createSignal(true);
    let nested1_result;
    let nested2_result;

    const nested1 = () => {
      nested1_result = counter();
    };
    const nested2 = () => {
      nested2_result = counter();
    };

    createEffect(() => {
      if (state()) {
        createEffect(nested1);
      } else {
        createEffect(nested2);
      }
    });

    strictEqual(nested1_result, 0);
    strictEqual(nested2_result, undefined);

    setCounter(23);
    strictEqual(nested1_result, 23);
    strictEqual(nested2_result, undefined);

    nested1_result = undefined;
    setState(false);

    strictEqual(nested1_result, undefined);
    strictEqual(nested2_result, 23);
  });
});

describe('Test multiple effects', () => {
  it('should run all effects', () => {
    const [counter, setCounter] = createSignal(0);
    const [counter1, setCounter1] = createSignal(0);
    let result1;
    let result2;
    let result3;
    let result4;

    createEffect(() => {
      createEffect(() => { result1 = counter(); });
      createEffect(() => { result2 = counter(); });
      createEffect(() => { result3 = counter1(); });
      createEffect(() => { result4 = counter1(); });
    });

    strictEqual(result1, 0);
    strictEqual(result2, 0);
    strictEqual(result3, 0);
    strictEqual(result4, 0);

    setCounter(23);
    strictEqual(result1, 23);
    strictEqual(result2, 23);
    strictEqual(result3, 0);
    strictEqual(result4, 0);

    setCounter1(42);
    strictEqual(result1, 23);
    strictEqual(result2, 23);
    strictEqual(result3, 42);
    strictEqual(result4, 42);
  });
});
