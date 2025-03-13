class Boss3 {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle/walking, 1 = charge, 2 = damage
        this.facing = 0; //0 = right, 1 = left
        this.previousState = 0; //store state before damage animation

        this.scale = 6;
        this.speed = 180;
        this.chargeSpeed = 2700;
        this.bitSizeX = 81;
        this.bitSizeY = 71;

        this.currentHealth = 600;
        this.maxHealth = 600;

        //Attack properties (when player makes collision)
        this.attackPower = 15;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        //charging properties
        this.canKnockback = true;
        this.isCharging = false;
        this.chargingDamage = 50;
        this.chargePrepTime = 3;
        this.isPreparingCharge = false
        this.chargeCooldown = 2; //Charge every 3 seconds

        //Damage/death animation properties
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 3 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.dead = false;
        this.deathAnimationTimer = 6 * 0.1;

        //Projectile Properties
        this.projectileTimer = 0;
        this.projectileDuration = 7.9 * 0.1;
        this.projectileSpeed = 1300;
        this.shootCooldown = 4; //Shoot every 4 seconds
        this.shootTimer = 0; //should be 0
        this.projectileAnimationElapsedTime = 0; //used for when boss does throwing animation then it faces other way
        this.shouldShoot = false;
        this.projectileScale = 10;
        this.projectileDamage = 33;
        this.projectileKnockback = 1600;

        // Enhanced projectile patterns based on health
        this.projectilePatterns = {
            // Unlocked from the start
            basic: {
                name: "Single Shot",
                unlockThreshold: 1.0, // 100% health (always available)
                execute: this.fireBasicProjectile.bind(this)
            },
            // Unlocks at 75% health
            triple: {
                name: "Triple Shot",
                unlockThreshold: 0.75, // 75% health
                execute: this.fireTripleProjectile.bind(this)
            },
            // Unlocks at 50% health
            random: {
                name: "Random Burst",
                unlockThreshold: 0.5, // 50% health
                execute: this.fireRandomProjectile.bind(this)
            },
            // Unlocks at 25% health
            nova: {
                name: "Nova Blast",
                unlockThreshold: 0.4, // 40% health
                execute: this.fireNovaProjectile.bind(this)
            }
        };

        // Tracking for available projectile patterns
        this.availablePatterns = [];
        this.updateAvailablePatterns();

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.entityOrder = 30;

        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.maxChargeDuration = 3; // Maximum charge duration in seconds
        this.currentChargeDuration = 0; // Tracks how long hellspawn has been charging

        this.name = "Azgorth, The Flameborn";
      
        this.profileAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/IDLE.png"), 0, 0, 48, 48, 3.94, 0.1, false, true);
        this.healthbar = this.game.addEntity(new BossHealthBar(game, this, this.profileAnimation, 48, 0, 0, 2));
        this.pointer = this.game.addEntity(new Pointer(game, this));

        this.rangedOnce = true;

        this.animations = []; //will be used to store animations

        this.updateBB();
        this.loadAnimation();
    }
    
    updateAvailablePatterns() {
        //calculate health percentage
        const healthPercentage = this.currentHealth / this.maxHealth;
        
        //clear current patterns
        this.availablePatterns = [];
        
        //add patterns that are unlocked based on current health
        for (const [key, pattern] of Object.entries(this.projectilePatterns)) {
            if (healthPercentage <= pattern.unlockThreshold) {
                this.availablePatterns.push(key);
            }
        }        
    }

    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  //adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.5; //adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2 - 86; //Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 10; //Adjust Y position if needed
    
        this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
    }

    loadAnimation() {
        for (var i = 0; i < 4; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }
        //Had to make some adjustments with where to start on spritesheet to make it look correct.

        //LOOKNG RIGHT
        //flying, looking to the right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/FLYING-flipped.png"), 0, 0, 81, 71, 3.94, 0.1, true, true);

        //Charge/preperation, to the right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/FLYING-flipped.png"), 81, 0, 81, 71, 3, 0.05, true, true);

        //Damaged, to the right
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/HURT-flipped.png"), 0, 0, 81, 71, 3, 0.1, true, true); //wanna start at where the zombie turns white or else there'll be a delay

        //Shoot/attack state
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/ATTACK-flipped.png"), 0, 0, 81, 71, 8, 0.1, true, true);

        

        //LOOKING LEFT
        //flying, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/FLYING.png"), 0, 0, 81, 71, 3.94, 0.1, false, true);

        //Charge/preperation, to the left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/FLYING.png"), 0, 0, 81, 71, 3, 0.05, false, true);

        //Damaged, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/HURT.png"), 81, 0, 81, 71, 3, 0.1, false, true); //wanna start at where the zombie turns white or else there'll be a delay

        //Shoot/attack state
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/ATTACK.png"), 0, 0, 81, 71, 8, 0.1, false, true);


        //death animation
        this.deadAnimation =  new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/FlyingDemon/DEATH.png"), 0, 0, 81, 71, 6, 0.1, false, false);
    }



    update () {
        // Handle damage animation
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false;
                
                // Return to the previous state after damage animation
                // If we were preparing to charge or charging, continue that action
                if (this.isPreparingCharge) {
                    this.state = 1; // Return to charge preparation state
                } else if (this.isCharging) {
                    this.state = 1; // Return to charging state
                } else {
                    // If we weren't in a special state, return to the stored previous state
                    // or default to idle state
                    this.state = this.previousState || 0;
                }
            }
        }

        // Handle death state
        if (this.dead) {
            this.deathAnimationTimer -= this.game.clockTick;
            if (this.deathAnimationTimer <= 0) {
                this.removeFromWorld = true;
            }
            return;
        }


        // Apply pushback from previous damage. No knockback when charging.
        if (!this.dead && !this.isCharging) {
            this.x += this.pushbackVector.x * this.game.clockTick;
            this.y += this.pushbackVector.y * this.game.clockTick;

            // Decay the pushback vector
            this.pushbackVector.x *= this.pushbackDecay;
            this.pushbackVector.y *= this.pushbackDecay;
        }


        const player = this.game.adventurer;

        // // Calculate distance to player
        const dx =  (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2); 
        const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // // Charge timer and mechanism
        this.chargeTimer = (this.chargeTimer || 0) + this.game.clockTick;

        if (distance > 2  && !this.isPreparingCharge && !this.isCharging) {
            const newFacing = dx < 0 ? 1 : 0;
            if (this.facing !== newFacing && this.projectileTimer > 0) {
                //Store current throw animation time before switching
                this.projectileAnimationElapsedTime = this.animations[3][this.facing].elapsedTime;
                //Update facing
                this.facing = newFacing;
                // Set the new direction's animation to the same time
                this.animations[3][this.facing].elapsedTime = this.projectileAnimationElapsedTime;
            } else {
                this.facing = newFacing;
            }
        }

        //if both chargeTimer and rangeTimerCooldowns are 

        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }

        // if (this.shootTimer <= 0 && !this.isCharging && !this.isPreparingCharge && distance > 220) {
        //     //Start throwing animation and set flag to shoot after
        //     this.projectileTimer = this.projectileDuration;
        //     this.shouldShoot = true; //Should set flag to shoot when animation ends
        //     this.shootTimer = this.shootCooldown; // Reset cooldown
        // }

        if (this.projectileTimer > 0) {
            this.projectileTimer -= this.game.clockTick;
            this.state = 3; // Keep in throw state while timer is active
            if (this.rangedOnce) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 ranged attacks.wav");
                this.rangedOnce = false;
            }
            // Update the stored elapsed time
            this.projectileAnimationElapsedTime = this.animations[3][this.facing].elapsedTime;
            // Check if we're at the end of the throw animation
            if (this.projectileTimer <= 0.55 && this.shouldShoot && !this.isPreparingCharge && !this.isCharging) {
                this.shootProjectile(); 
                this.shouldShoot = false; //Reset the flag
                this.rangedOnce = true;
            }
            
            // Don't reset animation state if we're in the middle of a double nova cast
            if (this.projectileTimer <= 0 && this.animations[3][this.facing].elapsedTime >= this.animations[3][this.facing].totalTime) {
                // Animation has completed fully
                this.animations[3][0].elapsedTime = 0;
                this.animations[3][1].elapsedTime = 0;
                this.projectileAnimationElapsedTime = 0;
                this.state = 0; // Return to flying state when throw is done
            }
            
            this.updateBB();
            return;
        }


    
        // if (this.chargeTimer >= this.chargeCooldown && !this.isCharging && (distance > 550 || distance <= 220)) { //this is where charging starts
        //     // Enter charge preparation state
        //     if (!this.isPreparingCharge) {
        //         this.isPreparingCharge = true;
        //         this.chargePrepTimer = this.chargePrepTime;
        //         this.state = 1; // Preparation state (same as charge state visually)
        //     }
        // }

        // Only decide on a new action when both timers are ready
        if (this.chargeTimer >= this.chargeCooldown && this.shootTimer <= 0 && !this.isCharging && !this.isPreparingCharge) {
            // Randomly choose between charging and shooting
            const randomChoice = Math.random();
            
            // You can adjust this threshold to control how often each action occurs
            // 45/55 chance between charging and shooting
            const chargeThreshold = 0.45; 
            if (distance >= 580) {
                if (!this.isPreparingCharge) {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 idle.wav");
                    this.isPreparingCharge = true;
                    this.chargePrepTimer = this.chargePrepTime;
                    this.state = 1; // Preparation state (same as charge state visually)
                    this.chargeTimer = 0;
                }
            } else if (randomChoice < chargeThreshold) {
                if (!this.isPreparingCharge) {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 idle.wav");
                    this.isPreparingCharge = true;
                    this.chargePrepTimer = this.chargePrepTime;
                    this.state = 1; // Preparation state (same as charge state visually)
                    this.chargeTimer = 0;
                }
            } else {
                // Start shooting projectiles
                this.projectileTimer = this.projectileDuration;
                this.shouldShoot = true;
                this.shootTimer = this.shootCooldown; // Reset cooldown
                this.chargeTimer = 0; // Also reset charge timer to avoid immediate charge after shooting
            }
        }
    
        if (this.isPreparingCharge) {
          // Countdown preparation time
            this.chargePrepTimer -= this.game.clockTick;
            this.facing = dx < 0 ? 1 : 0; // 1 = left, 0 = right
            if (this.chargePrepTimer <= 0) {
                // Initiate actual charge
                this.isPreparingCharge = false;
                this.isCharging = true;
                this.chargeTimer = 0;
                this.currentChargeDuration = 0;

                //Calculate charge direction and target point
                const chargeDistance = 300; //Adjust this value to control how far HellSpawn goes past the player
                this.chargeDirection = {
                    x: (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2- (this.BB.x + this.BB.width/2)) / distance,
                    y: (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2 - (this.BB.y + this.BB.height/2)) / distance
                };

                // Extend the charge target beyond the player's position
                this.chargeTarget = {
                    x: this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2 + this.chargeDirection.x * chargeDistance,
                    y: this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2 + this.chargeDirection.y * chargeDistance
                };
            }
        }
    
        if (this.isCharging) { 
            this.currentChargeDuration += this.game.clockTick;

            // Check if charge duration exceeded limit
            if (this.currentChargeDuration >= this.maxChargeDuration) {
                this.isCharging = false;
                this.state = 0;
                this.currentChargeDuration = 0;
                //this.shootTimer = this.shootCooldown; //used so it doesnt fire off projectile right after charge
                return;
            }
            // Move in charge direction
            this.x += this.chargeDirection.x * this.chargeSpeed * this.game.clockTick;
            this.y += this.chargeDirection.y * this.chargeSpeed * this.game.clockTick;
            
    
            // End charge if reached or passed target
            const currentDistanceToTarget = Math.sqrt(
                Math.pow((this.BB.x + this.BB.width/2) - this.chargeTarget.x, 2) + 
                Math.pow((this.BB.y + this.BB.height/2) - this.chargeTarget.y, 2)
            );
    
            if (currentDistanceToTarget <= 45) {
                this.isCharging = false;
                this.state = 0;
                this.currentChargeDuration = 0;  // Reset the duration timer
                //this.shootTimer = this.shootCooldown;
            }
        }
        
        else if (!this.isPreparingCharge) {
            //Normal movement when not charging or preparing
            const movement = this.speed * this.game.clockTick;
            this.x += (dx / distance) * movement;
            this.y += (dy / distance) * movement;
            this.state = 0;
        }    

        //collision
        const entities = this.game.entities;
        const separationDistance = 300; // Minimum distance between hellspawns

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof Adventurer) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        if (this.isCharging) {
                            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 ranged attacks.wav");
                            entity.takeDamage(this.chargingDamage);
                        } else {
                            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee bite.wav");
                            entity.takeDamage(this.attackPower);
                        }
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                    }
                }
            }
            //make sure its not charging. If we dont do this, one of them will keep on charging forever
            if (entity instanceof HellSpawn && !this.isCharging && entity !== this) {
                const dx = entity.x - this.x;
                const dy = entity.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < separationDistance && distance > 0) {
                    //Apply a repelling force
                    const repelFactor = 40; //Adjust for stronger/weaker repulsion
                    const repelX = dx / distance * repelFactor * this.game.clockTick;
                    const repelY = dy / distance * repelFactor * this.game.clockTick;
    
                    this.x -= repelX;
                    this.y -= repelY;
                }
            }

   
        }
 
           // Reduce attack cooldown timer
           //this is used for every HellSpawn attack. Makes 
           //sure a HellSpawn hits player once every second instead of every tick.
           if (this.attackCooldownTimer > 0) { 
                this.attackCooldownTimer -= this.game.clockTick;
            }

        // Update bounding box
        this.updateBB();
    }

    // Basic single projectile (available from the start)
    fireBasicProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        const player = this.game.adventurer;
        const dx = (player.BB.x + player.BB.width/2) - characterCenterX;
        const dy = (player.BB.y + player.BB.height/2) - characterCenterY;
        const angle = Math.atan2(dy, dx);
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 fire.wav");
        this.game.addEntity(new Projectile(
            this.game, 
            characterCenterX, 
            characterCenterY, 
            angle, 
            this.projectileDamage, 
            1000, 
            "./Sprites/Magic/FireProjectile.png", 
            this.projectileKnockback, 
            false, 
            this.projectileScale, 
            false, 
            5, 0, 0, 16, 16, 30, 0.1, 
            false, true, -16, -23, 40, 40, 
            16, 16, this
        ));
    }

    // Triple projectile (unlocks at 75% health)
    fireTripleProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        const player = this.game.adventurer;
        const dx = (player.BB.x + player.BB.width/2) - characterCenterX;
        const dy = (player.BB.y + player.BB.height/2) - characterCenterY;
        const baseAngle = Math.atan2(dy, dx);
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 fire.wav");
        // Spread angle in radians
        const spread = 0.2; 
        // Create 3 projectiles with a spread
        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + (i * spread);
            
            this.game.addEntity(new Projectile(
                this.game, 
                characterCenterX, 
                characterCenterY, 
                angle, 
                Math.round(this.projectileDamage * 0.8), // Slightly reduced damage per projectile
                400, 
                "./Sprites/Magic/FireProjectile.png", 
                this.projectileKnockback, 
                false, 
                this.projectileScale, 
                false, 
                5, 0, 0, 16, 16, 30, 0.1, 
                false, true, -16, -23, 40, 40, 
                16, 16, this
            ));
        }
    }

    //Random projectiles (unlocks at 50% health)
    fireRandomProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        const player = this.game.adventurer;
        const baseX = (player.BB.x + player.BB.width/2) - characterCenterX;
        const baseY = (player.BB.y + player.BB.height/2) - characterCenterY;
        const baseAngle = Math.atan2(baseY, baseX);
        
        // Number of projectiles to fire
        const projectileCount = 50;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 fire.wav");
        // Create multiple projectiles with random angle variations
        for (let i = 0; i < projectileCount; i++) {
            // Random angle variation within a cone facing the player
            const randomVariation = (Math.random() - 0.5) * 1.6; // Random value between -0.8 and 0.8 radians (about ±45 degrees)
            const angle = baseAngle + randomVariation;
            
            // Random speed variation
            const speedMultiplier =  Math.random() * (0.5 - 0.3) + 0.3; // Between 0.3 - 0.5
            
            // Random delay for more chaotic feeling
            const delay = Math.floor(Math.random() * 350); // Random delay up to 350ms
            
            setTimeout(() => {
                if (!this.dead && !this.removeFromWorld) {
                    this.game.addEntity(new Projectile(
                        this.game, 
                        characterCenterX + (Math.random() - 0.5) * 20, // Small positional variation
                        characterCenterY + (Math.random() - 0.5) * 20, // Small positional variation
                        angle, 
                        Math.round(this.projectileDamage * 0.4), // Reduced damage per projectile
                        this.projectileSpeed * speedMultiplier, // Random speed variation
                        "./Sprites/Magic/FireProjectile.png", 
                        this.projectileKnockback, 
                        false, 
                        this.projectileScale, 
                        false, 
                        5, 0, 0, 16, 16, 30, 0.1, 
                        false, true, -16, -23, 40, 40, 
                        16, 16, this
                    ));
                }
            }, delay);
        }
    }

    // Nova blast (unlocks at 25% health)
    fireNovaProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 fire.wav");
        // Fire first wave of projectiles in a complete circle
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            
            this.game.addEntity(new Projectile(
                this.game, 
                characterCenterX, 
                characterCenterY, 
                angle, 
                this.projectileDamage, //Reduced damage per projectile
                this.projectileSpeed * 0.6, 
                "./Sprites/Magic/FireProjectile.png", 
                this.projectileKnockback, 
                false, 
                this.projectileScale, 
                false, 
                5, 0, 0, 16, 16, 30, 0.1, 
                false, true, -16, -23, 40, 40, 
                16, 16, this
            ));
        }
        
        // Schedule second wave of projectiles after a short delay
        setTimeout(() => {
            if (!this.dead && !this.removeFromWorld) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 fire.wav");
                this.projectileTimer = this.projectileDuration;
                this.shouldShoot = false; // Prevent normal shoot logic from firing again
                this.state = 3; // Set back to throw/attack state
                
                // Reset animation to start frame
                this.animations[3][this.facing].elapsedTime = 0;
                // Slight offset for second wave to create staggered pattern
                for (let i = 0; i < 30; i++) {
                    const angle = (Math.PI * 2 * i) / 30 + (Math.PI / 30); // Slight offset from first wave
                    
                    this.game.addEntity(new Projectile(
                        this.game, 
                        characterCenterX, 
                        characterCenterY, 
                        angle, 
                        this.projectileDamage, // Even more reduced damage for second wave
                        this.projectileSpeed * 0.3, // Slightly slower second wave
                        "./Sprites/Magic/FireProjectile.png", 
                        this.projectileKnockback * 0.8, // Reduced knockback
                        false, 
                        this.projectileScale, 
                        false, 
                        5, 0, 0, 16, 16, 30, 0.1, 
                        false, true, -16, -23, 40, 40, 
                        16, 16, this
                    ));
                }
            }
        }, 700); //700ms delay between waves
    }

    shootProjectile() {
        // Check available patterns based on current health percentage
        this.updateAvailablePatterns();
        
        if (this.availablePatterns.length > 0) {
            // Choose a random pattern from available ones
            const randomPatternIndex = Math.floor(Math.random() * this.availablePatterns.length);
            const chosenPatternKey = this.availablePatterns[randomPatternIndex];
            const chosenPattern = this.projectilePatterns[chosenPatternKey];
            
            // Execute the chosen pattern
            console.log(`Boss using ${chosenPattern.name} attack pattern!`);
            chosenPattern.execute();
        } else {
            // Fallback to basic projectile if no patterns available (shouldn't happen)
            this.fireBasicProjectile();
        }
        // this.chargeTimer = 0;
    }


    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        this.currentHealth -= damage;

        if (this.dead) {
            return;
        }
        // Check if we've reached a health threshold that unlocks new attack patterns
        this.updateAvailablePatterns();

        //Damaging while its preparing to charge, it'll still charge

        
        // Apply knockback
        const dx = (this.BB.x + this.BB.width/2) - sourceX;
        const dy = (this.BB.y + this.BB.height/2) - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the zombie and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.currentHealth <= 0) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss3 death.wav");
            this.game.addEntity(new CoinPile(this.game, (this.x + 28), (this.y + 55)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new BossExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));

            // Add portal after 5 seconds (5000 milliseconds)
            setTimeout(() => {
                // Check if the game still exists before adding the entity
                if (this.game && this.game.addEntity) {
                    this.game.addEntity(new PortalDoor(this.game, (this.BB.x + this.BB.width/2), (this.BB.y + this.BB.height/2)));
                    this.game.camera.bossDead = true;
                }
            }, 5000);
    

            this.dead = true;
            this.state = 2;
        } else {
            this.previousState = this.state;
            this.state = 2;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[2][0].elapsedTime = 0;
            } else {
                this.animations[2][1].elapsedTime = 0;
            }
        }
    }


    draw(ctx) {
       // Calculate shadow dimensions based on zombie scale
       const shadowWidth = 100 * (this.scale / 2.8); // 2.6 is your default scale
       const shadowHeight = 32 * (this.scale / 2.8);

       // Adjust shadow position to stay centered under the zombie
       const shadowX = (this.x + (40 * (this.scale / 2.8))) - this.game.camera.x;
       const shadowY = (this.y + (180 * (this.scale / 2.8))) - this.game.camera.y;
        if (this.miniBoss) {
            this.warning.drawFrame(this.game.clockTick, ctx, shadowX + 12, shadowY - (50 * this.scale), 0.05);
        }

       ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        // Calculate drawing x position with 125px offset when facing right
        const drawX = this.x - (this.facing === 0 ? 155 : 0) - this.game.camera.x;
        const drawY = this.y - this.game.camera.y;

        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, drawX, drawY, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[2][this.facing].drawFrame(this.game.clockTick, ctx, drawX, drawY, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, drawX, drawY, this.scale); 
        }

        //Add charge path indicator
        if (this.isPreparingCharge || this.isCharging) {
                ctx.save(); //save current canvas and what's on screen.
                ctx.beginPath();
                //Semi-transparent red
                ctx.strokeStyle = this.isPreparingCharge ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
                ctx.lineWidth = 180; 
                
                //Start drawing from current HellSpawn position (middle of the image)
                ctx.moveTo(
                    ((this.BB.x + this.BB.width/2)) - this.game.camera.x, 
                    ((this.BB.y + this.BB.height/2)) - this.game.camera.y
                );
                
                //During charge preparation, line follows player. 

                const targetX = this.isPreparingCharge 
                    ? this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2
                    : this.chargeTarget.x;
                const targetY = this.isPreparingCharge //if its not preparing charge, we're charging, which has chargetarget.y value
                    ? this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2
                    : this.chargeTarget.y;
                
                
                //Draw line to target
                ctx.lineTo(
                    targetX - this.game.camera.x, 
                    targetY - this.game.camera.y
                );
                
                ctx.stroke();
                ctx.restore();
        }
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect((this.BB.x + this.BB.width/2) - this.game.camera.x, (this.BB.y + this.BB.height/2) - this.game.camera.y, 20, 20);

            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }

    }
    

    
}