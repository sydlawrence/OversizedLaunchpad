var Launchpadder = require("launchpadder");


var launchpad = new Launchpadder.Launchpad(1);

launchpad.on("press", function(button) {
  console.log("hello");
    // Do something awesome...
});

