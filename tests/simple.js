var main = require('../src/main');

var mixedDiv = main.h(
    "div",
    {},
    "blah",
    main.h("div", {}),
    "bongo"
  );
  console.log("Mixed div outerHTML:", mixedDiv.outerHTML);
  
