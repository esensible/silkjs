var activeEffect = null;
var effectsMap = {};

function createSignal(initialValue) {
    var value = initialValue;
    var subscribers = [];
  
    function addSubscriber(subscriber) {
      if (subscribers.indexOf(subscriber) === -1) {
        subscribers.push(subscriber);
  
        // Add a function to remove this signal from the effect's subscriptions
        if (!effectsMap[subscriber]) {
          effectsMap[subscriber] = [];
        }
        var unsubscribe = function() {
          var index = subscribers.indexOf(subscriber);
          if (index !== -1) {
            subscribers.splice(index, 1);
          }
        };
        effectsMap[subscriber].push(unsubscribe);
      }
    }
  
    function notifySubscribers() {
      for (var i = 0; i < subscribers.length; i++) {
        subscribers[i]();
      }
    }
  
    return {
      get: function() {
        if (activeEffect) {
          addSubscriber(activeEffect);
        }
        return value;
      },
      set: function(newValue) {
        value = newValue;
        notifySubscribers();
      },
      subscribers: subscribers
    };
}

function createEffect(callback) {
  function wrappedEffect() {
    // Remove previous subscriptions for this effect
    if (effectsMap[wrappedEffect]) {
      effectsMap[wrappedEffect].forEach(function(unsubscribe) {
        unsubscribe();
      });
    }
    effectsMap[wrappedEffect] = [];

    // Save the current activeEffect and set it to the new wrapped effect
    var previousActiveEffect = activeEffect;
    activeEffect = wrappedEffect;

    // Run the callback, which may create nested effects
    callback();

    // If there were any subscriptions created by this effect, add a cleanup function
    if (effectsMap[wrappedEffect].length > 0) {
      // If there's a previousActiveEffect, add a cleanup function for the current effect
      if (previousActiveEffect) {
        var cleanupCurrentEffect = function() {
          effectsMap[wrappedEffect].forEach(function(unsubscribe) {
            unsubscribe();
          });
          delete effectsMap[wrappedEffect];
        };
        effectsMap[previousActiveEffect].push(cleanupCurrentEffect);
      }
    } else {
      // If no subscriptions were created, remove the wrappedEffect from the effectsMap
      delete effectsMap[wrappedEffect];
    }

    // Restore the previous activeEffect
    activeEffect = previousActiveEffect;
  }

  return wrappedEffect();
}

function h(tag, attributes) {
    var element = document.createElement(tag);
  
    // Set attributes
    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (typeof attributes[key] === "function") {
          createEffect(function() {
            element.setAttribute(key, attributes[key]());
          });
        } else {
          element.setAttribute(key, attributes[key]);
        }
      }
    }
  
    // Append children
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (typeof child === "function") {
        createEffect(function() {
          element.textContent = child();
        });
      } else {
        element.appendChild(child);
      }
    }
  
    return element;
  }

module.exports = {
    createEffect: createEffect,
    createSignal: createSignal,
    h: h
  };
