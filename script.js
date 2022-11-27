window.addEventListener('load',function (){
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); //argument for webGL or DX, means that we work in 2d not 3d
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    class InputHandler{
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e=>{
                if(( (e.key === 'ArrowUp') ||
                     (e.key === 'ArrowDown') ||
                     (e.key === 'ArrowLeft') ||
                     (e.key === 'ArrowUp') ) && this.game.keys.indexOf(e.key) === -1)//check if button is pressed AND if it's not yet in the array
                        {
                            this.game.keys.push(e.key);
                        }
                else if(e.key === ' '){
                    this.game.player.shootTop();
                }
                else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
                console.log(this.game.keys)
            });
            window.addEventListener('keyup', e=>{                         //check if button is released and then delete key from array
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);            //first arg is object, second is delete count indicating number of deleted elements
                }
                console.log(this.game.keys)
            });
        }
    }

    class Particle {

    }

    class Projectile{
        constructor(game, x ,y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 184;
            this.height = 102;
            this.speed = 3;
            this.markedForDeletion = false;                                                //flag for deleting objects

            this.image = document.getElementById('projectile');
            this.frameX=0;
            this.frameY=0;
            this.maxFrame=5;

        }
        update() {
            this.x += this.speed;
            //Powerup state
            if(!this.game.player.powerUp) this.frameY=1;
            else this.frameY=0;
            //changing frames for moving
            if( this.game.gameTime % 6 > 5) {
                if (!this.turningBack) {
                    this.frameX++;
                    if (this.frameX >= this.maxFrame)
                        this.turningBack = true;
                } else {
                    this.frameX--;
                    if (this.frameX === 0)
                        this.turningBack = false;
                }
            }

            if(this.x > this.game.width * 0.9) this.markedForDeletion = true;               //if projectile is almost out of map we have to delete it
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width,this.frameY * this.height,
                this.width,this.height ,this.x, this.y, this.width, this.height);
        }
    }

    class Player{
        constructor(game) {
            this.game = game;
            this.width=138;
            this.height=131;
            this.x = 20;
            this.y = 100;
            this.speedY=0;
            this.speedMax=2;
            this.projectiles=[];


            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 4;
            this.turningBack = false;

            this.image = document.getElementById('player');

            this.powerUp=false;
            this.powerUpTimer=0;
            this.powerUpLimit=10000;

        }
        update(){
            //handling moving top-down
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.speedMax;
            else if (this.game.keys.includes('ArrowDown')) this.speedY= this.speedMax;
            else this.speedY=0;
            this.y += this.speedY;

            //calling update for every projectile in array
            this.projectiles.forEach(projectile => {
                projectile.update();
            })

            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)

            //changing frames for moving
            if( this.game.gameTime % 6 > 5) {
                if (!this.turningBack) {
                    this.frameX++;
                    if (this.frameX >= this.maxFrame)
                        this.turningBack = true;
                } else {
                    this.frameX--;
                    if (this.frameX === 0)
                        this.turningBack = false;
                }
            }

        }
        draw(context){

            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width,this.frameY * this.height,this.width,this.height ,this.x, this.y, this.width, this.height)
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
        }
        shootTop(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y ));
                this.game.ammo--;
            }
        }
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////                                ENEMY CLASSES                                       ///////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    class Enemy{
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;


            this.frameX=0;
            this.frameY=0;
            this.turningBack = false;
        }
        update(){
            //Moving on the map & deleting
            this.x += this.speedX;
            if(this.x + this.width < 0) this.markedForDeletion = true;  //if enemy X coord is <0 mark him for deletion
            //changing frames for moving
            if(this.game.gameTime % 19 > 18) {
                console.log("FrameX: "+this.frameX);
                if (!this.turningBack) {
                    this.frameX++;
                    if (this.frameX >= this.maxFrame) {
                        this.turningBack = true;
                    }
                } else {
                    this.frameX--;
                    if (this.frameX === 0)
                        this.turningBack = false;
                }
            }
        }
        draw(context){
            if(this.game.debug) {
                context.fillStyle = 'red';
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.fillStyle = 'black';
                context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y)
            }
            context.drawImage(this.image, this.frameX * this.width,this.frameY * this.height,
                this.width,this.height, this.x, this.y, this.width, this.height);

        }

    }

    class Wyvern extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 3;
            this.score = this.lives;
            this.width = 191;
            this.height = 161;
            this.image = document.getElementById("enemyWyvern");
            this.y = Math.random() * (this.game.height * 0.9 - this.height);    //Formula is:random * (Height of screen *0.9 - height of enemy)  to avoid situations where enemy is spawned below the map.
            this.maxFrame = 2;
        }
    }

    class Ghost extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 8;
            this.score = this.lives;
            this.width = 341.33;
            this.height = 204.8;
            this.image = document.getElementById("enemyGhost");
            this.y = Math.random() * (this.game.height * 0.9 - this.height);    //Formula is:random * (Height of screen *0.9 - height of enemy)  to avoid situations where enemy is spawned below the map.
            this.maxFrame = 2;
        }
    }

    class Parrot extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 2;
            this.score = -5;
            this.width = 286;
            this.height = 265;
            this.image = document.getElementById("enemyBird");
            this.y = Math.random() * (this.game.height * 0.9 - this.height);    //Formula is:random * (Height of screen *0.9 - height of enemy)  to avoid situations where enemy is spawned below the map.
            this.maxFrame = 8;
        }
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1920;
            this.height = 693;
            this.x=0;
            this.y=0;

        }

        update(){
            if(this.x <= -this.width) this.x =0;
            else this.x -= this.game.speed * this.speedModifier;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y);//draw background
            context.drawImage(this.image, this.x + this.width, this.y);//draw second image to make sure that it looks like endless background
        }
    }

    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.layer1 = new Layer(this.game, this.image1, 3);
            this.layer2 = new Layer(this.game, this.image2, 3);
            this.layers = [this.layer1];
        }

        update() {
            this.layers.forEach(layer => layer.update());
        }

        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class Explosion {
        constructor(game, x, y) {
            this.game = game;
            this.spriteHeight = 200;

            this.markedForDeletion = false;

            this.frameX = 0;
            this.maxFrame = 8;
            this.fps = 15;
            this.interval = 1000/this.fps;
            this.timer = 0;

        }
        update(deltaTime) {
            //Moving animation
            this.x -= game.speed;

            //Animating explosion
            if(this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if(this.frameX > this.maxFrame) this.markedForDeletion = true;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0,
                this.spriteWidth,this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }

    class SmokeExplosion extends Explosion {
        constructor(game, x ,y) {
            super(game, x ,y);
            this.image = document.getElementById('smokeExplosion');
            this.spriteWidth = 200;

            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
        }
    }

    class FireExplosion extends Explosion {
        constructor(game, x ,y) {
            super();
            this.image = document.getElementById('fireExplosion');
            this.spriteWidth = 200;

            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
        }
    }

    class UI{           //draw score and so on
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Helvetica";
            this.color = "white";

        }


        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black'

            //score
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.fillText("Score " + this.game.score + "/"+this.game.winningScore, 20, 40);

            //ammo
            for (let i = 0; i < this.game.ammo; i++) {
                    context.fillRect(20 + 5 * i,50,3,20);
            }

            //timer for g-over
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            const formattedTime2 = (this.game.timeLimit * 0.001).toFixed(1);
            context.fillText('Timer  ' + formattedTime+"/"+formattedTime2, 20, 100);

            //game over messages
            if(this.game.gameOver) {
                context.textAlign = 'center';
                let message1, message2;
                if(this.game.score > this.game.winningScore) {
                    message1 = "You win!";
                    message2 = "Well done!";
                } else {
                    message1 = "You lost!";
                    message2 = "Try again next time!";
                }
                context.font = "50px " + this.fontFamily;
                context.fillText(message1, this.game.width *0.5, this.game.height * 0.5 - 40);
                context.font = "25px " + this.fontFamily;
                context.fillText(message2, this.game.width *0.5, this.game.height * 0.5 + 40);
            }

            context.restore();
        }

    }

    class Game{         //logic of the game
        constructor(width, height) {
            //Basic instructions for creating windows and player
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            //Keys input
            this.input = new InputHandler(this);
            this.keys = [];
            //Ammo
            this.ammo = 20;                         //Actual ammo count
            this.maxAmmo = 50;                      //Max ammo count
            //UI
            this.ui = new UI(this);
            //Enemies
            this.smokeExplosions = [];
            this.fireExplosions = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyIntervalTimer = 1000;        //Create enemy every 1 second

            //Periodic events timers
            this.ammoRechargeTimer = 0;
            this.ammoRechargeIntervalTimer = 500;  //Recharge 1 ammo every 0.5 second

            //Scores
            this.score = 0;
            this.winningScore = 30;

            //Game over limit time
            this.gameTime = 0;
            this.timeLimit = 30000;
            this.gameOver = false;

            //background
            this.speed =1;
            this.background = new Background(this);

            this.debug = false;



        }
        update(deltaTime){
            if( !this.gameOver ) this.gameTime += deltaTime;
            if( this.gameTime > this.timeLimit ) this.gameOver = true;

            this.background.update();
            this.background.layer2.update();
            if(!this.gameOver) this.player.update();

            //Recharging player's ammo
            if(this.ammoRechargeTimer > this.ammoRechargeIntervalTimer){
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoRechargeTimer=0;
            }
            else {
                this.ammoRechargeTimer+=deltaTime;
            }

            // Updating enemies
            if(!this.gameOver) {
                this.enemies.forEach(enemy => {
                    enemy.update();
                    if (this.checkCollision(this.player, enemy)) {
                        enemy.markedForDeletion = true;
                        this.score -= enemy.score*2;
                        this.addExplosion(enemy);
                    }
                    this.player.projectiles.forEach(projectile => {
                        if (this.checkCollision(projectile, enemy)) {
                            enemy.lives--;
                            projectile.markedForDeletion = true;
                            if (enemy.lives <= 0) {
                                enemy.markedForDeletion = true;
                                this.addExplosion2(enemy);
                                if (!this.gameOver) this.score += enemy.score;

                                if (this.score > this.winningScore) this.gameOver = true;
                            }
                        }

                    })
                })
            }
            //Explosions
            this.smokeExplosions.forEach(explosion => explosion.update(deltaTime));
            this.smokeExplosions = this.smokeExplosions.filter(explosion => !explosion.markedForDeletion);
            this.fireExplosions.forEach(explosion => explosion.update(deltaTime));
            this.fireExplosions = this.fireExplosions.filter(explosion => !explosion.markedForDeletion);


            //Deleting enemies
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyIntervalTimer && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

        }
        draw(context){
            this.background.draw(context);
            if(!this.gameOver) {
                this.player.draw(context);
            }
                this.ui.draw(context);
            if(!this.gameOver) {
                this.enemies.forEach(enemy => {
                    enemy.draw(context);
                })
            }
            this.smokeExplosions.forEach(explosion => {
                explosion.draw(context);
            })
            this.fireExplosions.forEach(explosion => {
                explosion.draw(context);
            })

            this.background.layer2.draw(context);

        }

        addExplosion(enemy) {
            const randomize = Math.random();
            if(randomize < 1) this.smokeExplosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }

        addExplosion2(enemy) {
            const randomize = Math.random();
            if(randomize < 1) this.fireExplosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));

        }

        addEnemy(){
            this.enemies.push(new Wyvern(game));   //passing game into enemies array
            this.enemies.push(new Wyvern(game));   //passing game into enemies array
            this.enemies.push(new Ghost(game));   //passing game into enemies array
        }
        checkCollision(rect1, rect2){
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width >  rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y)


        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;           //last
    //animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime; //diff between this animation loop and the timestamp from the previous animation loop
        lastTime = timeStamp;                   //we set the lastTime to timeStamp, so we can use it to calculate delta next time
        ctx.clearRect(0,0, canvas.width, canvas.height );
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate); //Passing animate to create endless animation loop, auto generates time stamp and interval

    }
    animate(0)

})