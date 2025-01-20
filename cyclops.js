class Cyclops {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./Cyclops.png");

        this.x = x;
        this.y = y;
        this.speed = 1;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackDuration = 2.6;
        this.attack2Duration = 1.4;

        this.facing = 0; //0 = right, 1 = left
        this.state = 0; //Idle, walk, stomp, rock throw, take damage
        this.dead = false;

        this.velocity = {x: 0, y: 0}; 

        this.animations = [];
        this.deathAnim = [];
        this.loadAnimations();

    };
    loadAnimations() {
        for (var i = 0; i < 2; i++) {
            this.animations.push([]);
            for (var j = 0; j < 6; j++) {
                this.animations[i].push([]);
            }
        }

        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 1, 64, 64, 15, 0.2, 0, false, true); //Idle
        this.animations[0][1] = new Animator(this.spritesheet, 0, 65, 64, 64, 12, 0.2, 0, false, true); //Walk
        this.animations[0][2] = new Animator(this.spritesheet, 0,129, 64, 64, 7, 0.2, 0, false, true); //Stomp
        this.animations[0][3] = new Animator(this.spritesheet, 0,193, 64, 64, 13, 0.2, 0, false, true); //Rock throw
        this.animations[0][4] = new Animator(this.spritesheet, 0,257, 64, 64, 3, 0.2, 0, false, true); //Take Damage
        this.animations[0][5] = new Animator(this.spritesheet, 0,321, 64, 64, 5, 0.2, 0, false, true); //Take heavy damage

        this.deathAnim[0] = new Animator(this.spritesheet, 0,385, 40, 48, 9, 0.2, 24, false, false); // Death

        //facing left = 1
        this.animations[1][0] = new Animator(this.spritesheet, 0,641, 64, 64, 15, 0.2, 0, false, true); //Idle
        this.animations[1][1] = new Animator(this.spritesheet, 0,705, 64, 64, 12, 0.2, 0, false, true); //Walk
        this.animations[1][2] = new Animator(this.spritesheet, 0,769, 64, 64, 7, 0.2, 0, false, true); //Stomp
        this.animations[1][3] = new Animator(this.spritesheet, 0,833, 64, 64, 13, 0.2, 0, false, true); //Rock throw
        this.animations[1][4] = new Animator(this.spritesheet, 0,897, 64, 64, 3, 0.2, 0, false, true); //Take Damage
        this.animations[1][5] = new Animator(this.spritesheet, 0,961, 64, 64, 5, 0.2, 0, false, true); //Take heavy damage

        this.deathAnim[1] = new Animator(this.spritesheet, 11,1025, 64, 64, 9, 0.2, 0, false, false); // Death
        //Can still add eye scratching and eye blast attack

    };
    updateBB() {

    };
    update() {
        if (this.game.leftclick && !this.attacking) {
            this.attack();
            this.game.leftclick = false;
        }
        if (this.game.rightclick && !this.attacking) {
            this.attack2();
            this.game.rightclick = false;
        }
        if (!this.attacking) {
            let target = this.game.mouse;
            if (target != null && target != this.velocity && !this.dead) {
                let deltaX = target.x - this.velocity.x;
                let deltaY = target.y - this.velocity.y;
                let distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                
                //X movement
                if (target.x > this.velocity.x) {
                    if (this.velocity.x + deltaX / distance * this.speed > target.x) { 
                        this.velocity.x = target.x;
                    } else {
                        this.velocity.x += deltaX / distance * this.speed;
                    }
                    this.facing = 0;
                    this.state = 1;
                } else if (target.x < this.velocity.x) {
                    if (this.velocity.x + deltaX / distance * this.speed < target.x) {
                        this.velocity.x = target.x;
                    } else {
                        this.velocity.x += deltaX / distance * this.speed;
                    }
                    this.facing = 1;
                    this.state = 1;
                } else {
                    this.state = 0;
                }
        
        
                //Y movement
                if (target.y > this.velocity.y) {
                    if (this.velocity.y + deltaY / distance * this.speed > target.y) {
                        this.velocity.y = target.y;
                    } else {
                        this.velocity.y += deltaY / distance * this.speed;
                    }
                    this.state = 1;
                } else if (target.y < this.velocity.y) {
                    if (this.velocity.y + deltaY / distance * this.speed < target.y) {
                        this.velocity.y = target.y;
                    } else {
                        this.velocity.y += deltaY / distance * this.speed;
                    }
                    this.state = 1;
                }
                this.x = this.velocity.x - 96;
                this.y = this.velocity.y -96;
            }
        }
        if (this.attacking) { //when we're in our attacking animation, we wanna time it.
            this.attackTimer -= this.game.clockTick;
            //End attack when timer expires
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.state = 0;
                this.animations[this.facing][this.state].elapsedTime = 0;
            }
        }   
    };
    attack() {
        this.attackTimer = this.attackDuration;
        this.attacking = true;
        this.state = 3;
        this.animations[this.facing][this.state].elapsedTime = 0;
    };
    attack2() {
        this.attackTimer = this.attack2Duration;
        this.attacking = true;
        this.state = 2;
        this.animations[this.facing][this.state].elapsedTime = 0;
    };

    draw(ctx) {
        if (this.dead) {
            this.deathAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        } else {
            this.animations[this.facing][this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
    };
};