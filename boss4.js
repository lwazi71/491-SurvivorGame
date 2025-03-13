class Boss4 {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle/walking, 1 = attack1, 2 = attack2, 3 = charge, 4 = cast (projectile), 5 = cast (summon),  6 = cast (ranged AOE), 7 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.previousState = 0; //store state before damage animation

        this.scale = 6;
        this.speed = 180;
        this.chargeSpeed = 2700;
        this.bitSizeX = 100;
        this.bitSizeY = 100;

        this.currentHealth = 1200;
        this.maxHealth = 1200;

        //Attack properties (when player makes collision)
        this.attackPower = 20;
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
        this.damageAnimationDuration = 1 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.dead = false;
        this.deathAnimationTimer = 18 * 0.1;

        //Projectile Properties
        this.projectileTimer = 0;
        this.projectileDuration = 5 * 0.1;
        this.projectileSpeed = 1300;
        this.shootCooldown = 4; //Shoot every 4 seconds
        this.shootTimer = 0; //should be 0
        this.projectileAnimationElapsedTime = 0; //used for when boss does throwing animation then it faces other way
        this.shouldShoot = false;
        this.projectileScale = 10;
        this.projectileDamage = 33;
        this.projectileKnockback = 1600;

        this.once = true;
        this.deathOnce = true;
        this.summonOnce = true;
        this.dashingOnce = true;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 idle.wav");
        this.idleSoundTimer = 3;

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
                name: "Big Projectile",
                unlockThreshold: 0.75, //75% health
                execute: this.fireSpiralProjectiles.bind(this)
            },
            // Unlocks at 60%
            nova: {
                name: "Nova Blast",
                unlockThreshold: 0.6, //60% health
                execute: this.fireNovaProjectile.bind(this)
            }
        };

        //AOE ability Properties: 
        this.aoeTimer = 0;
        this.aoeCooldown = 25; //AOE attack every 25 seconds
        this.aoeWarningStage = 0; // 0 = not warning, 1 = warning following, 2 = stationary warning
        this.aoeWarningDuration = 4; //Total warning duration
        this.aoeWarningTimer = 0;
        this.aoeTargetX = (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeTargetY = (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeAttackDelay = 0; // Delay before actual AOE attack
        this.aoeAttackDelayDuration = 1;
        this.castTimer = 0;
        this.castDuration = 5 * 0.1;
        this.aoeScale = 360; 
        this.circleAOE = 5; //radius
        this.range = 400; //Shooting range (range until our enemy doing AOE attack on player)
        this.isPreparingAOE = false; 
        this.isAboutToAOE = false;

        //Combat properties:
        this.attackRange = 310; //Detection range for attacks
        this.closeRange = 70;   //Range for spin attack
        this.verticalCloseRange = 90; // Range for considering player "below" the minotaur
        this.attacking = false;
        this.attackCooldown = 2.5; //Seconds between attacks
        this.attackTimer = 0;
        this.lockedFacing = null; //Will be locked to this.facing, which is why we start off with null.
        this.knockback = 2000;
        
        // Animation timers
        this.attack1Duration = 6 * 0.1; // 9 frames * 0.1 seconds
        this.attack2Duration = 6 * 0.1; // 9 frames * 0.1 seconds

        //Ordering Summons Properties:
        this.orderAnimationTimer = 0;
        this.orderAnimationDuration = 5 * 0.1;
        this.waveCooldown = 30; //cooldown to how many times the boss can call in waves
        this.waveCooldownTimer = 0; 
        this.waves = 2;

        // Tracking for available projectile patterns
        this.availablePatterns = [];
        this.updateAvailablePatterns();

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.entityOrder = 30;

        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.maxChargeDuration = 3; // Maximum charge duration in seconds
        this.currentChargeDuration = 0; // Tracks how long hellspawn has been charging

        this.name = "HOLAWRAD, The Executioner";
        this.profileAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/HudIcons/boss4Hud_32x32.png"), 0, 0, 32, 32, 12, 0.12, false, true);
        this.healthbar = this.game.addEntity(new BossHealthBar(game, this, this.profileAnimation, 32, 0, 0, 3));
        this.pointer = this.game.addEntity(new Pointer(game, this));

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
        const width = this.bitSizeX * this.scale * 0.2;  //adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.5; //adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2- 40; //Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 23; //Adjust Y position if needed
    
        this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
    }

    loadAnimation() {
        for (var i = 0; i < 8; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }
        //Had to make some adjustments with where to start on spritesheet to make it look correct.

        //LOOKNG RIGHT
        //idle/walking, looking to the right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/idle.png"), 0, 0, 100, 100, 4, 0.1, false, true);

        //attack1 (upwards)
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/attacking.png"), 0, 0, 100, 100, 6, 0.1, false, true);

        //attack2 (downwards)
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/attacking.png"), 0, 100, 100, 100, 6, 0.1, false, true);

        //Charge/Preperation
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/skill.png"), 500, 0, 100, 100, 5, 0.05, false, true);

        //Casting Projectiles
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting.png"), 0, 0, 100, 100, 5, 0.1, false, true);

        //Casting Summons
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting.png"), 0, 0, 100, 100, 5, 0.1, false, true);

        //Casting Ranged AOE
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting.png"), 0, 0, 100, 100, 5, 0.1, false, true);

        //Damaged/getting hurt
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/death.png"), 0, 0, 100, 100, 1, 0.1, false, true);



        //LOOKING LEFT
        //idle/walking, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/idle-flipped.png"), 100, 0, 100, 100, 4, 0.1, true, true);

        //attack1 (upwards)
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/attacking-flipped.png"), 0, 0, 100, 100, 6, 0.1, true, true);

        //attack2 (downwards)
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/attacking-flipped.png"), 0, 100, 100, 100, 6, 0.1, true, true); 

        //Charge/Preperation
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/skill-flipped.png"), 200, 0, 100, 100, 5, 0.05, true, true);

        //Casting Projectiles
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting-flipped.png"), 300, 0, 100, 100, 5, 0.1, true, true);

        //Casting Summons
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting-flipped.png"), 300, 0, 100, 100, 5, 0.1, true, true);

        //Casting Ranged AOE
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/casting-flipped.png"), 300, 0, 100, 100, 5, 0.1, true, true);

        //Damaged/getting hurt
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/death-flipped.png"), 1900, 0, 100, 100, 1, 0.1, false, true);


        //death animation
        this.deadAnimation =  new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/death.png"), 0, 0, 100, 100, 18, 0.1, false, false);
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
                    this.state = 3; // Return to charge preparation state
                } else if (this.isCharging) {
                    this.state = 3; // Return to charging state
                } else {
                    // If we weren't in a special state, return to the stored previous state
                    // or default to idle state
                    this.state = 0; //this.state = this.previousState || 0;
                }
            }
        }

        // Handle death state
        if (this.dead) {
            this.deathAnimationTimer -= this.game.clockTick;
            if (this.deathAnimationTimer <= 0) {
                this.deathOnce = true;
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
        
        //Summoning:
        if (this.state == 5) {
            this.orderAnimationTimer += this.game.clockTick;
            if (this.summonOnce) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 summon.wav");
                this.summonOnce = false;
            }
            if (this.orderAnimationTimer >= this.orderAnimationDuration) { //at the end of the animation
                this.state = 0;
                this.summonOnce = true;
                this.waveCooldownTimer = this.waveCooldown; //reset cooldown timer
                this.spawningWave()
            }
            return;
        }


        const player = this.game.adventurer;

        // // Calculate distance to player
        const dx =  (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2); 
        const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // // Charge timer and mechanism
        this.chargeTimer = (this.chargeTimer || 0) + this.game.clockTick;

        if (distance > 2  && !this.isPreparingCharge && !this.isCharging && !this.attacking) {
            const newFacing = dx < 0 ? 1 : 0;
            if (this.facing !== newFacing && this.projectileTimer > 0) {
                //Store current throw animation time before switching
                this.projectileAnimationElapsedTime = this.animations[4][this.facing].elapsedTime;
                //Update facing
                this.facing = newFacing;
                // Set the new direction's animation to the same time
                this.animations[4][this.facing].elapsedTime = this.projectileAnimationElapsedTime;
            } else {
                this.facing = newFacing;
            }
            this.lockedFacing = null;
        }

        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }

        if (this.projectileTimer > 0) {
            this.projectileTimer -= this.game.clockTick;
            this.state = 4; // Keep in throw state while timer is active
            // Update the stored elapsed time
            this.projectileAnimationElapsedTime = this.animations[4][this.facing].elapsedTime;
            // Check if we're at the end of the throw animation
            if (this.projectileTimer <= 0.55 && this.shouldShoot && !this.isPreparingCharge && !this.isCharging) {
                this.shootProjectile(); 
                this.shouldShoot = false; //Reset the flag
            }
            
            // Don't reset animation state if we're in the middle of a double nova cast
            if (this.projectileTimer <= 0 && this.animations[4][this.facing].elapsedTime >= this.animations[4][this.facing].totalTime) {
                // Animation has completed fully
                this.animations[4][0].elapsedTime = 0;
                this.animations[4][1].elapsedTime = 0;
                this.projectileAnimationElapsedTime = 0;
                this.state = 0; // Return to walking state
            } else if (this.projectileTimer <= 0) {
                this.animations[4][0].elapsedTime = 0;
                this.animations[4][1].elapsedTime = 0;
                this.projectileAnimationElapsedTime = 0;
                this.state = 0; // Return to walking state
            }
            
            this.updateBB();
            return;
        }


        // Only decide on a new action when both timers are ready
        if (this.chargeTimer >= this.chargeCooldown && this.shootTimer <= 0 && !this.isCharging && !this.isPreparingCharge && !this.isPreparingAOE && !this.isAboutToAOE && !this.attacking) {
            // Randomly choose between charging and shooting
            const randomChoice = Math.random();
            
            // You can adjust this threshold to control how often each action occurs
            // 40/60 chance between charging and shooting
            const chargeThreshold = 0.4; 
            if (distance >= 580) {
                if (!this.isPreparingCharge) {
                    this.isPreparingCharge = true;
                    this.chargePrepTimer = this.chargePrepTime;
                    this.state = 3; // Preparation state (same as charge state visually)
                    this.chargeTimer = 0;
                }
            } else if (randomChoice < chargeThreshold) {
                if (!this.isPreparingCharge) {
                    this.isPreparingCharge = true;
                    this.chargePrepTimer = this.chargePrepTime;
                    this.state = 3; // Preparation state (same as charge state visually)
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
            if (this.once) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 charging.wav");
                this.once = false;
            }
            if (this.chargePrepTimer <= 0) {
                // Initiate actual charge
                this.isPreparingCharge = false;
                this.isCharging = true;
                this.once = true;
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
            if(this.dashingOnce) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 attack.wav");
                this.dashingOnce = false;
            }

            // Check if charge duration exceeded limit
            if (this.currentChargeDuration >= this.maxChargeDuration) {
                this.isCharging = false;
                this.dashingOnce = true;
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
            const centerX = (this.BB.x + this.BB.width/2); 
            const centerY = (this.BB.y + this.BB.height/2);
    
            if (currentDistanceToTarget <= 45) {
                this.isCharging = false;
                this.state = 0;
                this.currentChargeDuration = 0;  // Reset the duration timer
                this.attackCooldownTimer = 0; //set to 0 so it could still take damage
                this.game.addEntity(new CircleAOE(this.game, centerX, centerY, "./Sprites/Magic/spark.png", 
                    null, 18, 25, 0, this, false, 
                    0, 0, 32, 32, 7, 0.1, false, false));
                //this.shootTimer = this.shootCooldown;
            }
        }
        
        else if (!this.isPreparingCharge) {
            //Normal movement when not charging or preparing
            const movement = this.speed * this.game.clockTick;
            this.x += (dx / distance) * movement;
            this.y += (dy / distance) * movement;
            // this.state = 0;
        }

        if (this.aoeTimer > 0) {
            this.aoeTimer -= this.game.clockTick;
        }

        //if they're within range and they can shoot (not on cooldown), prepare AOE
        if (distance <= this.range && this.aoeTimer <= 0 && !this.isPreparingCharge && !this.isCharging && this.currentHealth <= (this.maxHealth * 0.5)) {
             //Within range, prepare AOE
            if (!this.isPreparingAOE) {
                this.isPreparingAOE = true;
                this.aoeWarningTimer = this.aoeWarningDuration;
                this.aoeAttackDelay = this.aoeAttackDelayDuration; //reset the red part of the attack delay back to its original
                this.state = 6; // Casting state
                this.aoeTimer = this.aoeCooldown; //Reset to 10 seconds. This is for logic cooldown
                this.castTimer = this.castDuration;
            } 
        }

        if (this.castTimer > 0) {
            this.castTimer -= this.game.clockTick;
            this.state = 6; // Keep in casting state while timer is active\
        } else {
            this.animations[6][0].elapsedTime = 0;
            this.animations[6][1].elapsedTime = 0;
    
           // this.state = 0; // Return to running state when cast is done
        }

        // Handle AOE Warning
        if (this.isPreparingAOE && !this.isAboutToAOE) {
            this.aoeWarningTimer -= this.game.clockTick;
            this.aoeTargetX = (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
            this.aoeTargetY = (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
 
            if (this.aoeWarningTimer <= this.aoeWarningDuration/ 2) {
                this.isAboutToAOE = true;
                this.isPreparingAOE = false;
            }
        } else if (this.isAboutToAOE && !this.isPreparingAOE) {
            this.aoeAttackDelay -= this.game.clockTick;
            if (this.aoeAttackDelay <= 0) {
                // this.game.addEntity(new CircleAOE(this.game, this.aoeTargetX, this.aoeTargetY , "./Sprites/Magic/magic.png", 
                //     null, 17, 10, 0, null, false, 
                //     0, 0, 64, 64, 7, 0.07, false, false));
                this.game.addEntity(new CircleAOE(this.game, this.aoeTargetX, this.aoeTargetY, "./Sprites/Magic/spark-black.png", 
                    null, 33.6, 25, 0, this, false, 
                    0, 0, 32, 32, 7, 0.1, false, false));
                this.isPreparingAOE = false;
                this.isAboutToAOE = false;
                this.shootTimer += 0.8;
                this.chargeTimer = 0.8;
            }
        }
        console.log(this.attacking);
        if (this.attackTimer > 0) {
            this.attackTimer -= this.game.clockTick;
        }

        if (this.attackTimer <= 0 && !this.isPlayingDamageAnimation && !this.isCharging && !this.isPreparingCharge) { 
            if ((this.BB.collide(player.BB) || dy > 5) && distance < 200) {
                //Player is touching/inside boss - do attack2
                this.attack2();
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 attack.wav");
            } else if (dy < 5 && distance < 310) { 
                //player is above AND more horizontal than vertical - do attack1. dy < 0 checks if player is above minotaur
                this.attack1();
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 attack.wav");
            }
        }

        // Update attack state if attacking
        if (this.attacking) {
            this.currentAttackTimer -= this.game.clockTick;
            if (this.currentAttackTimer <= 0) {
                this.attacking = false;
                this.state = 0; // Return to walking
                this.lockedFacing = null; // Release the facing lock
                this.shootTimer += 1; // Reset cooldown
            }
        }



        if (this.waveCooldownTimer > 0) {
            this.waveCooldownTimer -= this.game.clockTick;
        }

        if (this.waveCooldownTimer <= 0 && this.waves > 0 && !this.isPlayingDamageAnimation && !this.isPreparingCharge && !this.isCharging && !this.isPreparingAOE && !this.isAboutToAOE && !this.attacking && this.currentHealth <= (this.maxHealth * 0.6)) { //&& this.goblinsAlive == 0
            this.waves--;
            this.initiateCommandWave();
        }

        
        //collision
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof Adventurer) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        if (this.isCharging) {
                            entity.takeDamage(this.chargingDamage);
                        } 
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                    }
                }
            }
        }
 
           // Reduce attack cooldown timer
           //this is used for every HellSpawn attack. Makes 
           //sure a HellSpawn hits player once every second instead of every tick.
           if (this.attackCooldownTimer > 0) { 
                this.attackCooldownTimer -= this.game.clockTick;
            }
        if (this.idleSoundTimer > 0) {
            this.idleSoundTimer -= this.game.clockTick;
        }
        //Occasionally have idle sound effect
        if (this.idleSoundTimer <= 0  && !this.attacking && !this.isCharging && !this.isPreparingCharge && 
            !this.isPreparingAOE && !this.isPlayingDamageAnimation && !this.dead && this.orderAnimationTimer < this.orderAnimationDuration) {
            let randomChance = Math.random();
            if (randomChance > 0.25) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 idle.wav");
                console.log("idle sound played")
                
            }
            this.idleSoundTimer = 3; 
        }
        // Update bounding box
        this.updateBB();
    }

    initiateCommandWave() {
        if (this.state === 0) {
            this.state = 5;
            this.orderAnimationTimer = 0; 
            this.animations[5][this.facing].elapsedTime = 0; //reset animation
        }
    }

    
    spawningWave() {
        const centerX = (this.BB.x + this.BB.width/2);
        const centerY = (this.BB.y + this.BB.height/2);
          // Spawn 10 summons around the boss
        for (let i = 0; i < 10; i++) {
            // Random angle around the boss (0 to 2π)
            const angle = Math.random() * Math.PI * 2;
            
            // Random distance from center (between 100 and 500 pixels)
            const distance = 100 + Math.random() * 400;
            
            // Calculate spawn position using polar coordinates
            const spawnX = centerX + Math.cos(angle) * distance;
            const spawnY = centerY + Math.sin(angle) * distance;
            
            // Create the summon at the calculated position
            this.game.addEntity(new Summon(this.game, spawnX, spawnY));
        }
    }
    

    // Basic single projectile (available from the start)
    fireBasicProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        const player = this.game.adventurer;
        const dx = (player.BB.x + player.BB.width/2) - characterCenterX;
        const dy = (player.BB.y + player.BB.height/2) - characterCenterY;
        const angle = Math.atan2(dy, dx);
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 ranged attack.wav");
        this.game.addEntity(new Projectile(
            this.game, 
            characterCenterX, 
            characterCenterY, 
            angle, 
            this.projectileDamage, 
            850, 
            "./Sprites/Magic/BlackProjectile.png", 
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
        
        // Spread angle in radians
        const spread = 0.2; 
        
        // Create 3 projectiles with a spread
        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + (i * spread);
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 ranged attack.wav");
            this.game.addEntity(new Projectile(
                this.game, 
                characterCenterX, 
                characterCenterY, 
                angle, 
                Math.round(this.projectileDamage * 0.8), // Slightly reduced damage per projectile
                400, 
                "./Sprites/Magic/PurpleProjectile.png", 
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

    //Fire Spiral Projectiles (unlocks at 50% health)
    fireSpiralProjectiles() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        
        // Number of projectiles in the spiral
        const projectileCount = 36;
        
        // How many complete rotations to make
        const rotations = 2;
        
        // Starting radius for the spiral
        let radius = 20;
        
        // Radius growth per projectile
        const radiusIncrease = 5;
        
        // Create spiral effect by placing projectiles in a growing circle
        for (let i = 0; i < projectileCount; i++) {
            // Calculate angle for this projectile
            const angle = (i / projectileCount) * Math.PI * 2 * rotations;
            
            // Calculate position on the spiral
            const posX = characterCenterX + Math.cos(angle) * radius;
            const posY = characterCenterY + Math.sin(angle) * radius;
            
            // Direction is tangential to the spiral
            const projectileAngle = angle + Math.PI/2;
            
            // Increase radius for next projectile
            radius += radiusIncrease;
            
            // Random delay for staggered effect
            const delay = i * 50; // 50ms between each projectile
            
            setTimeout(() => {
                if (!this.dead && !this.removeFromWorld) {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 ranged attack.wav");
                    this.game.addEntity(new Projectile(
                        this.game,
                        posX,
                        posY,
                        projectileAngle,
                        Math.round(this.projectileDamage * 0.6),
                        this.projectileSpeed * 0.8,
                        "./Sprites/Magic/BlackProjectile.png",
                        this.projectileKnockback,
                        false,
                        this.projectileScale * 1.2,
                        false,
                        5, 0, 0, 16, 16, 30, 0.1,
                        false, true, -16, -23, 40, 40,
                        16, 16, this
                    ));
                }
            }, delay);
        }
    }

    // Nova blast (unlocks at 40% health)
    fireNovaProjectile() {
        const characterCenterX = (this.BB.x + this.BB.width/2);
        const characterCenterY = (this.BB.y + this.BB.height/2);
        
        // Fire first wave of projectiles in a complete circle
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 ranged attack.wav");
            this.game.addEntity(new Projectile(
                this.game, 
                characterCenterX, 
                characterCenterY, 
                angle, 
                this.projectileDamage, //Reduced damage per projectile
                this.projectileSpeed * 0.6, 
                "./Sprites/Magic/BlackProjectile.png", 
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
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy magic attack.wav");
                this.projectileTimer = this.projectileDuration;
                this.shouldShoot = false; // Prevent normal shoot logic from firing again
                this.state = 4; // Set back to throw/attack state
                
                // Reset animation to start frame
                this.animations[4][this.facing].elapsedTime = 0;
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
                        "./Sprites/Magic/PurpleProjectile.png", 
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

    
    attack1() {
        this.attacking = true;
        this.state = 1; // Attack1 animation state
        this.currentAttackTimer = this.attack1Duration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; // Lock the facing direction
    
        // Reset attack animation
        this.animations[1][this.facing].elapsedTime = 0;
        
        // Store a reference to the player for damage calculation
        const player = this.game.adventurer;
        
        // Schedule damage to occur at the end of the animation
        setTimeout(() => {
            if (this.dead || this.removeFromWorld) return;
            
            // Only apply damage if we're still in attack1 state
            if (this.state === 1 && player && !player.dead) {
                const dx = (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2);
                const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.attackRange) {
                    // Calculate the center position of the boss for the knockback source
                    const centerX = this.BB.x + this.BB.width/2;
                    const centerY = this.BB.y + this.BB.height/2;
    
                    player.takeDamageKnockback(this.attackPower, this.knockback, centerX, centerY);
                }
            }
        }, this.attack1Duration * 1000 * 0.5); // Apply damage at 50% through the animation
    }

    attack2() {
        this.attacking = true;
        this.state = 2; // Attack2 animation state
        this.currentAttackTimer = this.attack2Duration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; // Lock the facing direction
    
        // Reset attack animation
        this.animations[2][this.facing].elapsedTime = 0;
    
        // Store a reference to the player for damage calculation
        const player = this.game.adventurer;
        
        // Schedule damage to occur at the end of the animation
        setTimeout(() => {
            if (this.dead || this.removeFromWorld) return;
            
            // Only apply damage if we're still in attack2 state
            if (this.state === 2 && player && !player.dead) {
                const dx = (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2);
                const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const verticalDistance = Math.abs(dy);
                
                // Deal damage if either within close range or if player is below and within vertical close range
                if (distance <= this.closeRange || 
                    (dy > 0 && verticalDistance <= this.verticalCloseRange && distance <= 330)) {
                    const minotaurCenterX = this.BB.x + this.BB.width/2 - 15;
                    const centerY = this.BB.y + this.BB.height/2 - 10;
                    
                    // Apply more damage and knockback for this attack
                    player.takeDamageKnockback(this.attackPower, this.knockback * 2, minotaurCenterX, centerY);
                }
            }
        }, this.attack2Duration * 1000 * 0.5); // Apply damage at 50% through the animation
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
            this.game.addEntity(new CoinPile(this.game, (this.x + 28), (this.y + 55)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2)));
            // this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new BossExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.camera.bossDead = true;

            // Add portal after 5 seconds (5000 milliseconds)
            setTimeout(() => {
                // Check if the game still exists before adding the entity
                if (this.game && this.game.addEntity) {
                    this.game.addEntity(new PortalDoor(this.game, (this.BB.x + this.BB.width/2), (this.BB.y + this.BB.height/2)));
                }
            }, 5000);
    

            this.dead = true;
            this.state = 7;
        } else {
            this.previousState = this.state;
            this.state = 7;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[7][0].elapsedTime = 0;
            } else {
                this.animations[7][1].elapsedTime = 0;
            }
        }
    }


    draw(ctx) {
       // Calculate shadow dimensions based on zombie scale
       const shadowWidth = 80 * (this.scale / 2.8); // 2.6 is your default scale
       const shadowHeight = 32 * (this.scale / 2.8);

       // Adjust shadow position to stay centered under the zombie
       const shadowX = (this.x + (78 * (this.scale / 2.8))) - this.game.camera.x;
       const shadowY = (this.y + (230 * (this.scale / 2.8))) - this.game.camera.y;

       ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        // Calculate drawing x position with 125px offset when facing right
        const drawX = this.x - (this.facing === 1 ? 85 : 0) - this.game.camera.x;
        const drawY = this.y - this.game.camera.y;

        if (this.dead) {
            if (this.deathOnce) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss4 death.wav");
                this.deathOnce = false;
            }
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, drawX, drawY, this.scale);

           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[7][this.facing].drawFrame(this.game.clockTick, ctx, drawX, drawY, this.scale);
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

         // Draw AOE Warning Circle
         const xDraw = this.aoeTargetX - this.game.camera.x;
         const yDraw = this.aoeTargetY - this.game.camera.y;
     
         ctx.save();
         ctx.beginPath();
         ctx.arc(xDraw, yDraw, this.aoeScale, 0, Math.PI * 2);
     
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