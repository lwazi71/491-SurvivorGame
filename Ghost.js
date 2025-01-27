class Ghost {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = moving, 1 = attack, 2 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.attackPower = 5;
        this.scale = 2.6;
        this.speed = 280;

        this.health = 20;
        this.attackPower = 10;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; //Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;


        this.dead = false;
        this.deathAnimationTimer = 7 * 0.15;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 


        this.animations = []; //will be used to store animations

        this.updateBB();
        this.loadAnimation();
    }
    


    updateBB() {
        this.BB = new BoundingBox((this.x + 20), (this.y + 17), 32 + 22, 32 + 35);
    }

    loadAnimation() {
        for (var i = 0; i < 4; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }


        //LOOKNG RIGHT
        //Walking, looking right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost.png"), 0, 0, 32, 32, 3.9, 0.1, false, false);

        //Attack, to the right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost.png"), 0, 32, 32, 32, 3.9, 0.2, false, false);

        //Damaged, to the right
        //wanna start at where the ghost turns white or else there'll be a delay
        this.animations[2][0] =  new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost.png"), 0, 64, 32, 32, 3.9, 0.2, false, false); 

        

        //LOOKING LEFT
        //idle, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost-Flipped.png"), 96, 0, 32, 32, 3.9, 0.2, true, false);

        //Attack, to the left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost-Flipped.png"), 96, 32, 32, 32, 4, 0.2, true, false);

        //Damaged, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost-Flipped.png"), 96, 64, 32, 32, 4, 0.2, true, false);


        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Ghost/Ghost.png"), 0, 96, 32, 32, 7, 0.15, false, false);
    }



    update() {
        //Handle damage animation time so it isnt infinite. This is when the player hits the zombie
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle walking state
            }
        }

        if (this.dead) {
            // Handle death animation
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return; //return so the ghost would stop moving when it's dead.
            } else {
                // Remove ghost from world after the animation finishes
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

        // Reduce attack cooldown timer
        if (this.attackCooldownTimer > 0) { //this is used for every ghost attack. Makes sure a ghost hits player once every second instead of every tick.
            this.attackCooldownTimer -= this.game.clockTick;
        }

        const player = this.game.adventurer; // Reference to the player character

        // Calculate the direction vector to the player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
    
        // Calculate the distance to the player
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > 0) {
            // Normalize the direction vector
            const directionX = dx / distance;
            const directionY = dy / distance;
            
    
            // Move the ghost toward the playersd
            const movement = this.speed * this.game.clockTick; //Adjust speed for frame rate
    
            this.x += directionX * movement;
            this.y += directionY * movement;

             // Update state (walking or idle)
             if (distance > 5) {
                this.state = 0; // Walking
                this.facing = dx < 0 ? 1 : 0; // 1 = left, 0 = right
            } 
        }


        this.previousState = this.state;
    
        // // Check for collision with any attack slashes
        const separationDistance = 600; // Minimum distance between ghost or zombies
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof Zombie || entity instanceof Ghost && entity !== this) {
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
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                        console.log("Ghost attacked the player!");
                    }
            
                    
                    this.state = 1; // Attacking state
                } else {
                    // Reset to walking or idle state
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 5) {
                        this.state = 0; // Walking
                    } else {
                        this.state = 0; // Idle
                    }
                }
            }
        }

        // Play attack animation and reduce timer
        if (this.state === 1) {
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
        const dx = this.x - sourceX;
        const dy = this.y - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the ghost and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            this.dead = true;
            this.state = 2;
        } else {
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
        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 17) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 40, 16);
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 28) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 40, 16); //draw a shadow underneath our character
            this.animations[2][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 28) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 40, 16); //draw a shadow underneath our character
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }


        
        ctx.strokeStyle = 'Yellow';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);

    }
    
}