

var Calibrator = function(launchpad) {

  this.active = false;

  var that = this;
  _.extend(this, Backbone.Events);

  var done = 0;

  launchpad.on('press', function(button) {

    if (!that.active) return;
    button.launchpad.allLight(Launchpad.colors.green.high);
    (function() {
      var t = setTimeout(function() {
        button.launchpad.allLight(Launchpad.colors.off);

        var column = (done-1) % launchpad.columnCount;
        var row = Math.floor((done-1)/ launchpad.columnCount);

        button.launchpad.setPosition(row, column);

        if (done === launchpad.totalNumber) {
          var s = setTimeout(function() {
            that.active = false;
            that.trigger("calibrated");
          },0);
        }

      },200);
    })(done);

    done++;

  });

  return this;
}