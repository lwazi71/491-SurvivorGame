class FreakyGhoul {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle, 1 = walking, 2 = attack, 3 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.attackPower = 5;
        this.scale = 2.8;
        this.speed = 180;

        this.health = 20;
        this.maxHealth = 20;
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, 0, 7));
        this.attackPower = 10;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;


        this.dead = false;
        this.deathAnimationTimer = 5 * 0.15;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays


        this.dropchance = 0.4; //40% chance of dropping something when dying

        this.entityOrder = 10;

        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 
        this.bitSizeX = 32;
        this.bitSizeY = 32;

        this.isSlowed = false;
        this.slowDuration = 0;
        this.slowTimer = 0;
        this.baseSpeed = this.speed;


        this.animations = []; //will be used to store animations

        this.updateBB();
        this.loadAnimation();
    }
    


    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.7; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 10; // Adjust Y position if needed
    
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
        //idle, looking to the rights
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul.png"), 0, 0, 32, 32, 4, 0.2, false, false);

        //Walking, looking right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul.png"), 0, 32, 32, 32, 7.9, 0.09, false, false);

        //Attack, to the right
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul.png"), 0, 64, 32, 32, 5, 0.08, false, false);

        //Damaged, to the right
        //wanna start at where the blue ghoul turns red or else there'll be a delay
        this.animations[3][0] =  new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul.png"), 32, 96, 32, 32, 3, 0.2, false, false); 

        

        //LOOKING LEFT
        //idle, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png"), 125, 0, 32, 32, 3.9, 0.2, true, false);

        //Walking, looking left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png"), 5, 32, 32, 32, 7.9, 0.09, true, false);

        //Attack, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png"), 64, 64, 32, 32, 5, 0.08, true, false);

        //Damaged, to the left
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png"), 128, 96, 32, 32, 3, 0.2, true, false);


        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/FreakyGhoul/FreakyGhoul.png"), 32, 128, 32, 32, 5, 0.15, false, false);
    }



    update() {
        //Handle damage animation time so it isnt infinite. This is when the player hits the ghoul
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
                return; //return so the ghoul would stop moving when it's dead.
            } else {
                // Remove ghoul from world after the animation finishes
                this.removeFromWorld = true;
                return;
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
        
        if (!this.dead) {
            // Apply knockback effect

            this.x += this.pushbackVector.x * this.game.clockTick;
            this.y += this.pushbackVector.y * this.game.clockTick;

            // Decay the pushback vector
            this.pushbackVector.x *= this.pushbackDecay;
            this.pushbackVector.y *= this.pushbackDecay;

        }

        //Reduce attack cooldown timer
        //this is used for every ghoul attack. Makes sure a ghoul hits player once every second instead of every tick.
        if (this.attackCooldownTimer > 0) { 
            this.attackCooldownTimer -= this.game.clockTick;
        }

        const player = this.game.adventurer; // Reference to the player character

        // Calculate the direction vector to the player
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2); 
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
    
        // Calculate the distance to the player
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > 0) {
            // Normalize the direction vector
            const directionX = dx / distance;
            const directionY = dy / distance;
            
    
            //Move the Ghoul toward the player
            const movement = this.speed * this.game.clockTick; //Adjust speed for frame rate
    
            this.x += directionX * movement;
            this.y += directionY * movement;

            // Update state (walking or idle)
            if (distance > 2) {
                this.state = 1; // Walking
                this.facing = dx < 0 ? 1 : 0; // 1 = left, 0 = right
            } 

        }

        this.previousState = this.state;
    
        // // Check for collision with any attack slashes
        const separationDistance = 600; // Minimum distance between zombie
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof FreakyGhoul && entity !== this) {
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
                        // Attack the player and reset cooldown timer
                        entity.takeDamage(this.attackPower);
                        this.attackCooldownTimer = this.attackCooldown;
                        console.log("Ghoul attacked the player!");
                    }
            
                    // Set ghoul to attacking state
                    this.state = 2; // Attacking state
                    this.attackTimer = 1.0;
                } else {
                    // Reset to walking or idle state
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 5) {
                        this.state = 1; //Walking
                    } else {
                        this.state = 0; //Idle
                    }
                }
            }

            if (entity instanceof Lightning && entity.lightningOption === 1 && !this.isSlowed) {
                if (entity.circle.BC.collidesWithBox(this.BB)) {
                    this.applySlowEffect(this.game.adventurer.slowCooldown); 
                }
            }
        }

        // Play attack animation and reduce timer
        if (this.state === 2) {
            this.attackTimer -= this.game.clockTick;
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.0; // Reset attack timer
            }
        }
        
        


        this.updateBB();

    }


    takeDamage(damage, knockbackForce, sourceX, sourceY) {

        this.health -= damage;
        
        // Apply knockback
        const dx = (this.x + (this.bitSizeX * this.scale)/2) - sourceX;
        const dy = (this.y + (this.bitSizeY * this.scale)/2) - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the blue ghoul and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
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

        const shadowWidth = 40 * (this.scale /2.8); 
        const shadowHeight = 16 * (this.scale /2.8);

        const shadowX = (this.x + (23 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (77 * (this.scale / 2.8))) - this.game.camera.y;

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[3][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }

        //used to indicate the path the ghoul is going towards. (line 132 and 133);
        // ctx.strokeStyle = 'Green';
        // ctx.strokeRect(this.x + 44 - this.game.camera.x, this.y + 30 - this.game.camera.y, 20, 20);

        // const player = this.game.adventurer;
        // ctx.strokeRect(player.x - this.game.camera.x, player.y - this.game.camera.y, 20, 20);





        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }

    }
    
}