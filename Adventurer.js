class Adventurer { //every entity should have update and draw!
    constructor(game, x, y) { //game will be the game engine!
        Object.assign(this, {game, x, y});
        this.game.adventurer = this;
        this.scale = 2.8;
        

        const offSet = (32 * this.scale)/2; //because of the size (2.8) of our sprite animation, we wanna go up to the scale.
        this.x = this.x - offSet; 
        this.y = this.y - offSet;
        

        this.speed = 220;


        this.state = 0; //0 = idle, 1 = walking, 2 = run, 3 = jumping, 4 = attack1, 5 = attack2, 6 = attack3, 7 = roll, 8 = ladder, 9 = bow
        this.facing = 0; //0 = right, 1 = left, 2 = up, 3 = down
        this.dead = false;
        this.climbingLadder = false;
        //this.attack
        this.invincible = false;
        this.velocity = {x: 0, y: 0};
        this.lastMove = 0;
        this.maxHealth = 100; //max hp of player
        

        this.currentWeapon = 0; //sword = 0, bow = 1
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
        this.attackCooldown = 0.1;   // Time between attacks
        this.attackCooldownTimer = 0;
        this.slashType = 0; //0 = default right slash animation, 1 = up animation
        this.slashDistance = 27; //Distance from character center to slash
        this.slashScale = 5; 
        this.swordUpgrade = 0; //maybe use for upgrading sword later? If we upgrade a sword, we could change colors?

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
        for (var i = 0; i < 10; i++) {
            this.animations.push([]);
            for (var j = 0; j < 4; j++) {
                this.animations[i].push([]);
            }
        }

        //idle right
         this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 0, 32, 32, 12.90, 0.2, false, true);


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
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 2, 96, 32, 32, 10, 0.08, false, false);

        //attack2 left
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 352, 32, 32, 10, 0.08, false, false);

        //attack3 right/down
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 3.1, 128, 32, 32, 10, 0.08, false, false);

        //attack 3 left/down
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 384, 32, 32, 10, 0.08, false, false);

        //roll right/up
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 384, 32, 32, 5, 0.075, false, false);

        //roll left/down
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/RollLeft.png"), 0, -6, 30.6, 32, 5, 0.075, true, false); //maybe take a look at this

        //climbing up ladder
        this.animations[8][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, false, false);
        
        //climbing down ladder
        this.animations[8][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, true, false);

        //bow right
        this.animations[9][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 288, 32, 32, 7.9, 0.08, false, false);

        //bow left
        this.animations[9][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/BowLeft.png"), 3, -8, 32, 32, 7.9, 0.12, true, false);

        //death animation
        this.deadAnim = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 448, 32, 32, 8, 0.12, false, false); 

    };

    updateFacing(velocityDirection) {
        //this is to make sure our attack animation doesnt get countered or canceled by the movement animation right away when we start attacking.
        if (!this.attacking) {
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
        if (this.dead) return;

        // if (this.velocity.x == 0 && this.state == 0 && this.clockTick == 10) { //idle animation after a couple seconds?
            
        // }

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
            var speed = 500;

            if (this.game.keys["w"] && !this.game.keys["s"]) {
                this.velocity.y = -speed;
                this.lastMove = 2;
            } else if (this.game.keys["s"] && !this.game.keys["w"]) {
                this.velocity.y = speed;
                this.lastMove = 3;
            } else {
                this.velocity.y = 0;
            }
            
            if (this.game.keys["a"] && !this.game.keys["d"]) {
                this.velocity.x = -speed;
                this.lastMove = 1;
            } else if (this.game.keys["d"] && !this.game.keys["a"]) {
                this.velocity.x = speed;
                this.lastMove = 0;
            } else {
                this.velocity.x = 0;
            }
            this.updateFacing(this.velocity);
        }

        //this is used as the cool down for each attack
        if (!this.canAttack) {
            this.attackCooldownTimer -= this.game.clockTick;
            if (this.attackCooldownTimer <= 0) {
                this.canAttack = true;
            }
        }


        if (this.game.leftClick && !this.attacking && this.canAttack && !this.rolling) {
            console.log("we clicked left click!");
            this.attack();
            this.game.leftClick = false; //set back to false because it was going to be true the whole time
        }

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

        //for ladders maybe do, if the bounding boxes are touching or near each other and the user clicks on e?

        
        //maybe there are pits players can fall into? We could have small collision boxes for those void tiles. If touched the player could die? 


        
        // Always update position based on velocity
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        this.updateBB();


        //checking for collision

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
            switch (this.facing) {
                case 0: //right
                    this.velocity.x += this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 0;
                    break;
                case 1: //left
                    this.velocity.x -= this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 1;
                    break;
                case 2: //up
                    this.velocity.y -= this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 0;
                    break;
                case 3: //down
                    this.velocity.y += this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 1;
                    break;
            }
        }
    }


    attack() {
        this.attacking = true; 
        this.canAttack = false;
        this.attackCooldownTimer = this.attackCooldown;
        this.attackTimer = this.attackDuration;
        
        //Get mouse position relative to character center
        const characterCenterX = this.x + (32 * 2.8) / 2; 
        const characterCenterY = this.y + (32 * 2.8) / 2;
        
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
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/red-slash.png", this.slashScale, 10, angle, slashDirection, 5));

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






    mouseRotationHandler() {
        if (this.game.mouse == null) return(0); //Catches exception start of Engine
        var dx = (this.game.getMouseWorldPosX()) - (this.posX); //282/2 Accounting for difference in center of thing.
        var dy = (this.game.getMouseWorldPosY()) - (this.posY);
        //this.printMouseCoordinates()

        return (Math.atan2(dy, dx));
    }

    draw(ctx) {

        
        //ctx.drawImage(ASSET_MANAGER.getAsset("./HollowKnight.png"), 0, 0);
        
        //we get the tick from the game engine! Hence why we passed gameEngine in the constructor parameters
       // this.animator.drawFrame(this.game.clockTick, ctx, this.x , this.y, 2.8); //we're putting her at pixel 25 x 25 on canvas
    //    const characterCenterX = this.x + (32 * 2.8) / 2 - 25;
    //    const characterCenterY = this.y + (32 * 2.8) / 2 - 25;
    //    const radius = 50;
    //    const upAttackRadius = 30;
       
    //    // Draw main attack zones circle
    //    ctx.beginPath();
    //    ctx.arc(characterCenterX, characterCenterY, radius, 0, 2 * Math.PI);
    //    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    //    ctx.stroke();
       
    //    // Draw up attack zone
    //    ctx.beginPath();
    //    ctx.arc(characterCenterX, characterCenterY, upAttackRadius, -Math.PI, 0);
    //    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    //    ctx.stroke();
       
    //    // Draw attack zone dividers
    //    ctx.beginPath();
    //    // Upper zone (-135° to -45°)
    //    ctx.moveTo(characterCenterX - radius * Math.cos(45 * Math.PI / 180), 
    //              characterCenterY - radius * Math.sin(45 * Math.PI / 180));
    //    ctx.lineTo(characterCenterX + radius * Math.cos(45 * Math.PI / 180), 
    //              characterCenterY - radius * Math.sin(45 * Math.PI / 180));
       
    //    // Lower zone (45° to 135°)
    //    ctx.moveTo(characterCenterX - radius * Math.cos(45 * Math.PI / 180), 
    //              characterCenterY + radius * Math.sin(45 * Math.PI / 180));
    //    ctx.lineTo(characterCenterX + radius * Math.cos(45 * Math.PI / 180), 
    //              characterCenterY + radius * Math.sin(45 * Math.PI / 180));
       
    //    // Text for attack types
    //    ctx.font = "12px Arial";
    //    ctx.fillStyle = "white";
    //    ctx.fillText("Up Attack", characterCenterX - 20, characterCenterY - upAttackRadius - 5);
    //    ctx.fillText("Attack 2", characterCenterX - 60, characterCenterY - radius + 15);
    //    ctx.fillText("Attack 2", characterCenterX + 30, characterCenterY - radius + 15);
    //    ctx.fillText("Attack 1", characterCenterX + radius + 5, characterCenterY);
    //    ctx.fillText("Attack 1", characterCenterX - radius - 45, characterCenterY);
    //    ctx.fillText("Attack 3", characterCenterX, characterCenterY + radius + 15);
       
    //    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    //    ctx.stroke();
       

       
        if (this.dead) {
            this.deadAnim.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {

            //might need to change the - 25. Try to figure out another way to center the character without hardcoding 
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 33) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 32, 16); //draw a shadow underneath our character
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); //we're putting her at pixel 25 x 25 on canvas
            //2.8
        }
        
            //will show the bound box of our player
             ctx.strokeStyle = 'Red';
             ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
     
    };
}