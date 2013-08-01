var Turbo = function(launchpad) {
  this.active = false;
  var that = this;

  this.interval;

  var audio = new Audio();
  audio.src = "/CAPlogo.mp3";


  var colors = [
    Launchpad.colors.red.high,
    Launchpad.colors.yellow.high,
    Launchpad.colors.green.high,
    Launchpad.colors.orange.high,
  ];
  var showRandom = function() {
    var i = Math.floor(Math.random()*1024);

    var color = colors[Math.floor(Math.random()*colors.length)];
    var x = i%32;
    var y = Math.floor(i/32);
    launchpad.getButton(x, y).light(color);
  }

  this.run = function() {
        launchpad.allLight(Launchpad.colors.off);

      audio.currentTime = 0;
    audio.play();
    this.interval = setInterval(function() {
      if (!that.active) return;
      for (var i = 0; i < 50; i++) {
        showRandom();
      }
    },0);
  }

  this.deactivate = function() {
    audio.pause();
    clearInterval(this.interval);
  }


}