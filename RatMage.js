class RatMage {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");

        this.bitSizeX = 32;
        this.bitSizeY = 32;
        this.bitSize = 32;

        this.state = 0; //0 = idle, 1 = running, 2 = Casting, 3 = damage
        this.facing = 0; //0 = right, 1 = left
        this.scale = 2.8;
        this.speed = 70;
    
        this.range = 400; //Shooting range (range until our mage doing AOE attack on player)
        this.shootCooldown = 6; //Shoot every 8 seconds
        this.shootTimer = 0; 
        this.castSpeed = 400;
        this.castDuration = 5.9 * 0.1; 
        this.castTimer = 0;
        this.damage = 33;
        this.collisionDamage = 7;
        
        this.health = 25;
        this.maxHealth = 25;
        this.didCrit = false;
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, 1.5, 7));
        this.dead = false;
        this.deathAnimationTimer = 4 * 0.1;

        //AOE Warning Specific Properties
        this.aoeWarningDuration = 4; //Total warning duration
        this.aoeWarningTimer = 0;
        this.aoeTargetX = (this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeTargetY = (this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2);
        this.aoeAttackDelay = 0; // Delay before actual AOE attack
        this.aoeAttackDelayDuration = 1;
        this.aoeScale = 100; 
        this.circleAOE = 5; //radius

        this.isPreparingAOE = false; 
        this.isAboutToAOE = false;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9;

        this.attackCooldown = 1.0;
        this.attackCooldownTimer = 0;

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 2.9 * 0.2;
        this.isPlayingDamageAnimation = false;

        this.entityOrder = 25;

        this.dropchance = 0.4;

        this.isSlowed = false;
        this.slowDuration = 0;
        this.slowTimer = 0;
        this.baseSpeed = this.speed;

        this.miniBoss = false;

        this.animations = [];

        this.updateBB();
        this.loadAnimations();
    }

    loadAnimations() {
        for (var i = 0; i < 4; i++) { 
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }
        //RIGHT
        //idle
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage.png"), 0, 0, 32, 32, 7.9, 0.2, false, true);

        //walking
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage.png"), 0, 32, 32, 32, 7.9, 0.1, false, true);

        //casting
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage.png"), 0, 96, 32, 32, 5.9, 0.1, false, true);

        //damaged
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage.png"), 32, 128, 32, 32, 2.9, 0.2, false, true);

        //LEFT
        //idle
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage-Flipped.png"), 4, 0, 32, 32, 7.9, 0.2, true, true);

        //running
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage-Flipped.png"), 4, 32, 32, 32, 7.9, 0.1, true, true);

        //casting 
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage-Flipped.png"), 68, 96, 32, 32, 5.9, 0.1, true, true);

        //damaged
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage-Flipped.png"), 132, 128, 32, 32, 2.9, 0.2, true, true);
    
        this.warning = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/warning.png"), 0, 0, 1024, 1024, 7.9, 0.1, false, true); //used for mini bosses

        //death animation
        this.death = new Animator(ASSET_MANAGER.getAsset("./Sprites/Mages/RatMage.png"), 0, 160, 32, 32, 4, 0.1, false, false);
    }

    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.5; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 20; // Adjust Y position if needed
    
        this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
    }

    update() {
         if (this.dead) {
            this.deathAnimationTimer -= this.game.clockTick;
            if (this.deathAnimationTimer <= 0) {
                this.removeFromWorld = true;
            }
            return;
        }
        //Handle damage animation time so it isnt infinite. This is when the player hits the mage
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle state
            }
         }

        if (this.isSlowed) {
            this.slowTimer += this.game.clockTick;
            if (this.slowTimer >= this.slowDuration) {
                // Reset speed when slow duration expires
                this.speed = this.baseSpeed;
                this.isSlowed = false;
                this.slowTimer = 0;
            }
        }

        // Apply knockback effect
        this.x += this.pushbackVector.x * this.game.clockTick;
        this.y += this.pushbackVector.y * this.game.clockTick;
        
        // Decay the pushback vector
        this.pushbackVector.x *= this.pushbackDecay;
        this.pushbackVector.y *= this.pushbackDecay;


         // Get player's position
         const player = this.game.adventurer;
         const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
         const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
         const distance = Math.sqrt(dx * dx + dy * dy);
 
         // Determine facing direction
         if (distance > 2) {
            this.facing = dx < 0 ? 1 : 0;
         }

         if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }

        // Handle cast animation timer
        if (this.castTimer > 0) {
            this.castTimer -= this.game.clockTick;
            this.state = 2; // Keep in casting state while timer is active\
        } else {
            this.animations[2][0].elapsedTime = 0;
            this.animations[2][1].elapsedTime = 0;
    
            this.state = 1; // Return to running state when cast is done
        }
        
        //if they're within range and they can shoot (not on cooldown), prepare AOE
        if (distance <= this.range && this.shootTimer <= 0) {
             //Within range, prepare AOE
            if (!this.isPreparingAOE) {
                this.isPreparingAOE = true;
                this.aoeWarningTimer = this.aoeWarningDuration;
                this.aoeAttackDelay = this.aoeAttackDelayDuration; //reset the red part of the attack delay back to its original
                this.state = 2; // Casting state
                this.shootTimer = this.shootCooldown; //Reset to 5 seconds. This is for logic cooldown
                this.castTimer = this.castDuration;
            }
        }

         const movement = this.speed * this.game.clockTick;
         this.x += (dx / distance) * movement;
         this.y += (dy / distance) * movement;
 
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
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy magic attack.wav");
                this.game.addEntity(new CircleAOE(this.game, this.aoeTargetX, this.aoeTargetY , "./Sprites/Magic/magic.png", 
                    null, 5, this.damage, 0, null, false, 
                    0, 256, 64, 64, 9, 0.07, false, false))
                this.isPreparingAOE = false;
                this.isAboutToAOE = false;
            }
        }

        if (this.attackCooldownTimer > 0) { //this is used for every mob attack. Makes sure a mob hits player once every second instead of every tick.
            this.attackCooldownTimer -= this.game.clockTick;
        }

        //COLLISIONS:
        const separationDistance = 150; // Minimum distance between mobs
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if ((entity instanceof RatMage) && entity !== this) {
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
                    if (this.attackCooldownTimer <= 0) { //used so the necromancer wouldn't damage us every tick
                        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee punch.wav");
                        // Attack the player and reset cooldown timer
                        entity.takeDamage(this.collisionDamage);
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                        console.log("Rat Mage attacked the player!");
                    }
                }
            }

            if (entity instanceof Lightning && entity.lightningOption === 1 && !this.isSlowed) {
                if (entity.circle.BC.collidesWithBox(this.BB)) {
                    this.applySlowEffect(this.game.adventurer.slowCooldown); 
                }
            }
        }

         this.updateBB();
    }


    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        this.health -= damage;
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
            // Default knockback direction
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            let drop = Math.random();
            if(drop < this.game.adventurer.dropChance) {
                this.game.addEntity(new Threecoin(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            }
            if (this.miniBoss) {
                this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2) - 125));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2) + 15, (this.y + (this.bitSizeY * this.scale)/2)));
            }
            this.dead = true;
            this.state = 3;
        } else {
            this.state = 3;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[3][0].elapsedTime = 0;
            } else {
                this.animations[3][1].elapsedTime = 0;
            }
        }
    }

    applySlowEffect(duration) {
        this.isSlowed = true;
        this.slowDuration = duration;
        this.slowTimer = 0;
        this.speed /= 2; // Reduce speed by half
    }

    draw(ctx) {

        const shadowWidth = 32 * (this.scale / 2.8); 
        const shadowHeight = 16 * (this.scale / 2.8);

        const shadowX = (this.x + (27 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (77 * (this.scale / 2.8))) - this.game.camera.y;

        if (this.miniBoss) {
            this.warning.drawFrame(this.game.clockTick, ctx, shadowX, shadowY - (28 * this.scale), 0.05);
        }

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

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
            this.animations[3][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {        
            // Draw mage
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
        //debug
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect((this.x + (this.bitSizeX * this.scale)/2) - this.game.camera.x, (this.y + (this.bitSizeY * this.scale)/2) - this.game.camera.y, 20, 20);
        }
    }
}