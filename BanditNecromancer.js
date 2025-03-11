class BanditNecromancer {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.bitSize = 32;
        this.bitSizeX = 32;
        this.bitSizeY = 32;
        this.state = 0; //0 = idle, 1 = running, 2 = Casting, 3 = damage
        this.facing = 0; //0 = right, 1 = left
        this.scale = 2.8;
        this.speed = 150;
        
        this.range = 400; //Shooting range (range until our necromancer starts shooting at player)
        this.shootCooldown = 3; //Shoot every 3 seconds
        this.shootTimer = 0; //should be 0
        this.castSpeed = 800;
        this.castDuration = 8 * 0.1; //How long the cast animation plays
        this.castTimer = 0; //Timer for the cast animation
        this.damage = 20;
        this.collisionDamage = 2;
        
        this.health = 20; //Necromancer health 
        this.maxHealth = 20;
        this.didCrit = false;
        this.dead = false;
        this.deathAnimationTimer = 7 * 0.2; //8 frames * 0.2 duration. Should be frameCount * frameDuration for death animation
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, 0, 7));
    
        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9;

        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.isSlowed = false;
        this.slowDuration = 0;
        this.slowTimer = 0;
        this.baseSpeed = this.speed;

        this.miniBoss = false;

        this.entityOrder = 20;


        this.animations = [];

        this.updateBB();
        this.loadAnimations();

    }


    loadAnimations() {
        for (var i = 0; i < 4; i++) { //4 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //2 faces
                this.animations[i].push([]);
            }
        }
        //RIGHT
        //idle
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer.png"), 0, 0, 32, 32, 8, 0.2, false, true);

        //walking
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer.png"), 0, 32, 32, 32, 8, 0.1, false, true);

        //casting
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer.png"), 0, 96, 32, 32, 8, 0.1, false, true);

        //damaged
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer.png"), 32, 128, 32, 32, 3, 0.2, false, true);

        //LEFT
        //idle
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer-Flipped.png"), 0, 0, 32, 32, 8, 0.2, true, true);

        //running
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer-Flipped.png"), 0, 32, 32, 32, 8, 0.1, true, true);

        //casting
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer-Flipped.png"), 0, 96, 32, 32, 8, 0.1, true, true);

        //damaged
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer-Flipped.png"), 128, 128, 32, 32, 3, 0.2, true, true);
    
        this.warning = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/warning.png"), 0, 0, 1024, 1024, 7.9, 0.1, false, true); //used for mini bosses

        //death animation
        this.death = new Animator(ASSET_MANAGER.getAsset("./Sprites/Necromancer/BanditNecromancer.png"), 32, 160, 32, 32, 7, 0.2, false, false);
    }


    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.7; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 10; // Adjust Y position if needed
    
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
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // Update facing direction
        if (distance > 2) {
            this.facing = dx < 0 ? 1 : 0;
        }
    
        // Handle shooting cooldown
        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }
    
        // Handle cast animation timer
        if (this.castTimer > 0) {
            this.castTimer -= this.game.clockTick;
            this.state = 2; // Keep in casting state while timer is active\
            this.updateBB();
            return; //when the necromancer starts casting, it'll stop moving
        } else {
            this.animations[2][0].elapsedTime = 0;
            this.animations[2][1].elapsedTime = 0;

            this.state = 1; // Return to running state when cast is done
        }
    
        //Check if we're in range and can shoot. The shootTimer is the shootcooldown. 
        if (distance <= this.range && this.shootTimer <= 0) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy magic attack.wav");
            // Calculate angle to player
            const angle = Math.atan2(dy, dx);
            
            //Start casting animation
            this.castTimer = this.castDuration; //ANIMATION
            
            //center of the character sprite and where the projectile will come out of
            const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
            const characterCenterY = this.y + (this.bitSize * this.scale) / 2;

            //create the projectile
            this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.damage, this.castSpeed, 
                "./Sprites/Magic/PurpleProjectile.png", 0, false, 3, false, 2,
                0, 0, 16, 16, 30, 0.1, false, true, -16, -23, 32, 32, 16, 16, this));

            
            this.shootTimer = this.shootCooldown; //Reset to 3 seconds. This is for logic cooldown
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
            if ((entity instanceof Zombie || entity instanceof BanditNecromancer) && entity !== this) {
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
                        console.log("Necromancer attacked the player!");
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
            // Default knockback direction (e.g., upward) in case the mob and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            let drop = Math.random();
            if(drop < this.game.adventurer.dropChance) {
                this.game.addEntity(new Threecoin(this.game, (this.x + 28), (this.y + 55)));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + 28), (this.y + 55)));
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
        const shadowWidth = 40 * (this.scale / 2.8); 
        const shadowHeight = 16 * (this.scale / 2.8);

        const shadowX = (this.x + (23 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (78 * (this.scale / 2.8))) - this.game.camera.y;

        if (this.miniBoss) {
            this.warning.drawFrame(this.game.clockTick, ctx, shadowX + 3, shadowY - (33 * this.scale), 0.05);
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