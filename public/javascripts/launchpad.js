/*
 * Launchpad
 * Represents the launchpad as a whole
 */
var Launchpad = function(parentGrid, name, midi, column, row) {
    this.name = name;

    this.row = row;
    this.column = column;

    _.extend(this, Backbone.Events);

    // Some variables
    this._grid = [];
    var that = this;

    this.setPosition = function(row, column) {

        this.row = row;
        this.column = column;

        for (var i = 0; i < this._grid.length; i++) {
            for (var j = 0; j < this._grid[i]; j++) {
                this._grid[i][j].setPosition(row,column);
                this._grid[i][j].launchpad = that;
            }
        }
        this.init();
    }

    // Connect to the MIDI port
    this._midi = midi;

    this._midi.sendMessage = function(message) {
        that._midi.emit("midijs",{message:message,name:name});
    };

    this.specials = {
        0:{ 8: ["right","vol"] },
        1:{ 8: ["right","pan"] },
        2:{ 8: ["right","snd A"] },
        3:{ 8: ["right","snd B"] },
        4:{ 8: ["right","stop"] },
        5:{ 8: ["right","trk on"] },
        6:{ 8: ["right","solo"] },
        7:{ 8: ["right","arm"] },
        8:{
            0:["up","page"],
            1:["down","page"],
            2:["left","page"],
            3:["right","page"],
            4:["session","inst"],
            5:["user 1","fx"],
            6:["user 2","user"],
            7:["mixer","mixer"],
            8:null
        }
    }

    var parent = document.createElement("div");
    parent.className = "launchpad";


    // Initialize all of the buttons
    for(var y = 0; y < 9; y++) {
        for(var x = 0; x < 9; x++) {
            if (this._grid[x] === undefined) this._grid[x] = [];
            this._grid[x][y] = new Button(this, x, y);
            this._grid[x][y].render(parent);
            var that = this;
            (function(x,y) {

                var t = setTimeout(function() {
                    that._grid[x][y].dark();
                },500);
            })(x,y)

        }
    }
    document.getElementById("launchpad").appendChild(parent);


    /*
     * Gets a button object from this._grid
     */
    this.getButton = function(x, y) {
        if (y === undefined) {
            y = Math.floor(x/16);
            x = x % 16;
        }

        if (this._grid[x] === undefined || this._grid[x][y] === undefined) {
            console.log("TODO: if using multi launchpad this should check for next door launchpad");
            return undefined;
        }

        if(y != undefined)
            return this._grid[x][y];

        var map = mapButtonToLaunchpad(x);
        return this._grid[map[0]][map[1]];
    }

    /*
     * Turns all LEDs off
     */
    this.allDark = function() {
        // Reset the state on all buttons
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                this._grid[x][y].dark();
            }
        }
    }

    this.clear = this.allDark;

    /*
     * Turns all LEDs on
     */
    this.allLight = function(color) {
        // Reset the state on all buttons
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                this._grid[x][y].light(color);
            }
        }
    }

    /*
     * Event handler for button press
     */
    this.receiveMessage = function(deltaTime, msg) {
        // We have to do something special for the top buttons
        if(msg[0] == "176")
            var button = that.getButton(parseInt(msg[1]) % 8, 8);
        else
            var button = that.getButton(msg[1]);
        // On or off?
        var state = (parseInt(msg[2]) == 127) ? true : false;

        // Emit an event
        if(state) {
            button.trigger("press",deltaTime);
            button.trigger("state_change");
            that.trigger("press", button);
            if (button.special !== false) that.trigger("special_press", button);

        } else {
            button.trigger("release",deltaTime);
            button.trigger("state_change");
            that.trigger("release", button);
            if (button.special !== false) that.trigger("special_release", button);
        }
    };

    this.randomColor = function() {
        var options = [3, 48, 18, 49];
        var rand = Math.floor(Math.random() * options.length);
        return options[rand];
    }

    this.initialize = function() {
        var colors = [
            3, 48, 18, 49, 0, 3, 48, 18, 49, 0
        ];
        for (var j = 0; j < colors.length;j++) {
            var i = colors[j];
            (function(i){
                setTimeout(function() {
                    for(var x = 0; x < 9; x++) {
                        for(var y = 0; y < 9; y++) {
                            (function(x,y){
                                var t = setTimeout(function() {
                                    try {
                                        that._grid[x][y].light(i);
                                    }
                                    catch (e) {
                                        console.log(x+" "+y);
                                    }
                                },(x+y)*100);
                            })(x,y);
                        }
                    }
                }, 500 * j);
            })(i);
        }
    }



    this.init = function() {

        //this.getButton(row,column).light();
    }


    this.allLight(Launchpad.colors.red.low);

    this.init();

    //this.initialize();
};



