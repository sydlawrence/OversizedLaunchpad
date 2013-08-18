var Drawing = function(launchpad) {
  this.active = false;
  var that = this;

  this.run = function() {
    launchpad.allLight(Launchpad.colors.off);
    launchpad.displayString("Canvas");
    setTimeout(function() {
      launchpad.displayString("Draw things");
      setTimeout(function() {
        launchpad.allLight(Launchpad.colors.off);
      },2000);
    },2000);
  }

  var colors = [
    Launchpad.colors.red.high,
    Launchpad.colors.orange.high,
    Launchpad.colors.yellow.high,
    Launchpad.colors.green.high,
    Launchpad.colors.off
  ];

  var nextColor = function(current) {
    var currentIndex = 0;
    for (var i = 0; i < colors.length; i++) {
      if (colors[i] === current) {
        currentIndex = i;
      }
    }

    return colors[(currentIndex+1)%colors.length];
  }

  launchpad.on('press', function(button) {
    if (!that.active) return;
    button.light(nextColor(button._state));
  });


  return this;
}