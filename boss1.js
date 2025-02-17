class Boss1 { //goblin king
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.health = 500;
        this.name = "tbd";
        this.state = 0; //0 = walk, 1 = attack, 2 = throwing, 3 = order, 4 = healing, 5 = jumping up, 6 = jumping down, 7 = dakmaged
        //attack will be throwing honestly
        this.facing = 0;
        this.bitSizeX = 64;
        this.bitSizeY = 64;
        this.scale = 5;
        this.aoeTargetX = (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeTargetY = (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);

        this.speed = 100;

        //Properties:
        this.bossHeals = 1; //should only heal 1 time
        

        
        //animations    
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks, so it doesnt hit player every tick
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 3 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.deathAnimationTimer = 7 * 0.2; //8 frames * 0.2 duration. Should be frameCount * frameDuration for death animation


        this.isJumping = false,
        this.preparingJump = false,
        this.jumpHeight = -2000, // How far above screen the boss jumps
        this.jumpDuration = 1, // Time in seconds for the jump



        // Existing warning circle properties
        this.aoeScale = 150; // Size of warning circle
        this.isPreparingAOE = false;
        this.isAboutToAOE = false;
        

        this.jumpAnimationTimer = 0;
        this.jumpAnimationDuration = 0.4; // Duration should match your animation (5 frames * 0.1s)
        this.landingAnimationTimer = 0;
        this.landingAnimationDuration = 6 * 0.1;
        this.midAirTimer = 0;
        this.midAirDuration = 2.0; // How long to stay in mid-air
        this.fallingThreshold = 230; // Distance to ground when we switch to landing animation


        this.animations = [];
        

        this.loadAnimation();
    }


    updateBB() {

    }


    loadAnimation() {
        //RIGHT
        for (var i = 0; i < 10; i++) { //9 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //2 faces
                this.animations[i].push([]);
            }
        }

        //walking
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 64, 64, 64, 5.9, 0.1, false, false);

        //attack
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 128, 256, 64, 64, 5, 0.1, false, false);

        //throwing
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 256, 64, 64, 7.9, 0.1, false, false);

        //order
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 512, 64, 64, 5.9, 0.2, false, false);

        //healing
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 320, 64, 64, 14.9, 0.1, false, false);

        //jumping up
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 576, 64, 64, 5, 0.1, false, false);
        
        //jumping up. Peak animation (one frame)
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 320, 576, 64, 64, 0.9, 0.1, false, false);

        //jumping down
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 640, 64, 64, 6, 0.1, false, false);

        //falling down (1 frame)
        this.animations[8][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 640, 64, 64, 0.9, 0.1, false, false);

        //damaged
        this.animations[9][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 384, 64, 64, 3, 0.1, false, false);

        //LEFT  
        //walking
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 647, 64, 64, 64, 5.9, 0.1, true, false);

        //attack
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 583, 256, 64, 64, 5, 0.1, true, false);

        //throwing
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 519, 256, 64, 64, 7.9, 0.1, true, false);

        //order
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 647, 512, 64, 64, 5.9, 0.2, true, false);

        //healing
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 71, 320, 64, 64, 14.9, 0.1, true, false);

        //jumping up
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 647, 576, 64, 64, 4.9, 0.1, true, false);
        
        //jumping up. Peak animation (one frame)
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 647, 576, 64, 64, 0.9, 0.1, true, false);

        //falling down
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 583, 640, 64, 64, 5.9, 0.1, true, false);

        //falling down. first animation
        this.animations[8][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 967, 640, 64, 64, 0.9, 0.1, true, false);

        //damaged
        this.animations[9][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 768, 384, 64, 64, 3, 0.1, true, false);
    }



    update() {  
        if (this.dead) {
            this.deathAnimationTimer -= this.game.clockTick;
            if (this.deathAnimationTimer <= 0) {
                this.removeFromWorld = true;
            }
            return;
        }

        // Handle damage animation
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false;
                this.state = 0;
            }
            return;
        }

        // Handle jumping state
        if (this.state === 5) { // Jumping up animation
            this.jumpAnimationTimer += this.game.clockTick;
            
            if (this.jumpAnimationTimer >= this.jumpAnimationDuration) {
                this.state = 6; // Switch to mid-air state
                this.jumpAnimationTimer = 0;
                this.midAirTimer = 0; // Reset mid-air timer
                //this.y = -200; // Move above screen
                return;
            }
            return;
        }

        if (this.state === 6) { // In mid-air, tracking player
            this.midAirTimer += this.game.clockTick;
            this.y += this.jumpHeight * this.game.clockTick;
            //this.x = this.aoeTargetX - (this.bitSizeX * this.scale)/2;


            // Update target position to player's location
            this.aoeTargetX = this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
            this.aoeTargetY = this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
            
            // Show warning indicator
            this.isPreparingAOE = true;
            
            // After mid-air duration, start falling
            if (this.midAirTimer >= this.midAirDuration) {
                this.state = 8; // Switch to falling animation
                this.isPreparingAOE = false;
                //this.isAboutToAOE = false;
                this.isAboutToAOE = true; // Turn on the red warning circle

                // Position boss above the target location
                this.x = this.aoeTargetX - (this.bitSizeX * this.scale)/2;
                return;
            }
            return;
        }

        if (this.state === 8) { // Falling down
            // Move towards the ground
            const fallSpeed = 3000; // Adjust this value to control falling speed. Will be faster than jumping up speed
            this.y += fallSpeed * this.game.clockTick;
            
            // Calculate distance to target
            const distanceToGround = Math.abs(this.y - this.aoeTargetY); //should be next to our character 
            
            // When getting close to the ground
            if (distanceToGround < this.fallingThreshold) {
                this.state = 7; // Switch to landing animation
            }
            return;
        }

        if (this.state === 7) { // Landing animation
            // You might want to add impact effects or damage here
            // After landing animation completes, return to normal state
            this.landingAnimationTimer += this.game.clockTick;

            if (this.landingAnimationTimer >= this.landingAnimationDuration) {
                this.state = 0;
                this.isPreparingAOE = false;
                this.isAboutToAOE = false;
                this.landingAnimationTimer = 0;
            }
            return;
        }
    
        // Rest of the update logic...
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > 2) {
            this.facing = dx < 0 ? 1 : 0;
        }
    
        if (distance > 50) {
            const movement = this.speed * this.game.clockTick;
            this.x += (dx / distance) * movement;
            this.y += (dy / distance) * movement;
        } else {
            this.initiateJumpAttack();
        }
    }

    initiateJumpAttack() {
        if (this.state === 0) { // Only initiate if in normal state
            this.state = 5; // Start jump animation
            this.isPreparingAOE = false;
            this.isAboutToAOE = false;
            this.jumpAnimationTimer = 0;
            this.midAirTimer = 0;
            // Reset any relevant animations
            this.animations[5][this.facing].elapsedTime = 0;
        }
    }



    draw(ctx) {
        if (this.dead) {
            if (this.deathAnimationTimer > 0) {
                this.death.drawFrame(
                    this.game.clockTick, 
                    ctx, 
                    this.x - this.game.camera.x, 
                    this.y - this.game.camera.y, 
                    this.scale
                );
            }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[9][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x - this.game.camera.x, 
                this.y - this.game.camera.y, 
                this.scale
            );
        }    


        // Draw AOE Warning Circle
        const drawX = this.aoeTargetX - this.game.camera.x;
        const drawY = this.aoeTargetY - this.game.camera.y;
    
        ctx.save();
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.aoeScale, 0, Math.PI * 2);
    
        if (this.isPreparingAOE) {
            // Gradually changing color from green to yellow to red
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        } else if (this.isAboutToAOE) {
            // Solid red when stationary
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        } else {
            // No circle if not preparing or about to AOE
            ctx.restore();
            return;
        }
    
        ctx.lineWidth = 5;
        ctx.fill(); 
        ctx.stroke();
        ctx.restore();


    }
}