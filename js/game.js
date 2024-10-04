// title Screen, A Separate Scene
let titleScene = new Phaser.Scene('Title');

titleScene.preload = function (){
    this.load.image('titlebackground', 'assets/title-background.png');
}

titleScene.create = function (){
    let backgr = this.add.sprite(0, 0, 'titlebackground');
    backgr.setOrigin(0, 0);
    backgr.displayWidth = 640;
    backgr.displayHeight = 360;

    let gameW = this.sys.game.config.width;
    let gameH = this.sys.game.config.height;

    let text = this.add.text(220, 200, 'Welcome To My Game');

    this.input.on('pointerup', function (pointer){
        this.scene.start('Game');
    }, this);
}


// Create a new scene
let gameScene = new Phaser.Scene('Game');

// Initiate Game Parameters
gameScene.init = function(){

    // player speed
    this.playerSpeed = 5;

    // enemy speed
    this.enemyMinSpeed = 2;
    this.enemyMaxSpeed = 5;

    // Boundaries
    this.enemyMinY = 80;
    this.enemyMaxY = 280;

    // not terminating
    this.isTerminating = false;
}

// Load assets
gameScene.preload = function (){
    // Load images
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/dragon.png');
    this.load.image('goal', 'assets/treasure.png');
};

// Called once after preload ends
gameScene.create = function (){
    let bg = this.add.sprite(0, 0, 'background');
    // bg.setOrigin(0,0);
    // OR
    bg.setPosition(640/2,360/2);

    let gameW = this.sys.game.config.width;
    let gameH = this.sys.game.config.height;

    // Create player
    this.player = this.add.sprite(50, 180, 'player');

    // Reducing width and height of player by 50%
    this.player.setScale(0.4); 

    // Add Treasure
    this.goal = this.add.sprite(gameW-80, gameH/2, 'goal');
    this.goal.setScale(0.6);

    // Add enemy
    this.enemies = this.add.group({
        key: 'enemy',
        repeat: 5,
        setXY: {
            x: 90,
            y: 100,
            stepX: 80,
            stepY: 20
        }
    });

    // this.enemy = this.add.sprite(120, gameH/2, 'enemy');
    // this.enemy.flipX = true;
    // // this.enemy.setScale(0.6);

    // this.enemies.add(this.enemy);

    // Setting scale to all group elements
    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);


    // set flipX and speed
    Phaser.Actions.Call(this.enemies.getChildren(), function(enemy){
        // flip enemy
        enemy.flipX = true;

        // Set enemy speed
        let dir = Math.random() < 0.5 ? 1 : -1;
        let speed = this.enemyMinSpeed + (Math.random() * (this.enemyMaxSpeed -  this.enemyMinSpeed));
        enemy.speed = dir*speed;

    }, this)

    console.log(this.enemies.getChildren());    

};

// this is called upto 60 times per second
gameScene.update = function (){
    // don't execute if terminating
    if (this.isTerminating){
        return;
    }

    // Check for active input
    if (this.input.activePointer.isDown){
        this.player.x += this.playerSpeed;
    }

    // Checking Collision with treasure
    let playerRect = this.player.getBounds();
    let goalRect = this.goal.getBounds();
    
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)){
        console.log('Reached Goal haha!');

        // Restart the scene
        // this.scene.manager.bootScene(this); OR
        
        return this.gameOver();
    }

    // get enemies
    let enemies = this.enemies.getChildren();
    let numEnemies = enemies.length;

    for(let i = 0; i < numEnemies; i++){
        // Enemy Movement
        enemies[i].y += enemies[i].speed;

        // Check we haven't passed min or max y
        let ConditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
        let ConditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
        
        // if upper or lower limit passed, reverse
        if (ConditionUp || ConditionDown){
            enemies[i].speed *= -1;
        }
        
        let enemyRect = enemies[i].getBounds();
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)){
            console.log('Game Over');

            // Restart the scene
            // this.scene.manager.bootScene(this); OR
            return this.gameOver();
        }
    }

};

gameScene.gameOver = function (){

    // initiated game over sequence
    this.isTerminating = true;

    // Adding shake effect
    this.cameras.main.shake(500);

    // listen for event completion
    this.cameras.main.on('camerashakecomplete', function(camera, effect){
        // fade out
        this.cameras.main.fade(500);
        // this.scene.restart();
    }, this);

    this.cameras.main.on('camerafadeoutcomplete', function(){
        this.scene.restart();
    }, this);
}

// Set the configuration of the game
let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: [titleScene, gameScene]
};

// Create a new game, pass the configuration
let game = new Phaser.Game(config);