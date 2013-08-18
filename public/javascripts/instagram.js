var Instagram = function(launchpad) {

  var that = this;

  this.run = function() {

    launchpad.allLight(Launchpad.colors.off);
    launchpad.displayString("Instagram");
    setTimeout(function() {
      launchpad.displayString("#cat");
      setTimeout(function() {
        launchpad.allLight(Launchpad.colors.off);
        that.drawInstagram();
      },2000);
    },2000);


  }

  this.drawInstagram = function() {

    var hashtag = "cat";
    var url = "https://api.instagram.com/v1/tags/"+hashtag+"/media/recent?client_id=fa26679250df49c48a33fbcf30aae989&callback=?";

    $.getJSON(url, function(results) {
      console.log(results);

      var img_url = "/img?url="+results.data[0].images.thumbnail.url;




      var canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
     // canvas.style.width = "500px";
     // canvas.style.height = "500px";
      context = canvas.getContext('2d');
      context.width = 32;
      context.height = 32;

      var base_image = new Image();

      var processCanvas = function(context) {
        for (var x = 0; x < 32; x++) {
          for (var y = 0; y < 32; y++) {
            processPixel(context, x, y);
          }
        }
      }

      base_image.onload = function(){
        context.drawImage(base_image, 0, 0, 32, 32);
        processCanvas(context);
      }


      $.get(img_url, function() {
        var meh = img_url.split("/");
        meh = meh[meh.length-1];
        base_image.src = "/images/"+meh;
      });




      var processPixel = function(context, x, y) {
        var p = context.getImageData(x, y, 1, 1).data;
        var c = p[0];
        if (c < p[1]) {
          c = p[1];
        }
        if (c < p[2]) {
          c = p[2];
        }
        var color = c;

        color = parseInt(color / (255 / 2),10);
        var light;
        switch(color) {
          case 0:
            light = Launchpad.colors.red.low;
            break;
          case 1:
            light = Launchpad.colors.red.medium;
            break;
          default:
            light = Launchpad.colors.red.high;
            break;

        }
        launchpad.getButton(x, y).light(light);

      }






      $("body").prepend(canvas);
    });
  }

  return this;


}