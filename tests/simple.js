var main = require('../src/main');

var count = main.createSignal(0);
var state = main.createSignal(0);

function nested() {
    var v = state.get();
    console.log("state: " + v);
    if (v) {
        return main.h(
            "div",
            {"blah": "bongo"},
            function() {return "counter: " + count.get();},
        );    
    } else {
        return main.h(
            "h1",
            {},
            function() {return "counter: " + count.get();},
        );    
    }
}

mixedDiv = main.h("div", {}, nested)

console.log(mixedDiv.outerHTML);
count.set(count.get() + 1)
console.log(mixedDiv.outerHTML);
state.set(1);
console.log(mixedDiv.outerHTML);
count.set(count.get() + 1)
console.log(mixedDiv.outerHTML);

  