Launchpad.prototype.renderBytes = function(bytes, color) {
    if (bytes === undefined) return;
  for (var i = 0; i < bytes.length; i++) {
    var byt = bytes[i];
    for (var j = 0; j < byt.length; j++) {
        switch (byt[j]) {
            case "1":
                this._grid[j][i].light(color);
                break;
            case "r":
                this._grid[j][i].light(Launchpad.colors.red.high);
                break;
            case "o":
                this._grid[j][i].light(Launchpad.colors.orange.high);
                break;
            case "y":
                this._grid[j][i].light(Launchpad.colors.yellow.high);
                break;
            case "g":
                this._grid[j][i].light(Launchpad.colors.green.high);
                break;
            case "0":
                this._grid[j][i].light(Launchpad.colors.off);
                break;
        }
    }
  }
};

Launchpad.prototype.displayCharacter = function(letter, color) {
  var bytes = LawrenceSans(letter);
  this.renderBytes(bytes, color);
};

Launchpad.prototype.displayString = function(str, delay, callback, color) {
  if (delay === undefined) delay = 500;
  var that = this;
  for (var j = 0; j < str.length; j++) {
    (function(j){
      setTimeout(function() {
        that.displayCharacter(str[j], color);
        if (j+1 === str.length && callback !== undefined) setTimeout(callback, delay);
      }, j*delay);
    })(j);
  }
};

Launchpad.prototype.scrollString = function(str,delay, color, onFinished) {
    var bytes = [];
    for(var i = 0; i < str.length; i++) {
        bytes.push(LawrenceSans(str[i]));
        bytes.push(["0","0","0","0","0","0","0","0"]);
    }
    this.scrollBytes(bytes, delay, color, onFinished);
}

Launchpad.prototype.colorize = function(bytes, colorStr, nullColorStr) {
    for (var i = 0; i < bytes.length; i++) {
        console.log(bytes[i]);
        var str = "";
        for (var j = 0; j < bytes[i].length; j++) {
            if (bytes[i][j] === "1") str += colorStr;
            else  str += nullColorStr;
        }
        bytes[i] = str;
    }
    return bytes;
}

Launchpad.prototype.clearScroll = function() {
    clearInterval(this.scrollInterval);
}

Launchpad.prototype.scrollBytes = function(bytes, delay, color, onFinished) {
    var perScreen = 8;
    var charPos = 0;
    var overallBytes = [];
    for (var i= 0; i < bytes[0].length; i++) {
        var toAdd = "";
        for (var j = 0; j < bytes.length;j++) {
            toAdd += bytes[j][i];
        }
        overallBytes.push(toAdd);
    }

    this.scrollInterval;
    var that = this;

    if (delay === undefined) delay = 200;

    var visibleSet = function() {
        var toReturn = [];
        for (var i = 0; i < overallBytes.length; i++) {
            toReturn[i] = new Array(perScreen);
            var str = "";
            for (var j = charPos; j < charPos+perScreen; j++) {
                if (overallBytes[i][j] !== undefined)
                    str += overallBytes[i][j];
                else {
                    clearInterval(interval);
                    return;
                }
            }
            toReturn[i] = str;
        }
        charPos++;
        return toReturn;
    };

    interval = setInterval(function() {
        var set = visibleSet();
        if (set === undefined && typeof onFinished == "function") onFinished();
        else
            that.renderBytes(set, color)
    }, delay);

};



Launchpad.colors = {
    off: 0,
    red: {
        low: 1,
        medium:2,
        high:3
    },
    yellow: {
        low: 17,
        medium:34,
        high:54
    },
    orange: {
        low: 45,
        medium:46,
        high:23
    },
    green: {
        low: 16,
        medium:32,
        high:48
    }
};