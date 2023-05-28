activeEffect = null;
activeEffectId = null;
effectFlushers = {};
signalMap = {};

// handy debug code
// export var activeSignals = [];

function createSignal(initialValue, key) {
  let value = initialValue;
  let subscribers = [];

  function addSubscriber(subscriber, subscriberId) {
    if (subscribers.indexOf(subscriber) === -1) {
      subscribers.push(subscriber);

      // handy debug code
      // if (typeof key !== "undefined" && activeSignals.indexOf(key) === -1) {
      //   activeSignals.push(key);
      // }

      // Add a function to remove this signal from the effect's subscriptions
      if (!effectFlushers[subscriberId]) {
        effectFlushers[subscriberId] = [];
      }
      let unsubscribe = () => {
        let index = effectFlushers[subscriberId].indexOf(subscriber);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      };
      effectFlushers[subscriberId].push(unsubscribe);
    }
  }

  function notifySubscribers() {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i]();
    }
  }

  function get() {
    if (activeEffect) {
      addSubscriber(activeEffect, activeEffectId);
    }
    return value;
  }

  function set(newValue, force=false) {
    if (force || value !== newValue) {
      value = newValue;
      notifySubscribers();
    }
  }

  if (typeof key !== "undefined") {
    signalMap[key] = set
  }

  return [get, set];
}

function setAll(updates, failHard = false) {
  for (const key in updates) {
    if (signalMap.hasOwnProperty(key)) {
      signalMap[key](updates[key]);
    } else {
      if (failHard) {
        throw new Error(`Key "${key}" not found in signalMap.`);
      } else {
        console.warn(`Key "${key}" not found in signalMap.`);
      }
    }
  }
}

function generateUUID() {
    var uuid = '';
    for (var i = 0; i < 8; i++) {
        uuid += Math.floor(Math.random() * 16).toString(16);
    }
    return uuid;
}

function createEffect(callback) {
  var effectId = generateUUID();

  function wrappedEffect() {
    // Remove previous subscriptions for this effect
    if (effectFlushers[effectId]) {
      for (let i = effectFlushers[effectId].length - 1; i >= 0; i--) {
        effectFlushers[effectId][i]();
      }
    }
    effectFlushers[effectId] = [];

    // Save the current activeEffect and set it to the new wrapped effect
    var previousActiveEffect = activeEffect;
    var previousActiveEffectId = activeEffectId;
    activeEffect = wrappedEffect;
    activeEffectId = effectId;

    // Run the callback, which may create nested effects
    callback();

    // If there were any subscriptions created by this effect, add a cleanup function
    if (effectFlushers[effectId].length > 0) {
      // If there's a previousActiveEffect, add a cleanup function for the current effect
      if (previousActiveEffectId) {

        var cleanupCurrentEffect = function() {
                    if (effectFlushers[effectId]) {
                        for (let i = effectFlushers[effectId].length - 1; i >= 0; i--) {
                          effectFlushers[effectId][i]();
                        }
                        delete effectFlushers[effectId];
                    } else {
                        console.log("effectFlushers[", effectId, "] is empty")
                    }
                };
        effectFlushers[previousActiveEffectId].push(cleanupCurrentEffect);
      }
    } else {
      // If no subscriptions were created, remove the wrappedEffect from the effectsMap
      delete effectFlushers[effectId];
    }

    // Restore the previous activeEffect
    activeEffect = previousActiveEffect;
    activeEffectId = previousActiveEffectId;
  }

  return wrappedEffect();
}

function onCleanup(callback) {
  effectFlushers[activeEffectId].push(callback);
}


export {
  createEffect,
  createSignal,
  onCleanup,
  setAll,
};