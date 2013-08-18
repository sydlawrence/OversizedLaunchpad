var ModeSelector = function(launchpad) {

  var modes = [];

  var activeMode = undefined;
  var activeModeIndex = 0;
  var that = this;
  this.switchMode = function(mode) {

    if (!launchpad.calibrated) return;

    if (activeMode) {
      launchpad.launchpads[0][3].getButton(8,activeModeIndex).light(Launchpad.colors.off);
      activeMode.active = false;
      if (activeMode.deactivate) activeMode.deactivate();
    }

    var modeIndex = 0;
    for (var i = 0; i < modes.length; i++) {
      if (modes[i] == mode) {
        modeIndex = i;
        break;
      }
    }


    launchpad.launchpads[0][3].getButton(8,modeIndex).light();
    activeModeIndex = modeIndex;
    mode.active = true;
    mode.run();
    activeMode = mode;
  }

  launchpad.on('press', function(button) {
    if (button.launchpad.column === 3) {
      var modeIndex = button.launchpad.row;
      if (button.special !== false) {
        console.log(button.special);
        if (button.special.indexOf("right") > -1) {
          // console.log("SWITCH MODE: "+button.y);
          // var mode = modes[button.y];
          // that.switchMode(mode);
          that.nextMode();
        }
      }
    }


    // if (button.special.indexOf("left") > -1) activeBrick.move(0,-1);
    // if (button.special.indexOf("right") > -1) activeBrick.move(0,1);
    // if (button.special.indexOf("up") > -1) activeBrick.rotate(1);
    // if (button.special.indexOf("down") > -1) activeBrick.rotate(-1);
  });

  this.nextMode = function() {
    var i = (activeModeIndex+1) % modes.length;
    var mode = modes[i];
    this.switchMode(mode);
  }

  this.addMode = function(obj) {
    modes.push(obj);
  }


  return this;


}