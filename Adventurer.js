class Adventurer { //every entity should have update and draw!
    constructor(game, x, y) { //game will be the game engine!
        Object.assign(this, {game, x, y});
        this.game.adventurer = this;
        this.scale = 2.8;
        this.bitSize = 32; //32 x 32
        

        const offSet = (this.bitSize * this.scale)/2; //because of the size (2.8) of our sprite animation, we wanna go up to the scale.
        this.x = this.x - offSet; 
        this.y = this.y - offSet;
        
        this.speed = 330; //how fast the player moves


        this.state = 0; //0 = idle, 1 = walking, 2 = run, 3 = jumping, 4 = attack1, 5 = attack2, 6 = attack3, 7 = roll, 8 = ladder, 9 = bow, 10 = damaged, 11 = magic
        this.facing = 0; //0 = right, 1 = left, 2 = up, 3 = down
        this.dead = false;
        this.deathAnimationTimer = 8 * 0.12;


        this.climbingLadder = false;
        //this.attack
        this.invincible = false;
        this.velocity = {x: 0, y: 0};
        this.lastMove = 0;
        this.health = 100; //default max health of the player
        this.maxhealth = 100;

        //player getting damaged
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        

        this.currentWeapon = 1; //sword = 0, bow = 1
        this.slashType = null;

        this.timeToIdle = 3; //havent implemented but if player stands still for 3 seconds, we could do the idle animation each time

        //ROLLING PROPERTIES
        this.rolling = false; //default value because we're not rolling right now
        this.rollDuration = 0.45; // seconds
        this.rollTimer = 0;
        this.rollCooldown = 2; //after a roll, there'll be a cooldown (in seconds)
        this.rollCooldownTimer = 0;
        this.rollSpeed = 420; //faster than normal speed
        this.canRoll = true; //default value where users can roll right away


        //ATTACK PROPERTIES
        this.attacking = false;
        this.attackDuration = 0.56;  // Duration of attack animation
        this.attackTimer = 0;
        this.canAttack = true;
        this.attackCooldown = 0.4;   //Time between attacks. Most it could go down is 0.56 because of the animation attackDuration 
        this.attackCooldownTimer = 0;
        this.slashType = 0; //0 = default right slash animation, 1 = up animation
        this.slashDistance = 27; //Distance from character center to slash
        this.slashScale = 2.3; //we could upgrade slash scale, and increase the range of our sword
        this.swordUpgrade = 0; //maybe use for upgrading sword later? If we upgrade a sword, we could change colors?
        this.knockback = 2000; // Base force of knockback
        this.attackDamage = 5; 
        this.parry = false;


        //PROJECTILE PROPERTIES
        this.shooting = false;
        this.shootingDuration = 0.3; //for animation
        this.shootingTimer = 0;
        this.canShoot = true;
        this.shootCooldown = 0.8;
        this.shootCooldownTimer = 0;
        this.bowKnockback = 0;
        this.bowDamage = 4;
        this.arrowSpeed = 800; 
        this.piercing = false; //piercing could be for shooting through enemies. Collateral. Could be an upgrade

        //MAGIC AOE PROPERTIES
        this.magicking = false;
        this.magicDuration = 6 * 0.1; //for animation
        this.canMagic = true;
        this.magicCooldown = 45; //long cool down
        this.magicCooldownTimer = 0;
        this.magicKnockback = 2000;
        this.magicDamage = 100;
        this.magicScale = 6;



        //BOMB PROPERTIES
        this.bombDamage = 10;
        this.bombExpolsionScale = 10;
        this.bombTimer = 4;
        this.bombKnockback = 2000;
        this.canBomb = true;
        this.bombCooldown = 0.5; //how often we could our bomb down.
        this.bombCooldownTimer = 0;
        this.bombMaxAmount = 5;
        this.bombCurrentAmnt = 5;
        this.bombCooldownRetrieve = 5; //will be the cooldown for when will get another bomb back in their inventory.
        this.bombCooldownRetrieveTimer = 0; //the timer that will time that retrieve cooldown above.

        this.coins = 0;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 


        this.elapsedTime = 0;
        this.updateBB(); //put the boundary on player right away

        //adventure animations (storing)
        this.animations = []; //will be used to store animations
        this.loadAnimation();
    };

    updateBB() {
        this.lastBB = this.BB; //we gotta know where we were before changing the scene
        if (this.state != 4 || this.state != 5 || this.state != 6) {
            this.BB = new BoundingBox(this.x + 33, this.y + 24, 32 , 32 + 27);
        } 
       // this.BB = new BoundingBox(this.x, this.y, 32, 32);
    }

    //helper functions
    loadAnimation() {
        for (var i = 0; i < 12; i++) {
            this.animations.push([]);
            for (var j = 0; j < 4; j++) {
                this.animations[i].push([]);
            }
        }

        //idle right
         this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 0, 32, 32, 12.9, 0.2, false, true);


        //idle left 
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 256, 32, 32, 12.9, 0.2, false, true); 
        //idle up
        this.animations[0][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingUp.png"), 96, 0, 32, 32, 0.9, 0.12, false, false);

        //idle down
        this.animations[0][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingDown.png"), 93, 0, 32, 32, 0.9, 0.12, false, false);

        //walking right 
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 32, 32, 32, 7.9, 0.12, false, false);

        //walking left 
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 288, 32, 32, 7.9, 0.12, false, true); 

        //walking up 
        this.animations[1][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingUp.png"), 0, -1.5, 32, 32, 7.9, 0.12, false, false);

        //walking down
        this.animations[1][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingDown.png"), -3, -2, 32, 32, 7.9, 0.12, false, false);

        //jump right/up
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 160, 32, 32, 5.9, 0.08, false, false);

        //jump left/maybe down
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 416, 32, 32, 5.9, 0.08, false, false);

        //attack1 right/down
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 64, 32, 32, 10, 0.056, false, false);

        //attack1 left
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 320, 32, 32, 10, 0.056, false, false);

        //attack up
        this.animations[4][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AttackUp.png"), -3, 2, 32, 32, 10, 0.056, false, false);

        //attack2 right
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 2, 96, 32, 32, 10, 0.056, false, false);

        //attack2 left
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 352, 32, 32, 10, 0.056, false, false);

        //attack3 right/down
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 3.1, 128, 32, 32, 10, 0.056, false, false);

        //attack 3 left/down
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 384, 32, 32, 10, 0.056, false, false);

        //roll right/up
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), -2, 384, 32, 32, 5, 0.075, false, false);

        //roll left/down
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 256, 384, 32, 32, 5, 0.075, true, false); //maybe take a look at this

        //climbing up ladder
        this.animations[8][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, false, false);
        
        //climbing down ladder
        this.animations[8][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, true, false);

        //bow right
        this.animations[9][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 160, 288, 32, 32, 3, 0.1, false, false);

        //bow left
        this.animations[9][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/BowLeft.png"), 0, -8, 32, 32, 3, 0.1, true, false);


        //damaged to the right/up
        this.animations[10][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, false);

        //damaged to the left/down
        this.animations[10][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 449, 32, 32, 3, 0.12, false, false);

        //damaged to when hit looking up (honestly didnt need up and down)
        this.animations[10][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, false);

        //damaged when hit looking down
        this.animations[10][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, false);

        //magic animation, right
        this.animations[11][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 320, 32, 32, 6, 0.1, true, false);

        this.animations[11][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 320, 32, 32, 6, 0.1, false, false);



        //death animation
        this.deadAnim = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 448, 32, 32, 8, 0.12, false, false); 

    };

    updateFacing(velocityDirection) {
        //this is to make sure our attack animation doesnt get countered or canceled by the movement animation right away when we start attacking.
        if (!this.attacking && !this.shooting && !this.magicking) {
            if (velocityDirection.x > 0) this.facing = 0, this.state = 1; //If we're moving in the positive x direction, we're going to the right. Change animation to walk right
            if (velocityDirection.x < 0) this.facing = 1, this.state = 1; 
            if (velocityDirection.y < 0) this.facing = 2, this.state = 1;
            if (velocityDirection.y > 0) this.facing = 3, this.state = 1;
        
            if (velocityDirection.x == 0 && velocityDirection.y == 0) { //used to remember our last move before returning back to idle animation
                switch (this.lastMove) {
                    case 0: this.facing = 0; break; 
                    case 1: this.facing = 1; break;
                    case 2: this.facing = 2; break;
                    case 3: this.facing = 3; break;
                }
                this.state = 0;
            }
            
            if (velocityDirection.x > 0 && velocityDirection.y > 0) this.facing = 0, this.state = 1; //going to bottom right corner, keep right animation
            if (velocityDirection.x < 0 && velocityDirection.y < 0) this.facing = 1, this.state = 1; //going to top left corner, keep left animation
            if (velocityDirection.x > 0 && velocityDirection.y < 0) this.facing = 0, this.state = 1; //going to top right corner, keep right animation
            if (velocityDirection.x < 0 && velocityDirection.y > 0) this.facing = 1, this.state = 1; //going to bottom left corner, keep left animation
        }
    }


    update() {
        // if (this.dead) return;
        // console.log(this.game.leftClick);
        if (this.dead) {
            // Handle death animation
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return;
            } else {
                // Remove zombie from world after the animation finishes
                this.removeFromWorld = true;
                return;
            }
        }

        //Handle damage animation time so it isnt infinite. This is when player gets damaged
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.invincible = false; //at the end of the player getting damaged animation we'll turn i-frames off
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle state
            }
        }

        //this is used as the cooldown for rolling
        if (!this.canRoll) {
            this.rollCooldownTimer -= this.game.clockTick;
            if (this.rollCooldownTimer <= 0) {
                this.canRoll = true;
            }
        }
        
        //Handle roll input (using Shift key)
        //We can roll when we're not already rolling, when we can roll (no cooldown atm) and we're not in an attacking animation
        if (this.game.keys["shift"] && !this.rolling && this.canRoll && !this.attacking) {
            this.invincible = true; //when we start rolling, we'll turn invincible into true (player won't get hurt)
            this.performRolling(); 
        }

        //Handle rolling state
        if (this.rolling) { //when we're rolling, we want to calculate how long we roll.
            this.rollTimer -= this.game.clockTick;          
            // End roll when timer expires
            if (this.rollTimer <= 0) {
                this.rolling = false;
                this.invincible = false; //once we're done with our roll, i-frames will be turned off
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.state = 0; // Return to idle state
            }
            this.game.leftClick = false;
        }



        //If we're not rolling, we can move properly
        if (!this.rolling) {
            if (this.game.keys["w"] && !this.game.keys["s"]) {
                this.velocity.y = -this.speed;
                this.lastMove = 2;
            } else if (this.game.keys["s"] && !this.game.keys["w"]) {
                this.velocity.y = this.speed;
                this.lastMove = 3;
            } else {
                this.velocity.y = 0;
            }
            
            if (this.game.keys["a"] && !this.game.keys["d"]) {
                this.velocity.x = -this.speed;
                this.lastMove = 1;
            } else if (this.game.keys["d"] && !this.game.keys["a"]) {
                this.velocity.x = this.speed;
                this.lastMove = 0;
            } else {
                this.velocity.x = 0;
            }
            this.updateFacing(this.velocity);
        }

        //COOLDOWN TRACKING SECTION --------------------------------
        //this is used as the cool down for each attack
        if (!this.canAttack) {
            this.attackCooldownTimer -= this.game.clockTick;
            if (this.attackCooldownTimer <= 0) {
                this.canAttack = true;
            }
        }

        //Track bow cooldown
        if (!this.canShoot) {
            this.shootCooldownTimer -= this.game.clockTick;
            if (this.shootCooldownTimer <= 0) { //once cooldown ends
                this.canShoot = true; //we can now shoot again
            }
        }

        //Track magic AOE cooldown
        if (!this.canMagic) {
            this.magicCooldownTimer -= this.game.clockTick;
            if (this.magicCooldownTimer <= 0) { //once cooldown ends
                this.canMagic = true; //we can now do magic again!
            }
            this.game.rightClicks = false;
        }

       //Track bomb cooldown
        if (!this.canBomb) {
            this.bombCooldownTimer -= this.game.clockTick;
            if (this.bombCooldownTimer <= 0) { //once cooldown ends
                this.canBomb = true; //we can now put bomb down again
            }
        }

        //Track bomb amount cooldown
        if (this.bombCurrentAmnt < this.bombMaxAmount) {
            this.bombCooldownRetrieveTimer -= this.game.clockTick; 
            if (this.bombCooldownRetrieveTimer <= 0) {
                console.log("should be added once");
                this.bombCooldownRetrieveTimer = this.bombCooldownRetrieve;

                this.bombCurrentAmnt++;
            }
        }
        //-------------------------------------------------------------

        if (this.game.keys["1"]) {
            this.currentWeapon = 0;
        } else if (this.game.keys["2"]) {
            this.currentWeapon = 1;
        }


        // if (this.game.leftClick && !this.attacking && this.canAttack && !this.rolling && this.currentWeapon == 0) {
        //     console.log("we clicked left click!");
        //     this.attack();
        //     this.game.leftClick = false; //set back to false because it was going to be true the whole time
        // } else if (this.currentWeapon == 0) {
        //     // Clear left clicks if we can't sword attack
        //     this.game.leftClick = false;
        // }

        // if (this.game.leftClick && !this.shooting && this.canShoot && !this.rolling && !this.attacking && this.currentWeapon == 1) {
        //     console.log("we clicked left click!");
        //     this.bowShoot();
        //     this.game.leftClick = false;
        // } else if (this.currentWeapon == 1) {
        //     // Clear left clicks if we can't bow attack
        //     this.game.leftClick = false;
        // }

        // Handle sword attacks - only affected by sword cooldown
        if (this.currentWeapon == 0 && this.game.leftClick) {
            if (!this.attacking && this.canAttack && !this.rolling) {
                console.log("we clicked left click!");
                this.attack();
            }
            this.game.leftClick = false;
        }
        
        // Handle bow attacks - only affected by bow cooldown
        if (this.currentWeapon == 1 && this.game.leftClick) {
            if (!this.shooting && this.canShoot && !this.rolling) { //&& !this.attacking) { 
                this.bowShoot();
            }
            this.game.leftClick = false;
        }

        if (this.game.rightClicks && this.canMagic && !this.rolling) { //&& !this.shooting && !this.attacking if we dont want player to use magic during attack animation
            console.log("we clicked right click!")
            this.invincible = true;
            this.magicAOE();
            this.game.rightClicks = false;
        } else {
            this.game.rightClicks = false;
        }


        if (this.game.keys["e"] && this.canBomb && !this.rolling && this.bombCurrentAmnt > 0) {
            this.bombCurrentAmnt--;
            const characterCenterX = this.x + (this.bitSize * this.scale) / 2; 
            const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
            this.bombCooldownTimer = this.bombCooldown;
            if (this.bombCooldownRetrieveTimer <= 0) {
                this.bombCooldownRetrieveTimer = this.bombCooldownRetrieve;
            }
            this.canBomb = false;
            this.game.addEntity(new Bomb(this.game, characterCenterX - 50, characterCenterY -32, this.bombTimer, this.bombDamage, this.bombExpolsionScale));
        }

        //ANIMATION TIMING -------------------------------------------------------------------
        if (this.attacking) { //when we're in our attacking animation, we wanna time it.
            this.attackTimer -= this.game.clockTick;
            //End attack when timer expires
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.state = 0;  // Return to idle state
                
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }

        if (this.shooting) { //when we're in our bow shooting animation, we wanna time it.
            this.shootingTimer -= this.game.clockTick;
            //End shooting when timer expires
            if (this.shootingTimer <= 0) {
                this.shooting = false;
                this.state = 0;  // Return to idle state
                
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }

        if (this.magicking) { //when we're in our bow shooting animation, we wanna time it.
            this.magicTimer -= this.game.clockTick;
            //End shooting when timer expires
            if (this.magicTimer <= 0) {
                this.magicking = false;
                this.state = 0;  // Return to idle state
                this.invincible = false;
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }
        //-----------------------------------------------------------------------------------------------

        //for ladders maybe do, if the bounding boxes are touching or near each other and the user clicks on e?

        
        //maybe there are pits players can fall into? We could have small collision boxes for those void tiles. If touched the player could die? 


        
        // Always update position based on velocity
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        this.updateBB();


        //checking for collision
        //Collision detection with objects
        this.game.entities.forEach(entity => {
            if ((entity instanceof Barrel || entity instanceof Crate || entity instanceof Pot) 
                && this.BB.collide(entity.BB)) {
                // Resolve collision by adjusting adventurer's position
                const overlap = this.BB.overlap(entity.BB);
                if (overlap.x > 0 && overlap.y > 0) {
                    if (overlap.x < overlap.y) {
                        //Horizontal collision
                        if (this.BB.left < entity.BB.left) {
                            this.x -= overlap.x; //Push back to the left
                        } else {
                            this.x += overlap.x; //Push forward to the right
                        }
                    } else {
                        //Vertical collision
                        if (this.BB.top < entity.BB.top) {
                            this.y -= overlap.y; //Push back upward
                        } else {
                            this.y += overlap.y; //Push forward downward
                        }
                    }
                    this.updateBB(); //Update bounding box after position adjustment
                }
            }
            
            if ((entity instanceof Onecoin) && this.BB.collide(entity.BB)) {
                //Math.floor(Math.random() * (max - min + 1)) + min;
                const coinAmnt = Math.floor(Math.random() * 2) + 1; //1 - 2 when picking up a coin that looks like just 1
                this.coins += coinAmnt;
                entity.removeFromWorld = true;
            } else if ((entity instanceof Threecoin) && this.BB.collide(entity.BB)) {
                const coinAmnt = Math.floor(Math.random() * (5 - 3 + 1)) + 3; //3 - 5 when picking up a coin that looks like 3 coins
                this.coins += coinAmnt;
                entity.removeFromWorld = true;
            }
        });

        if (this.attackCooldown < this.attackDuration) {
            this.attackDuration = this.attackCooldown;
        }

        if (this.shootCooldown < this.shootingDuration) {
            this.shootingDuration = this.shootCooldown;
        }

        this.elapsedTime += this.game.clockTick;
    };

    performRolling() {
        this.rolling = true;
        this.canRoll = false;
        this.rollCooldownTimer = this.rollCooldown;
        this.state = 7; // Set state to rolling
        this.rollTimer = this.rollDuration;

        //Reset roll animations when starting a new roll
        this.animations[7][0].elapsedTime = 0;  //Reset right roll frame
        this.animations[7][1].elapsedTime = 0;  //Reset left roll frame

        
        // Calculate diagonal roll speed (normalize for consistent speed)
        const diagonalSpeed = this.rollSpeed / Math.sqrt(2);
        
        //Checking for diagonal movement
        const rollingRight = this.game.keys["d"] && !this.game.keys["a"];
        const rollingLeft = this.game.keys["a"] && !this.game.keys["d"];
        const rollingUp = this.game.keys["w"] && !this.game.keys["s"];
        const rollingDown = this.game.keys["s"] && !this.game.keys["w"];

        // Set roll velocity based on key combinations
        if (rollingRight && rollingUp) { //if player presses d and w and rolls
            // Rolling top-right
            this.velocity.x += diagonalSpeed;
            this.velocity.y -= diagonalSpeed;
            this.facing = 0; //Use right-facing animation
        } else if (rollingLeft && rollingUp) { //if player presses w and a and rolls
            // Rolling top-left
            this.velocity.x -= diagonalSpeed;
            this.velocity.y += -diagonalSpeed;
            this.facing = 1; //Use left-facing animation
        } else if (rollingRight && rollingDown) { //if player presses s and d and rolls
            //Rolling bottom-right
            this.velocity.x += diagonalSpeed;
            this.velocity.y += diagonalSpeed;
            this.facing = 0; //Use right-facing animation
        } else if (rollingLeft && rollingDown) { //if player presses a and s and rolls
            //Rolling bottom-left
            this.velocity.x -= diagonalSpeed;
            this.velocity.y += diagonalSpeed;
            this.facing = 1; // Use left-facing animation
        } else {
            //Handle single direction rolls
           // switch (this.facing) {
                if (rollingRight) { //right
                    this.velocity.x += this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 0;
                } else if (rollingLeft) { //left
                    this.velocity.x -= this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 1;
                } else if (rollingUp) { //up
                    this.velocity.y -= this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 0;
                } else { //down. Also default value when player isnt moving and presses roll button
                    this.velocity.y += this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 1;
                }
        }
            
    }
    


    attack() {
        this.attacking = true; 
        this.canAttack = false;
        this.attackCooldownTimer = this.attackCooldown;
        this.attackTimer = this.attackDuration;
        
        //Get mouse position relative to character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2; 
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        
        //Get mouse position in world coordinates
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;
        
        //Calculate angle between character and mouse
        const dx = mouseX - characterCenterX;
        const dy = mouseY - characterCenterY;
        const angle = Math.atan2(dy, dx); //radians
        
        //Convert angle to degrees for easier checks
        const degrees = angle * (180 / Math.PI);
        var slashDirection = null;
        
        // Determine attack type and direction based on angle
        if (degrees >= -110 && degrees < -70) {
            //Pure up attack zone
            this.state = 4; //attack 1 (stored as attack 1 in animations)
            this.facing = 2; //have the player look up when we're attacking up
            slashDirection = 1;
        } else if (degrees >= -160 && degrees < -110) {
            //Upper left quadrant (1st quadrant) - Attack 2
            this.state = 5; //attack 2
            this.facing = 1; //have the player look left when it's upper left
            slashDirection = 3;
        } else if (degrees >= -70 && degrees < -20) {
            //Upper right quadrant - Attack 2
            this.state = 5; //attack 2
            this.facing = 0; //have the player look right when its in upper right
            slashDirection = 1;
        } else if (degrees >= 45 && degrees < 135) {
            //Lower quadrant - Attack 3
            this.state = 6; //attack 3
            this.facing = dx > 0 ? 0 : 1; //lower quadrant to the right or left
            slashDirection = dx > 0 ? 3 : 1; //if degrees is greater than 0, we're facing rigth. So do correct slash move.
        } else {
            //Horizontal quadrants - Attack 1
            this.state = 4;
            this.facing = dx > 0 ? 0 : 1; //to the sides of the character. Swing right or left with attack 1
            slashDirection = dx > 0 ? 3 : 1;
        }

        // Calculate slash position
        const slashX = this.x + Math.cos(angle) * this.slashDistance; //where the slash should be
        const slashY = this.y + Math.sin(angle) * this.slashDistance;

        if (this.swordUpgrade == 0) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/red-slash.png", 
                "./Sprites/Slash/red-slash-flipped.png", this.slashScale, angle, slashDirection, 
                this.attackDamage, this.knockback, this, true));
        } else if (this.swordUpgrade == 1) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/blue-slash.png", 
                "./Sprites/Slash/blue-slash-flipped.png", this.slashScale, angle, 
                slashDirection, this.attackDamage, this.knockback, this, true));
        }

        //Reset all possible attack animations
        this.animations[4][0].elapsedTime = 0; //Attack 1 right
        this.animations[4][1].elapsedTime = 0; //Attack 1 left
        this.animations[4][2].elapsedTime = 0; //Attack up
        this.animations[5][0].elapsedTime = 0; //Attack 2 right
        this.animations[5][1].elapsedTime = 0; //Attack 2 left
        this.animations[6][0].elapsedTime = 0; //Attack 3 right
        this.animations[6][1].elapsedTime = 0; //Attack 3 left
    }

    bowShoot() {
        // Prevent shooting too frequently
        this.shooting = true; 
        this.canShoot = false;
        this.shootCooldownTimer = this.shootCooldown;
        this.shootingTimer = this.shootingDuration;


        // Get mouse position in world coordinates
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;
        
        // Calculate character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        
        // Calculate angle to mouse
        const dx = mouseX - characterCenterX;
        const dy = mouseY - characterCenterY;
        const angle = Math.atan2(dy, dx);

         //Convert angle to degrees for easier checks
         const degrees = angle * (180 / Math.PI);

        if (degrees >= -90 && degrees < 90) { //right side of charcter
            this.facing = 0; 
        } else {
            this.facing = 1; //left side of character
        }
        

        // Add arrow to game entities
        this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.bowDamage, this.arrowSpeed, 
            "./Sprites/Projectiles/Arrows_pack.png", this.bowKnockback, true, 2, this.piercing,
            2, 0, -6, 32, 32, 1, 0.2, false, false, - 15, -15, this.bitSize * 2 - 35, this.bitSize * 2 - 35, this.bitSize, this.bitSize));
             //bounding box will always start at this.x for the projectile. The -15 is just something that we could maybe offset it by. If no offset,  then we could just put 0


        // Set bow state and cooldown
        this.state = 9; // Bow state

        this.animations[9][0].elapsedTime = 0; //Bow right
        this.animations[9][1].elapsedTime = 0; //Bow left
    }

    magicAOE() { //kinda like an ult?
        this.magicking = true; 
        this.canMagic = false;
        this.magicCooldownTimer = this.magicCooldown;
        this.magicTimer = this.magicDuration;

        // Get mouse position in world coordinates
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;

        // Calculate character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;

        // Calculate angle to mouse (this will just be used for animation in knowing if we should be looking right or left)
        const dx = mouseX - characterCenterX;
        const dy = mouseY - characterCenterY;
        const angle = Math.atan2(dy, dx);
        
        //Convert angle to degrees for easier checks
        const degrees = angle * (180 / Math.PI);
        
        if (degrees >= -90 && degrees < 90) { //right side of charcter
            this.facing = 0; 
        } else {
            this.facing = 1; //left side of character
        }

        this.game.addEntity(new CircleAOE(this.game, characterCenterX, characterCenterY , "./Sprites/Magic/magic.png", 
            null, this.magicScale, this.magicDamage, this.magicKnockback, this, true, 
            0, 320, 64, 64, 9, 0.08, false, true))

            // this.game.addEntity(new CircleAOE(this.game, mouseX, mouseY , "./Sprites/Magic/magic.png", 
            //     null, this.magicScale, this.magicDamage, this.magicKnockback, null, true, 
            //     0, 320, 64, 64, 9, 0.08, false, false))
        
        //change animation state to 11
        this.state = 11;

        this.animations[11][0].elapsedTime = 0; //Magic right animation reset
        this.animations[11][1].elapsedTime = 0; //Magic left animation reset
                
    }






    takeDamage(amount) {
        if (!this.invincible) {
            console.log(this.health);
            this.health -= amount;
            if (this.health <= 0) {
                this.dead = true;
                console.log("Player is dead!");
               // ASSET_MANAGER.pauseBackgroundMusic();
            } else {
                this.state = 10;
                this.invincible = true;
                this.isPlayingDamageAnimation = true;
                this.damageAnimationTimer = this.damageAnimationDuration;
                if (this.facing === 0 || this.facing === 2) {
                    this.animations[10][0].elapsedTime = 0;
                } else {
                    this.animations[10][1].elapsedTime = 0;
                }
            }
        }
  
    }
    drawMinimap(ctx, mmX, mmY) {
        ctx.fillStyle = "White";
        ctx.fillRect(mmX + this.x / this.bitSize, mmY + this.y / this.bitSize, 3, 3);
    };

    draw(ctx) {        
        if (this.dead) {
            if (this.deathAnimationTimer > 0) {
                this.deadAnim.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
            }
        } else if (this.isPlayingDamageAnimation) {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 33) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 32, 16); //draw a shadow underneath our character
            this.animations[10][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        } else {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 33) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 32, 16); //draw a shadow underneath our character
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); //we're putting her at pixel 25 x 25 on canvas
            //2.8
        }
        
            //will show the bound box of our player

            // ctx.strokeStyle = 'Green';
            // ctx.strokeRect((this.x + (this.bitSize * this.scale)/2) - this.game.camera.x, (this.y + (this.bitSize * this.scale)/2) - this.game.camera.y, 20, 20);

             ctx.strokeStyle = 'Red';
             ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
     
    };
}