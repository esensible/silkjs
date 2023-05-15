import {createEffect} from './index.js';

var docRef = typeof document !== "undefined" ? document : null;

// Dodgy hack for testing under node
export function setDocument(value) {
  docRef = value;
}

export function jsx(tag, attributes) {
    if (typeof tag === "function") {
      return function() { return tag.apply(null, arguments); }
    }
  
    var element = docRef.createElement(tag);
    
    // Check if children are passed in attributes
    var children = Array.prototype.slice.call(arguments, 2);
    if (attributes && attributes.children) {
      if (Object.prototype.toString.call(attributes.children) === '[object Array]') {
        children = attributes.children.slice(0);
      } else {
        children = [attributes.children];
      }
      delete attributes.children;
    }
    
    // Set attributes
    for (var key in attributes) {
      if (typeof attributes[key] === "function") {
        if (key.indexOf("on") === 0) {
          var event = key.slice(2).toLowerCase();
          element.addEventListener(event, attributes[key]);
        } else {
          (function (key, fn) {
              createEffect(function() {
                  const value = fn();
                  if (key === 'style' && typeof value === 'object') {
                    for (var styleKey in value) {
                      element.style[styleKey] = value[styleKey];
                    }
                  } else {
                    element.setAttribute(key, value);
                  }
              });
          })(key, attributes[key]);
        }
      } else if (key === 'style' && typeof attributes[key] === 'object') {
        var styleObject = attributes[key];
        for (var styleKey in styleObject) {
          element.style[styleKey] = styleObject[styleKey];
        }
      }
      else {
          element.setAttribute(key, attributes[key]);
      }
    }
    
    // Append children
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (typeof child === "function") {
        (function(child, idx) {
          createEffect(function() {
            var newValue = child;
            // This handles nested custom components
            while (typeof newValue === "function") {
              newValue = newValue();
            }
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
        })(child, i);
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
  

export const jsxs = jsx;