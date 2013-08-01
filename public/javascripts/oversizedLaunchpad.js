var OversizedLaunchpad = function(midi, across, down) {
  var launchpads = [];
  var that = this;
  this.totalNumber = across*down;
  this.launchpads = launchpads;
  this.columnCount = across;
  this.rowCount = down;

  this.midi = midi;

  this.clear = function() {
    for (var i = 0; i < launchpads.length; i++) {
      for (var j = 0; j < launchpads[i].length; j++) {
        launchpads[i][j].clear();
      }
    }
  }

  this.allLight = function(color) {
    for (var i = 0; i < launchpads.length; i++) {
      for (var j = 0; j < launchpads[i].length; j++) {
        launchpads[i][j].allLight(color);
      }
    }
  }

  _.extend(this, Backbone.Events);

  var getLaunchpadByName = function(name) {
    for (var i = 0; i < launchpads.length; i++) {
      for (var j = 0; j < launchpads[i].length; j++) {
        if (launchpads[i][j].name === name) return launchpads[i][j];
      }
    }
  }


  midi.on("midijs",function(message){
    var launchpad = getLaunchpadByName(message.name);
    if (launchpad)
      launchpad.receiveMessage(message.deltaTime, message.message);
  });

  var createLaunchpads = function(columns, rows) {
    var count = 0;
    for (var row = 0; row < rows; row++) {
      for (var column = 0; column < columns; column++) {
        var launchpad = new Launchpad(that, count, midi, column, row);
        count++;
        launchpad.on("press", function(e) {
          that.trigger("press",e);
        });
        if (launchpads[row] === undefined) launchpads[row] = [];
        launchpads[row][column] = launchpad;

      }
    }
  }

  this.getButton = function(x,y) {

    var dx = x%8;
    var dy = y%8;
    var column = Math.floor(x/8);
    var row = Math.floor(y/8);

    if (launchpads[row] && launchpads[row][column]) {
      return launchpads[row][column].getButton(dx, dy);
    }
    else {
      return undefined;
    }

  }

  createLaunchpads(across, down);



  var modeSelector = new ModeSelector(this);

  var calibrator = new Calibrator(this);
  calibrator.active = true;

  var wave = new Wave(this);
  modeSelector.addMode(wave);

  var drawing = new Drawing(this);
  modeSelector.addMode(drawing);

  var instagram = new Instagram(this);
  modeSelector.addMode(instagram);

  var deathClock = new DeathClock(this);
  modeSelector.addMode(deathClock);

  var twitter = new Twitter(this);
  modeSelector.addMode(twitter);

  var turbo = new Turbo(this);
  modeSelector.addMode(turbo);

  this.calibrated = false;

  calibrator.on("calibrated", function() {
    that.calibrated = true;
    var newLaunchpads = [];
    for (var i = 0; i < launchpads.length; i++) {
      for (var j = 0; j < launchpads[i].length; j++) {
        var l = launchpads[i][j];

        if (newLaunchpads[l.row] === undefined) {
          newLaunchpads[l.row] = [];
        }
        newLaunchpads[l.row][l.column] = l;
      }
    }
    launchpads = newLaunchpads;
    that.launchpads = newLaunchpads;
    console.log(newLaunchpads);
    for (var x = 0; x < launchpads.length; x++) {
      for (var y = 0; y < launchpads[x].length; y++) {
        var z = launchpads[x][y];
        z.setPosition(z.row, z.column);
      }
    }

    modeSelector.switchMode(wave);

  });



}