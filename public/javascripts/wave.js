

var Wave = function(launchpad) {

  this.active = false;

  var that = this;
  _.extend(this, Backbone.Events);

  this.run = function() {
    launchpad.allLight(Launchpad.colors.off);
    launchpad.displayString("Zen Garden");
    setTimeout(function() {
      launchpad.displayString("Press here");
      launchpad.launchpads[2][2]._grid[5][3].light(Launchpad.colors.yellow.high);
      setTimeout(function() {
        launchpad.allLight(Launchpad.colors.off);
      },launchpad.instructionDelay);
    },launchpad.instructionDelay);
  }

  var colors = [
    //0,
    Launchpad.colors.green.high,
    Launchpad.colors.orange.high,
    Launchpad.colors.green.high,
    Launchpad.colors.red.high
  ];

  var currentColor = 0;

  var waveDelay = 100;

  var lightNeighbour = function(button, uuid, dx, dy) {

    var neighbourY = button.y+(button.launchpad.row*8)+dy;
    var neighbourX = button.x+(button.launchpad.column*8)+dx;


    var b = launchpad.getButton(neighbourX, neighbourY);
    if (b === undefined || b.special || b._uuid[uuid] !== undefined) return;
    b.light(colors[currentColor]);
    b._uuid[uuid] = uuid;
    lightNeighbours(b, uuid);
  };


  var lightNeighbours = function(button, uuid) {
    var t = setTimeout(function() {
      lightNeighbour(button, uuid, -1, 0);
      lightNeighbour(button, uuid,+1, 0);
      lightNeighbour(button, uuid,0, -1);
      lightNeighbour(button, uuid,0, +1);
    },waveDelay);
  };

  launchpad.on('press', function(button) {
    if (!that.active) return;

    var audio = new Audio;
    audio.addEventListener("canplaythrough", function() {
      audio.play();
    });
    var i = (Math.floor(Math.random() * 5)+1) % 6

    var src = "/ripple/"+i+".mp3";
    audio.src = src;

    if (button.special !== false) return;
    currentColor = (currentColor + 1) % colors.length;
    button.light(colors[(currentColor + 1) % colors.length]);
    var uuid = (new Date()).getTime() + "" + parseInt(Math.random()*100000,10);
    button._uuid[uuid] = uuid;
    lightNeighbours(button, uuid);
  });

  launchpad.on('special_press', function(button) {
    // if (button.special.indexOf("left") > -1) activeBrick.move(0,-1);
    // if (button.special.indexOf("right") > -1) activeBrick.move(0,1);
    // if (button.special.indexOf("up") > -1) activeBrick.rotate(1);
    // if (button.special.indexOf("down") > -1) activeBrick.rotate(-1);
  });
  launchpad.on('special_release', function(button) {
    // button.dark();
  });



  return this;
}