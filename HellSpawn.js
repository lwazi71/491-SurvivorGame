class HellSpawn {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle/walking, 1 = charge, 2 = damage
        this.facing = 0; //0 = right, 1 = left
        this.scale = 2.8;
        this.speed = 100;
        this.chargeSpeed = 1500;

        this.health = 20;
        this.attackPower = 10;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.canKnockback = true;
        this.isCharging = false;
        this.chargingDamage = 50;
        this.chargePrepTime = 3;
        this.isPreparingCharge = false
        this.chargeCooldown = 3; //Charge every 3 seconds



        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;


        this.dead = false;
        this.deathAnimationTimer = 5 * 0.15;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.dropchance = 0.4; //40% chance of dropping something when dying


        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 


        this.animations = []; //will be used to store animations

        this.updateBB();
        this.loadAnimation();
    }
    


    updateBB() {
        this.BB = new BoundingBox((this.x + 64), (this.y + 17), 64 + 32, 64 + 35);
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
        //idle/walking, looking to the right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn.png"), 0, 0, 64, 64, 5.9, 0.2, false, false);

        //Charge, to the right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn.png"), 0, 64, 64, 64, 5.3, 0.05, false, false);

        //Damaged, to the right
        this.animations[2][0] =  new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn.png"), 64, 128, 64, 64, 3, 0.2, false, false); //wanna start at where the zombie turns white or else there'll be a delay

        

        //LOOKING LEFT
        //Walking/Idle, looking left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn-Flipped.png"), 128, 0, 64, 64, 5.9, 0.09, true, false);

        //Charge, to the left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn-Flipped.png"), 135, 64, 64, 64, 5.8, 0.05, true, false);

        //Damaged, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn-Flipped.png"), 256, 128, 64, 64, 3, 0.2, true, false);

        //death animation
        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/HellSpawn/Hellspawn.png"), 64, 192, 64, 64, 6.9, 0.15, false, false);
    }

    updateBB() {
        this.BB = new BoundingBox((this.x), (this.y), 64 + 32, 64 + 35);
    }


    update () {
        // Handle damage animation
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false;
                this.state = 0; // Return to idle/walking state
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

        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // Charge timer and mechanism
        this.chargeTimer = (this.chargeTimer || 0) + this.game.clockTick;

        if (distance > 2 && !this.isPreparingCharge && !this.isCharging) {
            this.state = 0; //Walking/idle.
            this.facing = dx < 0 ? 1 : 0; // 1 = left, 0 = right
        } 
    
        if (this.chargeTimer >= this.chargeCooldown && !this.isCharging) {
            // Enter charge preparation state
            if (!this.isPreparingCharge) {
                this.isPreparingCharge = true;
                this.chargePrepTimer = this.chargePrepTime;
                this.state = 1; // Preparation state (same as charge state visually)
            }
        }
    
        if (this.isPreparingCharge) {
          // Countdown preparation time
            this.chargePrepTimer -= this.game.clockTick;
            
            if (this.chargePrepTimer <= 0) {
                // Initiate actual charge
                this.isPreparingCharge = false;
                this.isCharging = true;
                this.chargeTimer = 0;

                //Calculate charge direction and target point
                const chargeDistance = 300; //Adjust this value to control how far HellSpawn goes past the player
                this.chargeDirection = {
                    x: (player.x - this.x) / distance,
                    y: (player.y - this.y) / distance
                };

                // Extend the charge target beyond the player's position
                this.chargeTarget = {
                    x: player.x + this.chargeDirection.x * chargeDistance,
                    y: player.y + this.chargeDirection.y * chargeDistance
                };
            }
        }
    
        if (this.isCharging) {
            // Move in charge direction
            this.x += this.chargeDirection.x * this.chargeSpeed * this.game.clockTick;
            this.y += this.chargeDirection.y * this.chargeSpeed * this.game.clockTick;
            
    
            // End charge if reached or passed target
            const currentDistanceToTarget = Math.sqrt(
                (this.x - this.chargeTarget.x) ** 2 + 
                (this.y - this.chargeTarget.y) ** 2
            );
    
            if (currentDistanceToTarget <= 10) {
                this.isCharging = false;
                this.state = 0;
            }
        } else if (!this.isPreparingCharge) {
            //Normal movement when not charging or preparing
            const movement = this.speed * this.game.clockTick;
            this.x += (dx / distance) * movement;
            this.y += (dy / distance) * movement;
            this.state = 0;
        }    

        //collision
        const entities = this.game.entities;
        const separationDistance = 600; // Minimum distance between hellspawns

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof Adventurer) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        if (this.isCharging) {
                            entity.takeDamage(this.chargingDamage);
                        } else {
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


    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        this.health -= damage;

        //damage to it when its preparing to charge will stop it from preparing to charge.
        if (this.isPreparingCharge) {
            this.isPreparingCharge = false;
            this.state = 0;
            this.chargeTimer = 0;
        }

        
        // Apply knockback
        const dx = this.x - sourceX;
        const dy = this.y - sourceY;
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
            if(drop < this.dropchance) {
                this.game.addEntity(new Threecoin(this.game, (this.x + 28), (this.y + 55)));
            }
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
                ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 20) - this.game.camera.x, (this.y + 100) - this.game.camera.y, 70, 16); //draw a shadow underneath our character
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 50, this.y - this.game.camera.y - 50, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 20) - this.game.camera.x, (this.y + 100) - this.game.camera.y, 70, 16); //draw a shadow underneath our character
            this.animations[2][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 50, this.y - this.game.camera.y - 50, this.scale);
        } else {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 20) - this.game.camera.x, (this.y + 100) - this.game.camera.y, 70, 16); //draw a shadow underneath our character
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x - 50, this.y - this.game.camera.y - 50, this.scale); 
        }

        //Add charge path indicator
        if (this.isPreparingCharge || this.isCharging) {
                ctx.save(); //save current canvas and what's on screen.
                ctx.beginPath();
                //Semi-transparent red
                ctx.strokeStyle = this.isPreparingCharge ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
                ctx.lineWidth = 80; 
                
                //Start drawing from current HellSpawn position
                ctx.moveTo(
                    this.x - this.game.camera.x + 50, 
                    this.y - this.game.camera.y + 50
                );
                
                //During charge preparation, line follows player. 
                const targetX = this.isPreparingCharge 
                    ? this.game.adventurer.x 
                    : this.chargeTarget.x;
                const targetY = this.isPreparingCharge //if its not preparing charge, we're charging, which has chargetarget.y value
                    ? this.game.adventurer.y
                    : this.chargeTarget.y;
                
                
                //Draw line to target
                ctx.lineTo(
                    targetX - this.game.camera.x + 50, 
                    targetY - this.game.camera.y + 50
                );
                
                ctx.stroke();
                ctx.restore();
        }

        ctx.strokeStyle = 'Yellow';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }
    

    
}