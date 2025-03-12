class Summon {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/portal.png");
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.animations = [];

        // Start with emerge animation (state 1)
        this.state = 1; 

        this.scale = 4.5;

        this.bitSizeX = 50;
        this.bitSizeY = 50;
        
        // Flag to track if emerge animation is complete
        this.emergeComplete = false;
        this.invincible = true;
        
        // Track animation timer
        this.animationTimer = 0;

        this.health = 64;
        this.maxHealth = 64;
        this.attackPower = 12;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.dead = false;
        this.deathAnimationTimer = 6 * 0.1;

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.attackTimer = 1;

        this.speed = 180;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, -3, -40))

        
        this.updateBB();
        this.loadAnimations();
    } 

    updateBB() {
        const width = this.bitSizeX * this.scale * 0.2;  // 40% of sprite width
        const height = this.bitSizeY * this.scale * 0.2; // 50% of sprite height
        const offsetX = (this.bitSizeX * this.scale - width) / 2 - 5;
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 40;
    
        this.BB = new BoundingBox(
            this.x + offsetX,
            this.y + offsetY,
            width,
            height
        );
    }

    loadAnimations() {
        //idle/walking
        this.animations[0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/summonIdle.png"), 0, 0, 50, 50, 4, 0.1, false, true);

        //emerge
        this.animations[1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/summonEmerge.png"), 0, 0, 50, 50, 6, 0.12, false, true);

        //damaged
        this.animations[2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/summonDeath.png"), 0, 0, 50, 50, 1, 0.1, false, true);

        //death
        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/Executioner/summonDeath.png"), 0, 0, 50, 50, 6, 0.1, false, false);
    }

    update() {
        // If currently in emerge state
        if (this.state === 1) {
            // Add to the animation timer
            this.animationTimer += this.game.clockTick;
            
            // Check if emerge animation is complete (6 frames * 0.1 seconds per frame)
            if (this.animationTimer >= 6 * 0.12) {
                // Switch to idle state
                this.state = 0;
                // Reset animation timer
                this.animationTimer = 0;
                // Mark emerge as complete
                this.emergeComplete = true;
                this.invincible = false;
                this.updateBB();
            }
        }

        if (this.attackCooldownTimer > 0) { //this is used for every enemy attack. Makes sure a enemy hits player once every second instead of every tick.
            this.attackCooldownTimer -= this.game.clockTick;
        }

        // Only check for player collision when portal is fully emerged
        if (this.emergeComplete) {
            if (this.isPlayingDamageAnimation) {
                this.damageAnimationTimer -= this.game.clockTick;
                if (this.damageAnimationTimer <= 0) {
                    this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                    this.state = 0; // Return to idle state
                }
            }
    
            if (this.dead) {
                // Handle death animation
                this.deathAnimationTimer -= this.game.clockTick;
        
                if (this.deathAnimationTimer > 0) {
                    // Keep playing the death animation
                    return; //return so the zombie would stop moving when it's dead.
                } else {
                    // Remove zombie from world after the animation finishes
                    this.removeFromWorld = true;
                    return;
                }
            }

            if (!this.dead) {
                // Apply knockback effect
    
                this.x += this.pushbackVector.x * this.game.clockTick;
                this.y += this.pushbackVector.y * this.game.clockTick;
    
                // Decay the pushback vector
                this.pushbackVector.x *= this.pushbackDecay;
                this.pushbackVector.y *= this.pushbackDecay;
    
            }
            // Get player entity
            const player = this.game.adventurer;
            const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
            const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 2) {
                this.state = 0; //Walking/idle.
            } 
            const movement = this.speed * this.game.clockTick;
            this.x += (dx / distance) * movement;
            this.y += (dy / distance) * movement;
            this.state = 0;

            if (player && this.BB.collide(player.BB)) {
                if (this.attackCooldownTimer <= 0) {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee punch.wav");
                    player.takeDamage(this.attackPower);
                    this.attackCooldownTimer = this.attackCooldown;
                }
            } 

            const separationDistance = 100; // Minimum distance between zombies
            const entities = this.game.entities;
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                if ((entity instanceof Summon || entity instanceof Boss4) && entity !== this) {
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
            // Default knockback direction (e.g., upward) in case the zombie and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            let drop = Math.random();
            if(drop < this.game.adventurer.dropChance) {
                this.game.addEntity(new Onecoin(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            }
            this.dead = true;
            this.state = 2;
        } else {
            this.state = 2;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            this.animations[2].elapsedTime = 0;
        }
    }

    draw(ctx) {
        // const shadowWidth = 27 * (this.scale / 2.6); // 2.6 is default scale
        // const shadowHeight = 16 * (this.scale / 2.6);

        // const shadowX = (this.x + (48 * (this.scale / 2.6))) - this.game.camera.x;
        // const shadowY = (this.y + (102 * (this.scale / 2.6))) - this.game.camera.y;

        // ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[2].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }

        if (PARAMS.DEBUG) {

            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }
}