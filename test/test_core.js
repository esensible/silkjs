import { strictEqual } from 'assert';
import { createSignal, createEffect, onCleanup, setAll } from '../src/index.js';

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


describe('Test onCleanup', () => {
  it('should call cleanup function when dependencies change', () => {
    const [state, setState] = createSignal(true);
    let cleanupCalled = false;

    createEffect(() => {
      state();

      onCleanup(() => {
        cleanupCalled = true;
      });
    });

    strictEqual(cleanupCalled, false);

    setState(false);
    strictEqual(cleanupCalled, true);
  });

  it('should call cleanup function when effect is re-triggered', () => {
    const [counter, setCounter] = createSignal(0);
    let cleanupCalls = 0;

    createEffect(() => {
      counter();

      onCleanup(() => {
        cleanupCalls++;
      });
    });

    strictEqual(cleanupCalls, 0);

    setCounter(42);
    strictEqual(cleanupCalls, 1);
  });

  it('should call cleanup function in reverse order', () => {
    const [counter, setCounter] = createSignal(0);
    let cleanupOrder = '';

    createEffect(() => {
      counter();

      onCleanup(() => {
        cleanupOrder += 'A';
      });

      onCleanup(() => {
        cleanupOrder += 'B';
      });
    });

    strictEqual(cleanupOrder, '');

    setCounter(42);
    strictEqual(cleanupOrder, 'BA');
  });
});


describe('Test setAll', () => {
  it('should update signals with keys', () => {
    const [signal1, _1] = createSignal(0, 'signal1');
    const [signal2, _2] = createSignal(0, 'signal2');

    setAll({ signal1: 42, signal2: 84 });

    strictEqual(signal1(), 42);
    strictEqual(signal2(), 84);
  });

  it('should notify effects when signals are updated', () => {
    const [signal1, _1] = createSignal(0, 'signal3');
    const [signal2, _2] = createSignal(0, 'signal4');
    let effect1Result = null;
    let effect2Result = null;

    createEffect(() => {
      effect1Result = signal1();
    });

    createEffect(() => {
      effect2Result = signal2();
    });

    setAll({ signal3: 23, signal4: 46 });

    strictEqual(effect1Result, 23);
    strictEqual(effect2Result, 46);
  });

  it('should not affect signals without keys', () => {
    const [signal1, _1] = createSignal(0);
    const [signal2, _2] = createSignal(0);
    let effect1Result = null;
    let effect2Result = null;

    createEffect(() => {
      effect1Result = signal1();
    });

    createEffect(() => {
      effect2Result = signal2();
    });

    setAll({ signal1: 23, signal2: 46 });

    strictEqual(effect1Result, 0);
    strictEqual(effect2Result, 0);
  });
});
