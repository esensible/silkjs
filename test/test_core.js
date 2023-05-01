const assert = require('assert');
const { createSignal, createEffect } = require('../src/silk.js');

describe('Test createSignal', function() {
  it('should create a signal with initial value', function() {
    const signal = createSignal(0);
    assert.strictEqual(signal.get(), 0);
  });

  it('should update signal value on set', function() {
    const signal = createSignal(0);
    signal.set(42);
    assert.strictEqual(signal.get(), 42);
  });

  it('should notify subscribers on value change', function() {
    const signal = createSignal(0);
    let notifiedValue = null;

    createEffect(function() {
      notifiedValue = signal.get();
    });

    signal.set(42);
    assert.strictEqual(notifiedValue, 42);
  });
});

describe('Test nested effects', function() {
  it('should run the effect callback', function() {
    var counter = createSignal(0);
    var state = createSignal(true);
    var nested1_result;
    var nested2_result;

    function nested1() {
        nested1_result = counter.get();
    }
    function nested2() {
        nested2_result = counter.get();
    }

    createEffect(function (){
        if (state.get()) {
            createEffect(nested1);
        } else {
            createEffect(nested2);
        }
    })

    assert.strictEqual(nested1_result, 0);
    assert.strictEqual(nested2_result, undefined);

    counter.set(23);
    assert.strictEqual(nested1_result, 23);
    assert.strictEqual(nested2_result, undefined);

    nested1_result = undefined;
    state.set(false);

    assert.strictEqual(nested1_result, undefined);
    assert.strictEqual(nested2_result, 23);
  });
});


describe('Test multiple effects', function() {
    it('should run all effects', function() {
        var counter = createSignal(0);
        var counter1 = createSignal(0);
        var result1;
      var result2;
      var result3;
      var result4;
   
      createEffect(function (){
            createEffect(function(set) {result1 = counter.get();});
            createEffect(function(set) {result2 = counter.get();});
            createEffect(function(set) {result3 = counter1.get();});
            createEffect(function(set) {result4 = counter1.get();});
        });
  
      assert.strictEqual(result1, 0);
      assert.strictEqual(result2, 0);
      assert.strictEqual(result3, 0);
      assert.strictEqual(result4, 0);

      counter.set(23);
      assert.strictEqual(result1, 23);
      assert.strictEqual(result2, 23);
      assert.strictEqual(result3, 0);
      assert.strictEqual(result4, 0);

      counter1.set(42);
      assert.strictEqual(result1, 23);
      assert.strictEqual(result2, 23);
      assert.strictEqual(result3, 42);
      assert.strictEqual(result4, 42);

    });
});