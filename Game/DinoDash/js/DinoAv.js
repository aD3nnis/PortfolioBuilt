
document.addEventListener("DOMContentLoaded", function() {
  // Your JavaScript code goes here
  let gsapBigImage = document.querySelector("h1");
  gsap.to(gsapBigImage, { duration: 2, opacity: 1 });
  // gsap.to(gsapBigImage, { duration: 1, scaleX 1.2, scaleY: 1.2 });
});

(function ($) {

  // Initial speed and position of background
  var DinoGame = {
    points: 0,
    display: function () {
      var myImage = document.getElementById('play');
      myImage.style.display = 'none';
      myImage = document.getElementById('Dinosaur');
      myImage.style.display = 'block';
      myImage = document.getElementById('DinosaurPic');
      myImage.style.display = 'none';
      myImage = document.getElementById('Bigrock');
      myImage.style.display = 'none';
      myImage = document.getElementById('Rock');
      myImage.style.top = 110 + "px";
      myImage.style.display = 'block';
      myImage = document.getElementById('Gameover');
      myImage.style.display = 'none';
      var myImage = document.getElementById('Bigrock');
      myImage.style.top = 0 + "px";
      // document.querySelector("#test2").innerHTML = points;
    }
  }

  document.getElementById('play').addEventListener('click', function () {

    var position = 0;
    var speed = 6;


    // I grabbed the below animation code from Kent Jones
    // The purpose was for: Coyote Utilities Functions
    // Here are the resources he used as well
    // Resources Used:
    //  http://www.htmlandcssbook.com/
    //  http://javascriptbook.com/ 
    //  parallax scrolling tutorials: 
    //      https://webdesign.tutsplus.com/categories/parallax-scrolling
    // License: MIT License: https://opensource.org/licenses/MIT 
    // Set the initial width of the Rock element
    // IFFY function to figure out best animation function and store it
    var requestAnimFrame = (function () {
      if (window.requestAnimationFrame) return window.requestAnimationFrame;
      if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame;
      if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame;
      if (window.oRequestAnimationFrame) return window.oRequestAnimationFrame;
      if (window.msRequestAnimationFrame) return window.msRequestAnimationFrame;
      else return function (callback, element) {
        window.setTimeout(callback, element);
      };
    })();
    ///////////////////////////////

    let canClick = true;
    document.addEventListener('keydown', function (event) {
      // Check if the pressed key is the space bar (keyCode 32 or key ' ')
      const img = document.getElementById("Dinosaur");
      img.style.top = 0 + "px"; // DINO POSITION // 53%, 53 + "%"
      if (event.key === 'j') {
        // Set canClick to true when the space bar is pressed 
        if (canClick) {

          let imgY = parseInt(img.style.top); // Default to 0 if top is not set
          img.style.top = imgY - 63 + "%"; //  - 25 + "%"

          // Prevent further clicks during the cool-down period
          canClick = false;

          setTimeout(function () {
            // Move back down to the original position
            img.style.top = imgY + "%";

            // Allow clicks again after the cool-down period
            canClick = true;
          }, 600); // 500ms delay
        }
      }
    });
    // document.addEventListener("click", function() {

    // });
    // Callback function to move the background 
    function draw() {
      // request another animation frame
      requestAnimFrame(draw);
      // reset position to 0 once the image has scrolled far enough
      // Got rid of this in Kents code because if I didnt it resets te position and looks funny
      //   // Set actual background position  

      // I grabbed the below animation code from Kent Jones
      // The purpose was for: Coyote Controller Class
      // Here are the resources he used as well
      // Resources Used:
      //  http://www.htmlandcssbook.com/
      //  http://javascriptbook.com/ 
      //  parallax scrolling tutorials: 
      //      https://webdesign.tutsplus.com/categories/parallax-scrolling
      // License: MIT License: https://opensource.org/licenses/MIT 
      position = position - speed;
      $('#Background').css('background-position', (position * (1.0 / 8.0)));
      $('#Midground').css('background-position', (position * (1.0 / 3.0)));
      $('#Foreground').css('background-position', position);


    }
    // This is to set all the right things to be visible once a person presses play game

    ///// STARTING FUNCTIONS
    DinoGame.display();
    draw();
    // var points = 0;
    var myObject = document.getElementById('Rock');
    rockMove(DinoGame.points, myObject);

    function rockMove(points, myObject) {
      document.querySelector("#test").innerHTML = "Score:"
      // Game.display();
      document.querySelector("#test2").innerHTML = points; // Replace 'yourObjectId' with the actual ID of your object
      currentPosition = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
      var moveSpeed = 20; // Adjust the speed based on your preference
      var crashed = false;
      // Move the object to the left continuously
      var moveInterval = setInterval(function () {
        currentPosition -= moveSpeed; // current posotion moving left 
        myObject.style.left = currentPosition + 'px'; // that becomes new position

        var otherobj = myObject;
        if (crashRock(otherobj)) {
          myImage = document.getElementById('Gameover');
          myImage.style.display = 'block';
          var myImage = document.getElementById('play');
          myImage.style.display = 'block';
          const img = document.getElementById("Dinosaur");
          img.style.display = 'none';
          myImage = document.getElementById('DinosaurPic');
          myImage.style.top = -100 + "px";
          myImage.style.display = 'block';
          myImage = document.getElementById('Rock');
          myImage.style.top = 0 + "px";
          var myImage = document.getElementById('Bigrock');
          myImage.style.top = -110 + "px";
          clearInterval(moveInterval);
          speed = 0;
          crashed = true;
        }

      }, 20); // Adjust the interval (milliseconds) 

      function continueOn() {
        clearInterval(moveInterval);
        //      //  // Generate a random number between 0 and 3
        var randomNum = Math.floor(Math.random() * 4);
        //  document.querySelector("#test3").innerHTML = randomNum;
        // // Check if the condition should be true based on the random number
        if (randomNum == 1) {
          var myImage = document.getElementById('Bigrock');
          myImage.style.display = 'block';
          var myImage = document.getElementById('Rock');
          myImage.style.display = 'none';
          myObject = document.getElementById('Bigrock');
        } else {
          var myImage = document.getElementById('Bigrock');
          myImage.style.display = 'none';
          var myImage = document.getElementById('Rock');
          myImage.style.display = 'block';
          myObject = document.getElementById('Rock');
        }
        currentPosition = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
        myObject.style.left = currentPosition + 'px';
        document.querySelector("#test2").innerHTML = points + randomNum;

        rockMove(points, myObject);

      }

      setTimeout(function () {
        if (!crashed) {
          points++;
          continueOn();
        }
      }, 3200);


      // Updae the background position by the speed
    }

    // This function is used to check if the two images are touching each other
    // if the two images are touching each other, then there is a crash
    // if the two images did not touch each other, it adds a point to score
    // this iterates for every movement being made
    // I grabed the basis of this from w3 game building tutorial
    //https://www.w3schools.com/graphics/game_obstacles.asp
    // https://www.w3schools.com/jsref/prop_element_offsetleft.asp
    function crashRock(otherobj) {
      //   let html = '';
      var obj = document.getElementById('Dinosaur');
      var myleft = obj.offsetLeft;

      var myright = obj.offsetLeft + obj.offsetWidth;
      //    html += "right&nbsp;"+ obj.offsetLeft + obj.offsetWidth;
      var mytop = obj.offsetTop;
      //     html += "top &nbsp;"+obj.offsetTop;
      var mybottom = obj.offsetTop + obj.offsetHeight;
      //  html += "&nbsp;"+ obj.offsetTop + obj.offsetHeight;



      var otherleft = otherobj.offsetLeft;
      //    html += "Left &nbsp;" + otherobj.offsetLeft;
      var otherright = otherobj.offsetLeft + otherobj.offsetWidth;
      var othertop = otherobj.offsetTop;
      var otherbottom = otherobj.offsetTop + otherobj.offsetHeight;
      //   document.querySelector("#test").innerHTML = html;
      var crash = true;
      if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
        crash = false;
      }
      return crash;
    }
  });


})(jQuery);    
