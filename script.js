window.addEventListener('load',function (){
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); //argument for webGL or DX, means that we work in 2d not 3d
    canvas.width = 500;
    canvas.height = 500;

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
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;                                                //flag for deleting objects
        }
        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 0.9) this.markedForDeletion = true;               //if projectile is almost out of map we have to delete it
        }
        draw(context) {
            context.fillStyle = 'yellow';                                                   //yellow lasers as projectiles
            context.fillRect(this.x, this.y, this.height, this.width);
        }
    }

    class Player{
        constructor(game) {
            this.game = game;
            this.width=120;
            this.height=160;
            this.x = 20;
            this.y = 100;
            this.speedY=0;
            this.speedMax=2;
            this.projectiles=[];
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

        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
        }
        shootTop(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
                console.log(this.projectiles);
            }
        }
    }

    class Enemy{

    }

    class Layer {

    }

    class Background {

    }

    class UI{           //draw score and so on

    }

    class Game{         //logic of the game
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.keys = [];
            this.ammo = 20;
        }
        update(){
            this.player.update();
        }
        draw(context){
            this.player.draw(context);
        }
    }

    const game = new Game(canvas.width, canvas.height);
    //animation loop
    function animate(){
        ctx.clearRect(0,0, canvas.width, canvas.height );
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate); //Passing animate to create endless animation loop, auto generates time stamp and interval

    }
    animate()

})