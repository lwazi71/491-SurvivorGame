class Cyclops {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.bitSize = 64;
        this.bitSizeX = 64;
        this.bitSizeY = 64;
        this.state = 0; //0 = idle, 1 = running, 2 = attack, 3 = Throwing, 4 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.scale = 4;
        this.speed = 193;
    
        this.range = 400; //Shooting range (range until our cyclops starts throwing at player)
        this.shootCooldown = 8; //Shoot every 8 seconds
        this.shootTimer = 0; //should be 0
        this.throwSpeed = 700;
        this.throwDuration = 12.9 * 0.1; //How long the throw animation plays
        this.throwTimer = 0; //Timer for the throw animation
        this.rockDamage = 30;
        this.collisionDamage = 33;
        this.knockback = 2000;
        
        this.health = 150; //Cyclops health 
        this.maxHealth = 150;
        this.didCrit = false;
      
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, 1, 10));
        this.dead = false;
        this.deathAnimationTimer = 8 * 0.1; 
    
        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9;

        this.attackCooldown = 1.5; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.shouldThrowRock = false; //track if we should shoot after throw

        this.throwAnimationElapsedTime = 0; //used for when cyclops does throwing animation then it faces other way

        this.entityOrder = 40;

        this.projectileCount = 10;

        this.dropchance = 0.4;

        this.animations = [];
        this.death = [];

        this.updateBB();
        this.loadAnimations();

    }


    loadAnimations() {
        for (var i = 0; i < 5; i++) { //4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //2 faces
                this.animations[i].push([]);
            }
        }
        for (var i = 0; i < 2; i++) { //2 death states
            this.death.push([]);
        }
        //RIGHT
        //idle
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 0, 64, 64, 15, 0.2, false, true);

        //walking
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 64, 64, 64, 11.9, 0.1, false, true);

        //attack
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 128, 64, 64, 7, 0.1, false, true);

        //throwing
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 192, 64, 64, 12.9, 0.1, false, true);

        //damaged
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 64, 256, 64, 64, 2, 0.2, false, true);

        //LEFT
        //idle
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 640, 64, 64, 15, 0.2, false, true);

        //running
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 704, 64, 64, 11.9, 0.1, false, true);

        //attack
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 768, 64, 64, 7, 0.1, false, true);

        //throwing
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 0, 832, 64, 64, 12.9, 0.1, false, true);

        //damaged
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 64, 896, 64, 64, 2, 0.2, false, true);

        this.warning = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/warning.png"), 0, 0, 1024, 1024, 7.9, 0.1, false, true); //used for mini bosses
    
        //death animation
        this.death[0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 64, 384, 64, 64, 8, 0.1, false, false);
        this.death[1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Cyclops/Cyclops.png"), 64, 1024, 64, 64, 8, 0.1, false, false);
    }


    updateBB() {
        const width = this.bitSizeX * this.scale * 0.3;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.55; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 50; // Adjust Y position if needed
    
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
        //Handle damage animation time so it isnt infinite. This is when the player hits the necromancer
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 1; //return to walking state
            }
         }

        // Reduce attack cooldown timer
        if (this.attackCooldownTimer > 0) { //this is used for every mob attack. Makes sure a mob hits player once every second instead of every tick.
            this.attackCooldownTimer -= this.game.clockTick;
        }
    
        // Apply knockback effect
        this.x += this.pushbackVector.x * this.game.clockTick;
        this.y += this.pushbackVector.y * this.game.clockTick;
        
        // Decay the pushback vector
        this.pushbackVector.x *= this.pushbackDecay;
        this.pushbackVector.y *= this.pushbackDecay;
    
        const player = this.game.adventurer;
        
        // Calculate distance to player
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2 + 40);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // Update facing direction and sync animation if throwing
        if (distance > 2) {
            const newFacing = dx < 0 ? 1 : 0;
            if (this.facing !== newFacing && this.throwTimer > 0) {
                //Store current throw animation time before switching
                this.throwAnimationElapsedTime = this.animations[3][this.facing].elapsedTime;
                //Update facing
                this.facing = newFacing;
                // Set the new direction's animation to the same time
                this.animations[3][this.facing].elapsedTime = this.throwAnimationElapsedTime;
            } else {
                this.facing = newFacing;
            }
        }
    
        // Handle shooting cooldown
        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }
    
        // Handle throw animation timer
        if (this.throwTimer > 0) {
            this.throwTimer -= this.game.clockTick;
            this.state = 3; // Keep in throw state while timer is active
            // Update the stored elapsed time
            this.throwAnimationElapsedTime = this.animations[3][this.facing].elapsedTime;
            // Check if we're at the end of the throw animation
            if (this.throwTimer <= 0.25 && this.shouldThrowRock && !this.isAttacking) {
                this.shootRock(); 
                this.shouldThrowRock = false; // Reset the flag
            }
            this.updateBB();
            return;
        } else {
            // Reset throw animation times when complete
            this.animations[3][0].elapsedTime = 0;
            this.animations[3][1].elapsedTime = 0;
            this.throwAnimationElapsedTime = 0;
            this.state = 1; // Return to running state when throw is done
        }


        if (distance <= this.range && this.shootTimer <= 0 && distance > 70) {
            //Start throwing animation and set flag to shoot after
            this.throwTimer = this.throwDuration;
            this.shouldThrowRock = true; // Set flag to shoot when animation ends
            this.shootTimer = this.shootCooldown; // Reset cooldown
        }
    
        // Always move towards player
        const moveSpeed = this.speed * this.game.clockTick;
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        this.x += directionX * moveSpeed;
        this.y += directionY * moveSpeed;

        //COLLISIONS:
        const separationDistance = 200; // Minimum distance between mobs
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if ((entity instanceof Cyclops) && entity !== this) {
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
                        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee bite.wav");
                        // Attack the player and reset cooldown timer
                        const centerX = this.BB.x + this.BB.width/2;
                        const centerY = this.BB.y + this.BB.height/2;
                        entity.takeDamageKnockback(this.collisionDamage, this.knockback, centerX, centerY);
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                        console.log("Cyclops attacked the player!");
                    }
                    this.state = 2; //Attacking state
                }
            }
        }

        if (this.state === 2) {
            this.attackTimer -= this.game.clockTick;
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.0; //Reset attack timer
            }
        }
    
        this.updateBB();
    }


    shootRock() {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Rock Throw.wav");
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2);
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);

        const angle = Math.atan2(dy, dx);

        this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.rockDamage, this.throwSpeed, 
            "./Sprites/Projectiles/rock.png", 0, false, 3, false, 2,
            0, 0, 16, 16, 1, 1, false, true, -16, -23, 32, 32, 16, 16));
    }


    
    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        this.health -= damage;
        if (this.dead) {
            return;
        }

        if (this.throwTimer > 0) {
            this.shouldThrowRock = false;
            this.throwTimer = 0;
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
    
        if (this.health <= 0) {
            this.game.addEntity(new MultipleCoins(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2) - 100));

            this.dead = true;
            this.state = 4;
        } else {
            this.state = 4;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[4][0].elapsedTime = 0;
            } else {
                this.animations[4][1].elapsedTime = 0;
            }
        }
    }


    draw(ctx) {
        const shadowWidth = 53 * (this.scale / 2.8); 
        const shadowHeight = 16 * (this.scale / 2.8);

        const shadowX = (this.x + (64 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (170 * (this.scale / 2.8))) - this.game.camera.y;

        this.warning.drawFrame(this.game.clockTick, ctx, shadowX + 8, shadowY - (47 * this.scale), 0.05);

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        if (this.dead) {
            if (this.deathAnimationTimer > 0) {
                this.death[this.facing].drawFrame(
                    this.game.clockTick, 
                    ctx, 
                    this.x - this.game.camera.x, 
                    this.y - this.game.camera.y, 
                    this.scale
                );
            }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[4][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            // Draw necromancer
            this.animations[this.state][this.facing].drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x - this.game.camera.x, 
                this.y - this.game.camera.y, 
                this.scale
            );
        }

        //  ctx.strokeStyle = 'Green';

        // ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, 20, 20);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }
}