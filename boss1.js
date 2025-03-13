class Boss1 { //goblin king
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  

        this.maxHealth = 300;
        this.currentHealth = 300;
        this.didCrit = false;
        this.name = "Gorvok, The Goblin King";

        this.profileAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/HudIcons/Boss1Hud.png"), 0, 0, 32, 32, 13, 0.2, false, true);
        this.healthbar = this.game.addEntity(new BossHealthBar(game, this, this.profileAnimation, 32, 0, 0, 3));
        this.pointer = this.game.addEntity(new Pointer(game, this));
        this.state = 0; //0 = walk, 1 = attack, 2 = throwing, 3 = order, 4 = healing, 5 = jumping up, 6 = jumping down, 7 = dakmaged
        //attack will be throwing honestly
        this.facing = 0;
        this.bitSizeX = 64;
        this.bitSizeY = 64;
        this.scale = 5;
        this.aoeTargetX = (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeTargetY = (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);

        this.speed = 180;
        this.damage = 18;
        this.knockback = 3500;

        //Properties:
        this.waves = 2;
        

        
        //animations    
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks, so it doesnt hit player every tick
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time
        this.attackAnimationTimer = 0;
        this.attackAnimationDuration = 5 * 0.1;
        this.attacking = false;

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 3 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.deathAnimationTimer = 10 * 0.1; //10 frames * 0.2 duration. Should be frameCount * frameDuration for death animation


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
        this.landingAnimationDuration = 5.9 * 0.1;
        this.midAirTimer = 0;
        this.midAirDuration = 2.0; // How long to stay in mid-air
        this.fallingThreshold = 230; // Distance to ground when we switch to landing animation
        this.landingDamage = 27;

        this.circleSpawned = false;
        this.invincible = false;
        this.jumpCooldown = 3; //jump ability every 17 seconds
        this.jumpCooldownTimer = 0;

        //order properties
        this.orderAnimationTimer = 0;
        this.orderAnimationDuration = 5.9 * 0.2;
        this.waveCooldown = 55; //cooldown to how many times the boss can call in waves
        this.waveCooldownTimer = 0; 
        this.goblinsAlive = 0;
        this.goblinSpawn = 25;
        this.goblinMechSpawn = 2;
        this.spawnBuffer = 500; //Extra distance from screen edge for spawning


        //throwing properties:
        this.throwTimer = 0;
        this.throwDuration = 7.9 * 0.1;
        this.throwSpeed = 1050;
        this.shootCooldown = 4; //Shoot every 4 seconds
        this.shootTimer = 0; //should be 0
        this.throwAnimationElapsedTime = 0; //used for when boss does throwing animation then it faces other way
        this.shouldThrowMoney = false;
        this.moneyLifeTime = 0.7;
        this.range = 500;
        this.moneyBagScale = 5;
        this.moneyDamage = 13;
        this.moneyKnockback = 1600;

        //Healing Properties: 
        this.bossHeals = 1; //should only heal 1 time
        this.healAnimationTimer = 0;
        this.healAnimationDuration = 14.9 * 0.1;




        this.entityOrder = 5;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.animations = [];
        
        this.updateBB();
        this.loadAnimation();
    }


    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.65; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2 ; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 45; // Adjust Y position if needed
    
        this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
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
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 64, 64, 64, 5.9, 0.1, false, true);

        //attack
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 128, 256, 64, 64, 5, 0.1, false, true);

        //throwing
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 256, 64, 64, 7.9, 0.1, false, true);

        //order
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 512, 64, 64, 5.9, 0.2, false, true);

        //healing
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 320, 64, 64, 14.9, 0.1, false, true);

        //jumping up
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 576, 64, 64, 5, 0.1, false, true);
        
        //jumping up. Peak animation (one frame)
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 320, 576, 64, 64, 0.9, 0.1, false, true);

        //jumping down
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 640, 64, 64, 6, 0.1, false, true);

        //falling down (1 frame)
        this.animations[8][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 640, 64, 64, 0.9, 0.1, false, true);

        //damaged
        this.animations[9][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 384, 64, 64, 3, 0.1, false, true);

        //LEFT  
        //walking
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 644, 64, 64, 64, 5.9, 0.1, true, true);

        //attack
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 580, 256, 64, 64, 5, 0.1, true, true);

        //throwing
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 516, 256, 64, 64, 7.9, 0.1, true, true);

        //order
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 644, 512, 64, 64, 5.9, 0.2, true, true);

        //healing
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 68, 320, 64, 64, 14.9, 0.1, true, true);

        //jumping up
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 644, 576, 64, 64, 4.9, 0.1, true, true);
        
        //jumping up. Peak animation (one frame)
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 644, 576, 64, 64, 0.9, 0.1, true, true);

        //falling down
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 580, 640, 64, 64, 5.9, 0.1, true, true);

        //falling down. first animation
        this.animations[8][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 964, 640, 64, 64, 0.9, 0.1, true, true);

        //damaged
        this.animations[9][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 771, 384, 64, 64, 3, 0.1, true, true);

        this.death = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 448, 64, 64, 10, 0.1, false, false);
    }





    update() {  
        this.goblinsAlive = this.game.entities.filter(entity => entity instanceof Goblin || entity instanceof GoblinMech && !entity.dead).length;
        //in case the healing goes above max health
        if (this.currentHealth >= this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    
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
        }

        if (this.jumpCooldownTimer > 0) {
            this.jumpCooldownTimer -= this.game.clockTick;
        }

        if (this.waveCooldownTimer > 0) {
            this.waveCooldownTimer -= this.game.clockTick;
        }

        // Reduce attack cooldown timer
        if (this.attackCooldownTimer > 0) { //this is used for every mob attack. Makes sure a mob hits player once every second instead of every tick.
             this.attackCooldownTimer -= this.game.clockTick;
        }

        // Handle jumping state
        if (this.state === 5) { // Jumping up animation
            this.jumpAnimationTimer += this.game.clockTick;
            this.invincible = true; //turned invincible to avoid any conflicts / bugs w/ animation when we hit it. Could remove, but it makes it look better
            if (this.jumpAnimationTimer >= this.jumpAnimationDuration) {
                this.state = 6; // Switch to mid-air state
                this.jumpAnimationTimer = 0;
                this.midAirTimer = 0; // Reset mid-air timer
                //this.y = -200; // Move above screen
                this.isJumping = true;
                return;
            }
            return;
        }

        if (this.state === 6) { // In mid-air, tracking player
            this.midAirTimer += this.game.clockTick;
            if (this.y >= this.game.adventurer.y + this.jumpHeight) {
                this.y += this.jumpHeight * this.game.clockTick;
            } else {
                const targetX = this.aoeTargetX - (this.bitSizeX * this.scale)/2;
                const dx = targetX - this.x;
                const horizontalSpeed = 300; // Adjust this value to control horizontal tracking speed
                
                this.x += dx * this.game.clockTick * horizontalSpeed;
                this.y = this.game.adventurer.y + this.jumpHeight;
            }
           // this.x = this.aoeTargetX - (this.bitSizeX * this.scale)/2;


            // Update target position to player's location
            this.aoeTargetX = this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
            this.aoeTargetY = this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
            
            // Show warning indicator
            this.isPreparingAOE = true;
            this.updateBB();

            
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
            this.isAboutToAOE = false;
            if (!this.circleSpawned) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Explosion.mp3");
                this.game.addEntity(new CircleAOE(this.game, this.aoeTargetX, this.aoeTargetY , "./Sprites/Explosion/explosion3.png", 
                    null, 9.4, this.landingDamage, 0, null, false, 
                    0, 0, 48, 48, 6, 0.1, false, false));
                this.game.camera.cameraShake(200);

                this.circleSpawned = true;
            }
            if (this.landingAnimationTimer >= this.landingAnimationDuration) {
                this.invincible = false;
                this.state = 0;
                this.isPreparingAOE = false;
                this.landingAnimationTimer = 0;
                this.isJumping = false;
                this.circleSpawned = false;
                this.jumpCooldownTimer = this.jumpCooldown; //reset cooldown timer
            }
            return;
        }

        if (this.state == 3) {
            this.orderAnimationTimer += this.game.clockTick;
            if (this.orderAnimationTimer >= this.orderAnimationDuration) { //at the end of the animation
                this.invincible = false;
                this.state = 0;
                this.landingAnimationTimer = 0;
                this.waveCooldownTimer = this.waveCooldown; //reset cooldown timer
                this.spawningWave()
            }
            return;
        }

        if (this.state == 4) {
            this.healAnimationTimer += this.game.clockTick;
            if (this.healAnimationTimer >= this.healAnimationDuration) { //at the end of the animation
                console.log("HEALING NOW");
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Healing.wav");
                this.invincible = false;
                this.healAnimationTimer = 0;
                this.state = 0;
                this.currentHealth += 150;
                this.invincible = false;
            }
            return;      
        }
    
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2 + 70);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > 2) {
            const newFacing = dx < 0 ? 1 : 0;
            if (this.facing !== newFacing && this.throwTimer > 0) {
                //Store current throw animation time before switching
                this.throwAnimationElapsedTime = this.animations[2][this.facing].elapsedTime;
                //Update facing
                this.facing = newFacing;
                // Set the new direction's animation to the same time
                this.animations[2][this.facing].elapsedTime = this.throwAnimationElapsedTime;
            } else {
                this.facing = newFacing;
            }
        }


        // Handle shooting cooldown
        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }
        if (this.throwTimer > 0) {
            this.throwTimer -= this.game.clockTick;
            this.state = 2; // Keep in throw state while timer is active
            // Update the stored elapsed time
            this.throwAnimationElapsedTime = this.animations[2][this.facing].elapsedTime;
            // Check if we're at the end of the throw animation
            if (this.throwTimer <= 0.55 && this.shouldThrowMoney && !this.isJumping) {
                console.log("testing");
                this.throwMoney(); 
                this.shouldThrowMoney = false; //Reset the flag
            }
            this.updateBB();
            return;
        } else {
            // Reset throw animation times when complete
            this.animations[2][0].elapsedTime = 0;
            this.animations[2][1].elapsedTime = 0;
            this.throwAnimationElapsedTime = 0;
            this.state = 0; // Return to running state when throw is done
        }
    

        const movement = this.speed * this.game.clockTick;
        this.x += (dx / distance) * movement;
        this.y += (dy / distance) * movement;
       
        if (distance <= this.range && this.shootTimer <= 0 && distance > 180 && !this.isJumping) {
            //Start throwing animation and set flag to shoot after
            this.throwTimer = this.throwDuration;
            this.shouldThrowMoney = true; //Should set flag to shoot when animation ends
            this.shootTimer = this.shootCooldown; // Reset cooldown
        }


        if (distance <= 400) {    
            let randomMove = Math.floor(Math.random() * 3);
            if (randomMove == 0 && this.jumpCooldownTimer <= 0 && this.currentHealth <= this.maxHealth/2 && !this.isPlayingDamageAnimation) { //maybe also depend on health?
                this.initiateJumpAttack();
            }

            if (randomMove == 1 && this.waveCooldownTimer <= 0 && this.waves > 0 && this.currentHealth <= (this.maxHealth * 0.7) && !this.isPlayingDamageAnimation) { //&& this.goblinsAlive == 0
                this.waves--;
                this.invincible = true;
                this.initiateCommandWave();
            }

            if (randomMove == 2 && this.bossHeals > 0 && this.currentHealth <= (this.maxHealth * 0.33) && !this.isPlayingDamageAnimation) {
                this.bossHeals--;
                this.invincible = true;
                this.heal();
            }
        }


        //COLLISIONS:
        const separationDistance = 200; // Minimum distance between mobs
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if ((entity instanceof GoblinMech) && entity !== this) {
                const dx = entity.x - this.x;
                const dy = entity.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
      
                if (distance < separationDistance && distance > 0) {
                    // Apply a repelling force
                    const repelFactor = 40; // Adjust for stronger/weaker repulsion
                    const repelX = dx / distance * repelFactor * this.game.clockTick;
                    const repelY = dy / distance * repelFactor * this.game.clockTick;
      
                    this.x -= repelX;
                    this.y -= repelY;
                }
            }
  
            if (entity instanceof Adventurer) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee punch.wav");
                        // Attack the player and reset cooldown timer
                        const centerX = this.BB.x + this.BB.width/2;
                        const centerY = this.BB.y + this.BB.height/2;
                        entity.takeDamageKnockback(this.damage, this.knockback, centerX, centerY);
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                        console.log("Goblin King attacked the player!");
                    }
                    this.state = 1; //Attacking state
                }
            }
        }

        this.updateBB();
    }

    initiateJumpAttack() {
        if (this.state === 0) { // Only initiate if in normal state
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss1 Jumping.wav");
            this.state = 5; // Start jump animation
            this.isPreparingAOE = false;
            this.isAboutToAOE = false;
            this.jumpAnimationTimer = 0;
            this.midAirTimer = 0;
            // Reset any relevant animations
            this.animations[5][this.facing].elapsedTime = 0;
        }
    }

    initiateCommandWave() {
        if (this.state === 0) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss1 summon.wav");
            this.state = 3;
            this.orderAnimationTimer = 0; 
            this.animations[3][this.facing].elapsedTime = 0; //reset animation
        }
    }


    spawningWave() {
        for (var i = 0; i < this.goblinSpawn; i++) {
            const spawnPos = this.getValidSpawnPosition();
            this.game.addEntity(new Goblin(this.game, spawnPos.x, spawnPos.y));
        }

        for (var i = 0; i < this.goblinMechSpawn; i++) {
            const spawnPos = this.getValidSpawnPosition();
            this.game.addEntity(new GoblinMech(this.game, spawnPos.x, spawnPos.y));
        }
    } 
    
    throwMoney() {
        console.log("throwing money!");
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss1 Coin Attack.wav");
        const characterCenterX = this.x + (this.bitSizeX * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSizeY * this.scale) / 2;
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2);
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);

        const angle = Math.atan2(dy, dx);

        this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.moneyDamage, this.throwSpeed, 
            "./Sprites/Boss/CoinBag.png", this.moneyKnockback, false, this.moneyBagScale, false, this.moneyLifeTime,
            0, 0, 32, 32, 3, 0.1, false, true, -16, -23, 32, 32, 32, 32, this));
    }

    heal() {
        if (this.state === 0) {
            this.state = 4;
            this.healAnimationTimer = 0;
            this.animations[4][this.facing].elapsedTime = 0; //reset animation
        }
    }

    /**
     * //will spawn the mob outside the camera.
     * @returns the x and y coordinate of where the zombie will spawn (should be outside the player camera)
     */
    getValidSpawnPosition() { 
        //Get camera position and viewport dimensions
        const camera = this.game.camera;
        const viewportWidth = PARAMS.CANVAS_WIDTH;
        const viewportHeight = PARAMS.CANVAS_HEIGHT;

        // Calculate the visible area boundaries
        const visibleLeft = camera.x;
        const visibleRight = camera.x + viewportWidth;
        const visibleTop = camera.y;
        const visibleBottom = camera.y + viewportHeight;

        // Define spawn area (slightly larger than visible area)
        const spawnLeft = visibleLeft - this.spawnBuffer;
        const spawnRight = visibleRight + this.spawnBuffer;
        const spawnTop = visibleTop - this.spawnBuffer;
        const spawnBottom = visibleBottom + this.spawnBuffer;

        // Choose a random side to spawn from (0: top, 1: right, 2: bottom, 3: left)
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch(side) {
            case 0: // Top
                x = spawnLeft + Math.random() * (spawnRight - spawnLeft);
                y = spawnTop;
                break;
            case 1: // Right
                x = spawnRight;
                y = spawnTop + Math.random() * (spawnBottom - spawnTop);
                break;
            case 2: // Bottom
                x = spawnLeft + Math.random() * (spawnRight - spawnLeft);
                y = spawnBottom;
                break;
            case 3: // Left
                x = spawnLeft;
                y = spawnTop + Math.random() * (spawnBottom - spawnTop);
                break;
        }

        // Add some randomness to prevent zombies spawning in exact lines
        const randomOffset = 50; // Random offset range
        x += Math.random() * randomOffset - randomOffset/2;
        y += Math.random() * randomOffset - randomOffset/2;

        return { x, y };
    }

    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        this.currentHealth -= damage;

        if (this.throwTimer > 0) {
            this.shouldThrowRock = false;
            this.throwTimer = 0;
        }

        if (this.dead) {
            return;
        }

        // Apply knockback
        const dx = (this.x + (this.bitSizeX * this.scale)/2) - sourceX;
        const dy = (this.y + (this.bitSizeY * this.scale)/2) - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the mob and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.currentHealth <= 0) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss1 death.wav");
            this.game.addEntity(new CoinPile(this.game, (this.x + 28), (this.y + 55)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new BossExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));

            setTimeout(() => {
                // Check if the game still exists before adding the entity
                if (this.game && this.game.addEntity) {
                    this.game.addEntity(new PortalDoor(this.game, (this.BB.x + this.BB.width/2), (this.BB.y + this.BB.height/2)));
                    this.game.camera.bossDead = true;
                }
            }, 5000);
    
            this.dead = true;
            this.state = 9;
            const entities = this.game.entities;
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if (entity.dead != null && !entity.dead && !(entity instanceof Adventurer)) {
                    entity.dead = true;
                }
            }

        } else {
            this.state = 9;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[9][0].elapsedTime = 0;
            } else {
                this.animations[9][1].elapsedTime = 0;
            }
        }
    }



    draw(ctx) {
        if (this.isJumping) {
            const shadowWidth = 150 * (this.scale / 5); 
            const shadowHeight = 16 * (this.scale / 5);
    
            const shadowX = (this.aoeTargetX + (-70 * (this.scale / 5))) - this.game.camera.x;
            const shadowY = (this.aoeTargetY + (90 * (this.scale / 5))) - this.game.camera.y;
            ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
        } else {
            const shadowWidth = 150 * (this.scale / 5); 
            const shadowHeight = 16 * (this.scale / 5);
    
            const shadowX = (this.x + (90 * (this.scale / 5))) - this.game.camera.x;
            const shadowY = (this.y + (310 * (this.scale / 5))) - this.game.camera.y;
            ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
        }

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
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
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