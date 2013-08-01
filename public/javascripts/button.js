

/*
 * Button
 * Represents a single button on the Launchpad
 */
var Button = function(launchpad, note, y) {
    this.launchpad = launchpad;

    _.extend(this, Backbone.Events);

    this._grid = launchpad;
    this._state = Launchpad.LED_OFF;
    var that = this;

    this._uuid = [];

    this.special = false;

    // Are we being assigned via a note or x, y?
    if(y == undefined) {
        var map = mapButtonToLaunchpad(note);
        this.x = map[0];
        this.y = map[1];
    } else {
        this.x = note;
        this.y = y;
    }

    if (launchpad.specials[this.y][this.x] !== undefined) {
        this.special = launchpad.specials[this.y][this.x];
    }

    this.light = function(color) {
        this.stopBlink();
        if(color == undefined)
            color = Launchpad.colors.red.high;
        if (this._state === color) return;

        // Send the instruction to the launchpad
        if(this.y == 8)
            launchpad._midi.sendMessage({message:[176, this.toNote(), color], name:launchpad.name});
        else
            launchpad._midi.sendMessage({message:[144, this.toNote(), color], name:launchpad.name});

        // Save the state
        this._state = color;
        this.trigger("state_change");

    }

    this.setState = function(state) {
        if (this._state === state) return;
        // Send the instruction to the launchpad
        if(this.y == 8)
            launchpad._midi.sendMessage([176, this.toNote(), state]);
        else
            launchpad._midi.sendMessage([144, this.toNote(), state]);

        // Save the state
        this._state = state;
        this.trigger("state_change");
    }

    this.dark = function() {
        if (this._state === Launchpad.colors.off) return;

        if(this.y == 8)
            launchpad._midi.sendMessage([176, this.toNote(), Launchpad.colors.off]);
        else
            launchpad._midi.sendMessage([144, this.toNote(), Launchpad.colors.off]);

        this._state = Launchpad.colors.off;
        this.trigger("state_change");
    }

    this.element;

    this.render = function(parent) {
        var button = document.createElement("button");
        button.innerHTML = this.x+":"+this.y;
        if (this.special !== false) {
            if (this.special === null) {
                return;
            }
            button.dataset.extra = this.special[1];

            button.innerHTML = this.special[0];
        }
        var buttonPress = function() {
            button.className = "pressed";
        };
        var buttonRelease = function() {
            button.className = "";
        }
        var buttonStateChange = function() {
            button.dataset.state = that._state;
        }
        parent.appendChild(button);
        button.dataset.x = this.x;
        button.dataset.y = this.y;
        button.addEventListener("mousedown", function() {
            that.trigger("press",0);
            launchpad.trigger("press",that);
        }, true);
        button.addEventListener("mouseup", function() {
            that.trigger("release",0);
            launchpad.trigger("release",that);
        }, true);
        this.on("press", buttonPress);
        this.on("release", buttonRelease);
        this.on("state_change", buttonStateChange);
        button.dataset.state = that._state;
        this.element = button;
    }

    this.startBlink = function(color) {
        this._blink_color = color;
        this._grid._blinking.push(this);

        // If we're adding the first blinking LED, start the interval
        if(this._grid._blinking.length == 1)
            this._grid._blink_interval = setInterval(this._grid._tick, 500);
        this.trigger("state_change");
    }

    this.stopBlink = function() {
        if (this._grid._blinking === undefined)
            this._grid._blinking = []
        var index = this._grid._blinking.indexOf(this)
        if(index == -1)
            return;

        delete this._blink_color;
        this._grid._blinking.splice(index, 1);
        this.trigger("state_change");
    }

    this.getState = function() {
        return this._state;
    }

    // Converts x,y -> MIDI note
    this.toNote = function() {
        if(this.y == 8)
            return 104 + this.x;
        else
            return (this.y * 16) + this.x;
    }
    this.toString = function() {
        return "(" + this.x + ", " + this.y + ")";
    }
};

mapButtonToLaunchpad = function (note) {
    // For right buttons
    if(note % 8 == 0 && ((note / 8) % 2 == 1))
        return [8, Math.floor(note / 8 / 2)];

    var x = note % 8;
    var y = Math.floor(note / 8) / 2;
    return [x, y];
}

