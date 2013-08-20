var pusher = new Pusher('efa61030395bf0550164');
var channel = pusher.subscribe('standing_novation');


var DeathClock = function(launchpad) {
  this.active = false;
  var that = this;


  this.run = function() {
    launchpad.allLight(Launchpad.colors.off);
    launchpad.displayString("Death Clock");
    setTimeout(function() {
      launchpad.displayString("SendYearof");
      setTimeout(function() {
        launchpad.displayString("Birth   to:");
        setTimeout(function() {
          launchpad.displayString("020 33228273");
        },launchpad.instructionDelay);
      },launchpad.instructionDelay);
    },launchpad.instructionDelay);
  }

  channel.bind('new_sms', function(data) {
    if (that.active) {
      that.deactivate();
      that.processYear(data.Body);
    }
  });

  this.deactivate = function() {
    for (var i = 0; i < launchpad.launchpads.length; i++) {
      for (var j = 0; j < launchpad.launchpads[i].length; j++) {
        launchpad.launchpads[i][j].clearScroll();
      }
    }
  }

  var blinkState = false;
  this.blink = function(x, y) {
    if (!this.active) return;
    if (blinkState) {
      launchpad.getButton(x,y).light(Launchpad.colors.red.high);
    } else {
      launchpad.getButton(x,y).light(Launchpad.colors.green.high);
    }
    blinkState = !blinkState;
    var t = setTimeout(function() {
      that.blink(x,y);
    },50);
  }

  this.processYear = function(year) {
    year = year+"";
    launchpad.allLight(Launchpad.colors.green.high);

    launchpad.launchpads[1][0].displayCharacter(year[0]);
    launchpad.launchpads[1][1].displayCharacter(year[1]);
    launchpad.launchpads[1][2].displayCharacter(year[2]);
    launchpad.launchpads[1][3].displayCharacter(year[3]);

    launchpad.launchpads[1][0].clearScroll();
    launchpad.launchpads[1][1].clearScroll();
    launchpad.launchpads[1][2].clearScroll();
    launchpad.launchpads[1][3].clearScroll();

    var that = this;
    var s = setTimeout(function() {
      that.getSecondsLeft(year, function(data) {
        // light all of them
        launchpad.allLight(Launchpad.colors.green.high);
        // slowly tick of the ones to be dark
        for (var i = 0; i < data.dark; i++) {
          (function(i){
            var x = i%32;
            var y = Math.floor(i/32);
            var t = setTimeout(function() {
              if (!that.active) return;
              launchpad.getButton(x,y).light(Launchpad.colors.red.high);
            }, i*50);
          })(i);
        }
        var t = setTimeout(function() {
          var x = (data.dark)%32;
          var y = Math.floor((data.dark)/32);
          that.blink(x,y);

        }, data.dark*50 + 500);
      });

    }, 3000);
  }


  this.getSecondsLeft = function(year, callback) {
    year = year+"";
    var smoker = parseInt(Math.random());
    var bmi = parseInt(Math.random()*10) + 20;
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20strong%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.deathclock.com%2Fdw.cfm%3FDay%3D1%26Month%3D1%26Year%3D"+year+"%26Sex%3DMale%26Mode%3DNormal%26bmi%3D"+bmi+"%26smoker%3D"+smoker+"%22%20%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Ffont%5B%40color%3D%22%23ffffff%22%5D%5B%40size%3D%224%22%5D'&format=json&callback=?";
    $.getJSON(url, function(data) {
      var death = data.query.results.font.strong+"";
      death = death.split(",");
      death[0] = undefined;
      death = death.join(",");
      death = death.replace(", ","").replace(",","");
      death = death.substring(0, death.length - 1);
      var deathTime = (new Date(death)).getTime();
      var bornTime = (new Date("January 1 "+year)).getTime();
      var nowTime = (new Date()).getTime();
      var timeAlive = deathTime - bornTime;
      var timeLeft = deathTime - nowTime;

      var timePerLight = timeAlive / 1024;

      var light = parseInt((timeLeft) / timePerLight)
      callback({
        light: light,
        dark: 1024 - light
      });

    });
  }


  return this;
}