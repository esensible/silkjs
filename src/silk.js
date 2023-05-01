(function () {
var activeEffect = null;
var activeEffectId = null;
var effectFlushers = {};

var docRef = typeof document !== "undefined" ? document : null;
if (docRef === null) {
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;

    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    docRef = dom.window.document;
}

function createSignal(initialValue) {
    var value = initialValue;
    var subscribers = [];
  
    function addSubscriber(subscriber, subscriberId) {
      if (subscribers.indexOf(subscriber) === -1) {
        subscribers.push(subscriber);
  
        // Add a function to remove this signal from the effect's subscriptions
        if (!effectFlushers[subscriberId]) {
          effectFlushers[subscriberId] = [];
        }
        var unsubscribe = function() {
          var index = effectFlushers[subscriberId].indexOf(subscriber);
          if (index !== -1) {
            subscribers.splice(index, 1);
          }
        };
        effectFlushers[subscriberId].push(unsubscribe);
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
          addSubscriber(activeEffect, activeEffectId);
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
      effectFlushers[effectId].forEach(function(unsubscribe) {
        unsubscribe();
      });
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
                        effectFlushers[effectId].forEach(function(unsubscribe) {
                            unsubscribe();
                        });
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

function h(tag, attributes) {

    if (typeof tag === "function") {
        return function() { return tag(attributes, Array.prototype.slice.call(arguments, 2)); }
    }
    var element = docRef.createElement(tag);
  
    // Set attributes
    for (var key in attributes) {
        // hack for on prefix to handle event setting
        if (typeof attributes[key] === "function") {
            (function (key, fn) {
                createEffect(function() {
                    element.setAttribute(key, fn());
                });
            })(key, attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    }
  
    // Append children
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (typeof child === "function") {
        (function (child, idx) {
            createEffect(function() {
                var newValue = child();
                if (typeof newValue === "object") {
                    if (idx >= element.children.length) {
                        element.appendChild(newValue);
                    } else {
                        var oldValue = element.children[idx];
                        element.replaceChild(newValue, oldValue);
                    }
                } else {
                    element.textContent = String(newValue);
                }
            });
        })(child, i-2);
      } else {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      }
    }
  
    return element;
  }

  var moduleExports = {
    createEffect: createEffect,
    createSignal: createSignal,
    h: h,
  };  

  if (typeof module !== "undefined" && module.exports) {
    module.exports = moduleExports;
  } else if (typeof window !== "undefined") {
    window.silk = moduleExports;
  }
})();