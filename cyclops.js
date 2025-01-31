class Cyclops {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png");

        this.x = x;
        this.y = y;
        this.speed = 1;
        this.attacking = false;
      
        this.projectile = false;
        this.melee = false;
        this.damage = false;
        this.attackTimer = 0;   
        this.attackDuration = 2.6; //Throw attack
        this.attack2Duration = 1.4; //Stomp attack
        this.damageTimer = 0;
        this.damagerDuration = 0.6;

        this.throwAttackCooldown = 5;
        this.AttackCooldown = 0;

        this.detectionRange = 500;
        this.meleeRange = 75;

        this.facing = 0; //0 = right, 1 = left
        this.state = 0; //Idle, walk, stomp, rock throw, take damage
        this.dead = false;

        this.location = {x: this.x, y: this.y}; 
        this.target = {x: 0, y: 0};

        this.updateBB();

        this.animations = [];
        this.deathAnim = [];
        this.loadAnimations();

    };
    loadAnimations() {
        for (var i = 0; i < 2; i++) {
            this.animations.push([]);
            for (var j = 0; j < 8; j++) {
                this.animations[i].push([]);
            }
        }

        // facing right = 0
        this.animations[0][0] = new Animator(this.spritesheet, 0, 1, 64, 64, 15, 0.2, 0, false, true); //Idle
        this.animations[0][1] = new Animator(this.spritesheet, 0, 65, 64, 64, 12, 0.2, 0, false, true); //Walk
        this.animations[0][2] = new Animator(this.spritesheet, 0, 129, 64, 64, 7, 0.2, 0, false, true); //Stomp
        this.animations[0][3] = new Animator(this.spritesheet, 0, 193, 64, 64, 13, 0.2, 0, false, true); //Rock throw
        this.animations[0][4] = new Animator(this.spritesheet, 0, 257, 64, 64, 3, 0.2, 0, false, true); //Take Damage
        this.animations[0][5] = new Animator(this.spritesheet, 0, 321, 64, 64, 5, 0.2, 0, false, true); //Take heavy damage
        this.animations[0][6] = new Animator(this.spritesheet, 0, 449, 64, 64, 4, 0.2, 0, false, true); // Eye protect
        this.animations[0][7] = new Animator(this.spritesheet, 0, 513, 64, 64, 6, 0.2, 0, false, true); // Eye beam

        this.deathAnim[0] = new Animator(this.spritesheet, 0,385, 40, 48, 9, 0.2, 24, false, false); // Death

        //facing left = 1
        this.animations[1][0] = new Animator(this.spritesheet, 0,641, 64, 64, 15, 0.2, 0, false, true); //Idle
        this.animations[1][1] = new Animator(this.spritesheet, 0,705, 64, 64, 12, 0.2, 0, false, true); //Walk
        this.animations[1][2] = new Animator(this.spritesheet, 0,769, 64, 64, 7, 0.2, 0, false, true); //Stomp
        this.animations[1][3] = new Animator(this.spritesheet, 0,833, 64, 64, 13, 0.2, 0, false, true); //Rock throw
        this.animations[1][4] = new Animator(this.spritesheet, 0,897, 64, 64, 3, 0.2, 0, false, true); //Take Damage
        this.animations[1][5] = new Animator(this.spritesheet, 0,961, 64, 64, 5, 0.2, 0, false, true); //Take heavy damage
        this.animations[1][6] = new Animator(this.spritesheet, 0,1089, 64, 64, 4, 0.2, 0, false, true); 
        this.animations[1][7] = new Animator(this.spritesheet, 0,1153, 64, 64, 5, 0.2, 0, false, true); 

        this.deathAnim[1] = new Animator(this.spritesheet, 11,1025, 64, 64, 9, 0.2, 0, false, false); // Death

    };
    updateBB() {
        this.BB = new BoundingBox(this.x + 54, this.y + 72, 40*2, 60*2);
    };
    update() {
        if (this.game.leftclick && !this.attacking) {
            this.attack();
            this.game.leftclick = false;
        }
        if (this.game.rightclick && !this.attacking) {
            this.takeDamage();
            this.game.rightclick = false;
        }
        if (this.damage) {
            this.damageTimer -= this.game.clockTick;
            if (this.damageTimer <= 0) {
                this.damage = false;
                this.state = 0;
            }
        }
        //When outside of range, idle. When in range, ranged attack while walking towards character. When near character, stomp attack.
        this.target = this.game.mouse;
        if (this.target != null && this.location != null && !this.damage) {
            if (!this.attacking && !this.damage) {
                if (this.target != this.location && !this.dead && getDistance(this.location, this.target) < this.detectionRange) {
                    let deltaX = this.target.x - this.location.x;
                    let deltaY = this.target.y - this.location.y;
                    let distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                    
                    //X movement
                    if (this.target.x > this.location.x) {
                        if (this.location.x + deltaX / distance * this.speed > this.target.x) { 
                            this.location.x = this.target.x;
                        } else {
                            this.location.x += deltaX / distance * this.speed;
                        }
                        this.facing = 0;
                        this.state = 1;
                    } else if (this.target.x < this.location.x) {
                        if (this.location.x + deltaX / distance * this.speed < this.target.x) {
                            this.location.x = this.target.x;
                        } else {
                            this.location.x += deltaX / distance * this.speed;
                        }
                        this.facing = 1;
                        this.state = 1;
                    } else {
                        this.state = 0;
                    }
            
            
                    //Y movement
                    if (this.target.y > this.location.y) {
                        if (this.location.y + deltaY / distance * this.speed > this.target.y) {
                            this.location.y = this.target.y;
                        } else {
                            this.location.y += deltaY / distance * this.speed;
                        }
                        this.state = 1;
                    } else if (this.target.y < this.location.y) {
                        if (this.location.y + deltaY / distance * this.speed < this.target.y) {
                            this.location.y = this.target.y;
                        } else {
                            this.location.y += deltaY / distance * this.speed;
                        }
                        this.state = 1;
                    }
                    this.x = this.location.x - 96;
                    this.y = this.location.y - 128;
                }
            }
            if (getDistance(this.location, this.target) < this.detectionRange && getDistance(this.location, this.target) < this.meleeRange) {
                this.AttackCooldown = 0;
            }
            if (getDistance(this.location, this.target) < this.detectionRange && !this.attacking && this.AttackCooldown <= 0) {
                if (getDistance(this.location, this.target) > this.meleeRange) {
                    this.attack();
                } else {
                    this.attack2();
                }
            }
            if (getDistance(this.location, this.target) < this.detectionRange) this.AttackCooldown -= this.game.clockTick; 
        }
        if (this.attacking) { 
            this.attackTimer -= this.game.clockTick;
            this.target = this.game.mouse;
            // if (this.target.x > this.location.x) {
            //     this.facing = 0;
            // } else {
            //     this.facing = 1;
            // }
            if (this.projectile && this.attackTimer <= 0.4) {
                this.game.addEntity(new Rock(this.game, this.x + 96, this.y + 64, this.facing, this.target));
                this.projectile = false;
                this.AttackCooldown = this.throwAttackCooldown;
            }
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.melee = false;
                this.state = 0;
                this.animations[this.facing][this.state].elapsedTime = 0;
                if (this.melee) this.AttackCooldown = 0;
            }
        }
        this.updateBB();   
    };
    attack() {
        this.attackTimer = this.attackDuration;
        this.attacking = true;
        this.state = 3;
        this.projectile = true;
        this.animations[this.facing][this.state].elapsedTime = 0;
    };
    attack2() {
        this.attackTimer = this.attack2Duration;
        this.attacking = true;
        this.state = 2;
        this.melee = true;
        this.animations[this.facing][this.state].elapsedTime = 0;
    };
    takeDamage(damage) {
        this.state = 4;
        this.damage = true;
        this.damageTimer = this.damagerDuration;
        this.animations[this.facing][this.state].elapsedTime = 0;
    };

    facing() {
        if (this.target.x > this.location.x) {
            this.facing = 0;
        } else {
            this.facing = 1;
        }
    };

    draw(ctx) {
        if (this.dead) {
            this.deathAnim[this.facing].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
            this.removeFromWorld = true;
        } else {
            this.animations[this.facing][this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
        ctx.strokeStyle = 'Red';
        ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);

        ctx.strokeStyle = "Green";
        ctx.beginPath();
        ctx.arc(this.x + 96, this.y + 128, this.detectionRange, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = 'Black';
        ctx.beginPath();
        ctx.arc(this.x + 96, this.y + 128, this.meleeRange, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
    };
};