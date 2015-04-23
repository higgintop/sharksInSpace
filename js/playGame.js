(function(){

    game.state.add('playGame', {create:create, update:update});

    var ACCLERATION = 300;
    var DRAG = 500;
    var MAXSPEED = 300;

    var ship;
    var stars;
    var keyboard, fireBtn, startBtn;
    var shipBullets;
    var bulletTimer = 0;
    var explosions;
    var twisters;
    var sharksToLeft, sharksToRight;
    
    var gameOver;
    var health;
    var score = 0;
    var scoreText;

    var highScoreText;
    var highScore = 0;

    var lastHighScore;

    var isGameOver = false;


    //************************************************************
    // CREATE
    //************************************************************
    function create() {

        // Render the high score from firebase
        checkForHighScore();

        //  The scrolling canvas background
        stars = game.add.tileSprite(0, 0, 900, 600, 'stars');


        //  The ship bullets group
        shipBullets = game.add.group();
        shipBullets.enableBody = true;
        shipBullets.physicsBodyType = Phaser.Physics.ARCADE;
        shipBullets.createMultiple(30, 'shipBullet');
        shipBullets.setAll('anchor.x', 0.5);
        shipBullets.setAll('anchor.y', 1);
        shipBullets.setAll('outOfBoundsKill', true);
        shipBullets.setAll('checkWorldBounds', true);

        //  The ship intial position and size
        ship = game.add.sprite(400, 560, 'ship');
        ship.scale.x = 0.3;
        ship.scale.y = 0.2;
        ship.anchor.setTo(0.5, 0.5);

        // Contains Arcade Physics related collision, overlap and motion methods
        game.physics.enable(ship, Phaser.Physics.ARCADE);
        ship.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
        // drag will slow ship down when left/right arrow is released
        ship.body.drag.setTo(DRAG, DRAG);
        ship.health = 100;



        //  The sharksToLeft group
        sharksToLeft = game.add.group();
        sharksToLeft.enableBody = true;
        sharksToLeft.physicsBodyType = Phaser.Physics.ARCADE;
        sharksToLeft.createMultiple(2,'sharkToLeft');
        sharksToLeft.setAll('anchor.x', 0.5);
        sharksToLeft.setAll('anchor.y', 0.5);
        sharksToLeft.setAll('scale.x', 0.5);
        sharksToLeft.setAll('scale.y', 0.5);
        sharksToLeft.setAll('outOfBoundsKill', true);
        sharksToLeft.setAll('checkWorldBounds', true);
        sharksToLeft.forEach(function(shark){
            // shrink bounding box of each shark for better collision testing
            shark.body.setSize(shark.width/2, shark.height / 2);
            shark.damageAmount = 20;
        });
        launchSharkToLeft();


        // The sharksToRight group
        sharksToRight = game.add.group();
        sharksToRight.enableBody = true;
        sharksToRight.physicsBodyType = Phaser.Physics.ARCADE;
        sharksToRight.createMultiple(2,'shark');
        sharksToRight.setAll('anchor.x', 0.5);
        sharksToRight.setAll('anchor.y', 0.5);
        sharksToRight.setAll('scale.x', 0.5);
        sharksToRight.setAll('scale.y', 0.5);
        sharksToRight.setAll('outOfBoundsKill', true);
        sharksToRight.setAll('checkWorldBounds', true);
        sharksToRight.forEach(function(shark){
            // shrink bounding box of each shark for better collision testing
            shark.body.setSize(shark.width/2, shark.height / 2);
            shark.damageAmount = 20;
        });
        launchSharkToRight();



        // The twister group
        twisters = game.add.group();
        twisters.enableBody = true;
        twisters.physicsBodyType = Phaser.Physics.ARCADE;
        twisters.createMultiple(1,'twister');
        twisters.setAll('anchor.x', 0.5);
        twisters.setAll('anchor.y', 0.5);
        twisters.setAll('scale.x', 0.5);
        twisters.setAll('scale.y', 0.5);
        twisters.setAll('outOfBoundsKill', true);
        twisters.setAll('checkWorldBounds', true);
        twisters.forEach(function(twister){
            // shrink bounding box of each shark for better collision testing
            twister.body.setSize(twister.width / 2, twister.height / 2);
        });
        launchTwister();


        //  An explosion group
        explosions = game.add.group();
        explosions.enableBody = true;
        explosions.physicsBodyType = Phaser.Physics.ARCADE;
        explosions.createMultiple(30, 'explosion');
        explosions.setAll('anchor.x', 0.5);
        explosions.setAll('anchor.y', 0.5);
        explosions.forEach( function(explosion) {
            explosion.animations.add('explosion');
        });


       //  Health
       health = game.add.text(game.world.width - 150, 10, 'Health: ' + ship.health +'%', { font: '20px Arial', fill: 'lightgreen' });
       health.render = function () {
          health.text = 'Health: ' + Math.max(ship.health, 0) +'%';
       };


       //  Score
        scoreText = game.add.text(10, 10, '', { font: '20px Arial', fill: 'lightgreen' });
        scoreText.render = function () {
            scoreText.text = 'Score: ' + score;
        };
        scoreText.render();


        // Highest Score
        highScoreText = game.add.text(320, 10, '', { font: '20px Arial', fill: 'lightgreen' });
        //highScore = getHighScoreFromFirebase();
        highScoreText.render = function () {
            highScoreText.text = 'HIGH SCORE: ' + highScore;
        }
        console.log('rendering //////');
        highScoreText.render();


        //  Game over text
        gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER! \nclick to play again', { font: '84px Arial', fill: 'lightgreen' });
        gameOver.anchor.setTo(0.5, 0.5);
        gameOver.visible = false;



        //  controls to play game
        keyboard = game.input.keyboard.createCursorKeys();
        fireBtn = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        startBtn = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    }





    //************************************************************
    // UPDATE
    //************************************************************
    function update() {
    	//  Scroll the background
        stars.tilePosition.y += 3;

        //  Reset the player acceleration in x direction
        ship.body.acceleration.x = 0;

        // Ship is moving left (x-axis)
        if (keyboard.left.isDown)
        {
            ship.body.velocity.x = -ACCLERATION;
        } // Ship is moving right (x-axis)
        else if (keyboard.right.isDown)
        {
            ship.body.velocity.x = ACCLERATION;
        }

         //  Stop at screen edges
        if (ship.x > game.width - 50) {
            ship.x = game.width - 50;
            ship.body.acceleration.x = 0;
        }
        if (ship.x < 50) {
            ship.x = 50;
            ship.body.acceleration.x = 0;
        }

        //  Fire bullet
        if (ship.alive && fireBtn.isDown) {
            fireBullet();
        }

        //  Check shark touching/overlapping with the ship
        game.physics.arcade.overlap(ship, sharksToLeft, shipSharkCollision, null, this);
        game.physics.arcade.overlap(ship, sharksToRight, shipSharkCollision, null, this);
        // Check ship's bullet touching/overlapping with a shark
        game.physics.arcade.overlap(sharksToLeft, shipBullets, bulletSharkCollision, null, this);
        game.physics.arcade.overlap(sharksToRight, shipBullets, bulletSharkCollision, null, this);
        // Check ship touching/overlapping with a twister
        game.physics.arcade.overlap(ship, twisters, shipTwisterCollison, null, this);



        //  Game over
        if (!ship.alive && gameOver.visible === false) {
            gameOver.visible = true;
            checkForHighScore();
            var fadeInGameOver = game.add.tween(gameOver);
            fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
            fadeInGameOver.onComplete.add(setResetHandlers);
            fadeInGameOver.start();
            function setResetHandlers() {
                //  The "click to restart" handler
                tapRestart = game.input.onTap.addOnce(_restart,this);
                spaceRestart = fireBtn.onDown.addOnce(_restart,this);
                game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
                function _restart() {
                  tapRestart.detach();
                  spaceRestart.detach();
                  restart();
                }
            }
        }


    }


    //************************************************************
    // HELPER FUNCTIONS
    // - fireBullet()
    // - launchTwister() and launchShark()
    // - collisions between ship and enemy objects
    //************************************************************
    function fireBullet() {
        //  time limit so can't fire all bullets at once
        if (game.time.now > bulletTimer)
        {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 400;
            //  Grab the first bullet we can from the pool
            var bullet = shipBullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                //  Make bullet come out of tip of ship with right angle
                var bulletOffset = 20 * Math.sin(game.math.degToRad(ship.angle));
                bullet.reset(ship.x + bulletOffset, ship.y);
                bullet.angle = ship.angle;
                game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
                bullet.body.velocity.x += ship.body.velocity.x;

                bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
    }

    // ****************************************************************
    // LAUNCHING FUNCTIONS
    // ****************************************************************

    function launchTwister() {
        // twister will come from top right or top left corner
        // represent this value with 0 or 1
        var startingSide = Math.round(Math.random());
        
        var twister = twisters.getFirstExists(false);

        if (twister) {
            if (startingSide === 0) {
                // start from top left corner, move to bottom right corner
                twister.reset(0, 0);
                twister.body.velocity.x = 700;
                twister.body.velocity.y = 500;
                twister.body.drag.x = 100;
            }
            else {
                // start from top right corner, move to bottom left corner
                 twister.reset(game.width-100, 0);
                 twister.body.velocity.x = -700;
                 twister.body.velocity.y = 500;
                 twister.body.drag.x = 100;
            }
        }

        //  Send another shark 10 seconds
        game.time.events.add(10000, launchTwister);
    }

    function launchShark() {
        var MIN_SHARK_SPACING = 500;
        var MAX_SHARK_SPACING = 3000;
        var SHARK_SPEED = 300;

        var shark = sharks.getFirstExists(false);

        if (shark) {
            shark.reset(game.rnd.integerInRange(0, game.width), -20);
            game.physics.arcade.moveToObject(shark, ship, 300);
            
            //  Update function for each shark to update rotation angle
            shark.update = function(){
              shark.angle = game.math.radToDeg(Math.atan2(shark.body.velocity.x, shark.body.velocity.y));

              //  Kill sharks once they go off screen
              if (shark.y > shark.height + 200) {
                shark.kill();
              }
            }
        }

        //  Send another shark
        game.time.events.add(0, launchShark);
    }

    function launchSharkToRight() {
        var MIN_SHARK_SPACING = 500;
        var MAX_SHARK_SPACING = 3000;
        var SHARK_SPEED = 300;

        var shark = sharksToRight.getFirstExists(false);

        if (shark) {
            shark.reset(game.rnd.integerInRange(0, game.width/2), -20);
            game.physics.arcade.moveToObject(shark, ship, 300);
            
            //  Update function for each shark to update rotation angle
            shark.update = function(){
              shark.angle = game.math.radToDeg(Math.atan2(shark.body.velocity.x, shark.body.velocity.y));
            }
        }

        //  Send another shark
        game.time.events.add(0, launchSharkToRight);
    }

    function launchSharkToLeft() {
        var MIN_SHARK_SPACING = 500;
        var MAX_SHARK_SPACING = 3000;
        var SHARK_SPEED = 300;

        var shark = sharksToLeft.getFirstExists(false);

        if (shark) {
            shark.reset(game.rnd.integerInRange(game.width/2, game.width), -20);
            game.physics.arcade.moveToObject(shark, ship, 300);
            
            //  Update function for each shark to update rotation angle
            shark.update = function(){
              shark.angle = game.math.radToDeg(Math.atan2(shark.body.velocity.x, shark.body.velocity.y));
            }
        }

        //  Send another shark
        game.time.events.add(0, launchSharkToLeft);
    }


    // **********************************************************************
    // COLLISIONS
    // **********************************************************************
    function shipSharkCollision(ship, shark) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(shark.body.x + shark.body.halfWidth, shark.body.y + shark.body.halfHeight);
        explosion.body.velocity.y = shark.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        shark.kill();

        
        ship.health = ship.health - 20;
        if (ship.health <= 0){
            ship.kill();
            isGameOver = true;
            console.log('GAME OVER!');
        }
        health.render();
    }


    function shipTwisterCollison(ship, twister){
        var explosion = explosions.getFirstExists(false);
        explosion.reset(twister.body.x + twister.body.halfWidth, twister.body.y + twister.body.halfHeight);
        explosion.body.velocity.y = twister.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        twister.kill();

        ship.health = 0;
        health.render();

        ship.kill();
        isGameOver = true;
        console.log('GAME OVER');
    }

      function bulletSharkCollision(shark, bullet) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
        explosion.body.velocity.y = shark.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        shark.kill();
        bullet.kill();

        // TO DO: increase score
        score += shark.damageAmount * 10;
        scoreText.render();
    }

    function restart () {
        // Reset the sharks
        sharksToLeft.callAll('kill');
        sharksToRight.callAll('kill');
        twisters.callAll('kill');

        //  Revive the ship
        ship.revive();
        ship.health = 100;
        health.render();
        score = 0;
        scoreText.render();

        //  Hide the game over text
        gameOver.visible = false;
        isGameOver = false;

    }


    function checkForHighScore() {
        var fb = new Firebase('https://sharksinspace.firebaseio.com/highscores');
        fb.once('value', function(snapshot) {
            var lastHighScore = snapshot.val().score;
            if (score > lastHighScore) {
                console.log('new high score! ', score);
                //game.add.text(320, 10, 'HIGHEST SCORE: ' + score, { fontSize: '32px', fill: 'white' });
                highScoreText.render = function () {
                  highScoreText.text = 'HIGH SCORE: ' + score;
                }
                 highScoreText.render();
            }
            else {
                //game.add.text(320, 10, 'HIGHEST SCORE: ' + lastHighScore, { fontSize: '32px', fill: 'white' });
                highScoreText.render = function () {
                  highScoreText.text = 'HIGH SCORE: ' + lastHighScore;
                }
                 highScoreText.render();
            }
        });
    }

})();