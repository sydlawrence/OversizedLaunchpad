var Twitter = function(launchpad) {
  this.active = false;
  this.run = function(){
    launchpad.midi.emit("tweet_start",{});
    launchpad.allLight(Launchpad.colors.off);
  }
  this.deactivate = function() {
    launchpad.midi.emit("tweet_end",{});
  }
  var that = this;


  this.getAnalysis = function(text, callback) {
    var text = "hello world";
    var url = "http://www.viralheat.com/api/sentiment/review.json?api_key=API_KEY&text="+encodeURIComponent(text)+"&callback=?";

    var sentiment = 0;
    var rand = Math.random() * 10000000;
    if (rand < 150000) sentiment = -1;
    if (rand > 9850000) sentiment = 1;
    callback(sentiment);

  }

  launchpad.midi.on("tweet", function(message) {
    if (!that.active) return;
    var username = message.tweet.username;
    var text = message.tweet.text;

    var index = parseInt(username.length * Math.random() * 70);
    index = index %1024;
    var x = index%32;
    var y = Math.floor(index/32);
    try {

      launchpad.getButton(x,y).light(Launchpad.colors.off);

      var t = setTimeout(function() {
        that.getAnalysis(text, function(sentiment) {
          switch (sentiment) {
            case -1:
              launchpad.getButton(x,y).light(Launchpad.colors.red.high);
              break;
            case 1:
              launchpad.getButton(x,y).light(Launchpad.colors.green.high);
              break;
            default:
              launchpad.getButton(x,y).light(Launchpad.colors.yellow.high);

          }
        });
      },50);


    } catch (e) {}
  })


  return this;

}