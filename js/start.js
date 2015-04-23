(function(){
  game.state.add('menu', {preload:preload, create:create});
  game.state.start('menu');

  function preload(){
    // on preload, load our images
        game.load.image('stars', '../assets/stars.png');
        game.load.image('ship', '../assets/ship2.png');
        game.load.image('shipBullet', '../assets/shipBullet.png');
        game.load.image('sharkToRight', '../assets/sharkToRight.png');
        game.load.image('sharkToLeft', '../assets/sharkToLeft.png');
        game.load.image('twister', '../assets/tornado1.png');
        game.load.image('bubble', '../assets/bubble256.png');
        game.load.spritesheet('explosion', '../assets/explode.png', 128, 128);
  }

  function create(){
    game.add.tileSprite(0, 0, 900, 600, 'stars');
    game.add.text(game.world.centerX - 150, game.world.centerY, 'Press Enter To Start', { font: '36px Arial', fill: 'lightgreen' });

    var ENTER = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    ENTER.onDown.add(startGame);
  }

  function startGame() {
    this.game.state.start('playGame');
  }
})();