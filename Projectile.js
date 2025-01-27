class Projectile {
    /**
     * 
     * @param {*} game game engine initialization
     * @param {*} x where the center of our character on x
     * @param {*} y where the center of our character is on y
     * @param {*} angle the angle of the arrow when shooting out of the character + for image
     * @param {*} damage how much our projectile does
     * @param {*} speed the speed of how fast our projectile goes
     * @param {*} spritePath what does the projectile look like?
     * @param {*} knockback How much knockback should arrow do?
     * @param {*} friendly Lets us know if we're shooting or if the enemy is shooting
     * @param {*} scale How big we want our projectile to be
     * @param {*} piercing Checks if the projectile breaks on impact or goes through everything
     * @param {*} lifetime How long does the projectile last?
     * @param {*} animX where we want to start our animation on spritesheet on X
     * @param {*} animY where we want to start our animation on spritesheet on Y
     * @param {*} animSizeX How big is each frame on sprite sheet (for X)? (e.g. 32x32)
     * @param {*} animSizeY How big is each frame on sprite sheet (for Y)? (e.g. 32x32)
     * @param {*} frameCount How many frames are on the sprite sheet animation for the projectile
     * @param {*} animDuration how long does the animation last? How fast the animation will go.
     * @param {*} reverse Goes backwards for sprite 
     * @param {*} loop Loops through sprite
     */
    constructor(game, x, y, angle, damage, speed, spritePath, knockback,
        friendly, scale, piercing, lifetime, 
        animX, animY, animSizeX, animSizeY, frameCount, animDuration, reverse, loop, BBx, BBy, BBHeight, BBWidth) {

        Object.assign(this, {game, x, y, angle, damage, speed, spritePath, knockback,
            friendly, scale, piercing, lifetime, animX, animY, animSizeX, animSizeY, 
            frameCount, animDuration, reverse, loop, BBx, BBy, BBHeight, BBWidth});
        

        this.spritesheet = ASSET_MANAGER.getAsset(this.spritePath);
        this.removeFromWorld = false;

        // Velocity components
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
    

         //Tracking hit entities to prevent multiple hits
         this.hitEntities = new Set();

        // Lifetime of projectile (in seconds)
        // this.lifetime = options.lifetime || 2;
        this.timer = this.lifetime;

        this.updateBB();
        this.loadAnimations();
    }

    loadAnimations() {
        // Default arrow animation (can be overridden)
        // this.animations = new Animator(this.spritesheet, 74, 0, 32, 32, 1, 0.2, false, false);

        this.animations = new Animator(this.spritesheet, 
            this.animX, this.animY, this.animSizeX, this.animSizeY, 
            this.frameCount, this.animDuration, this.reverse, this.loop);


    }

    updateBB() {
        // Create bounding box for collision. This only applies for arrows for now
        this.BB = new BoundingBox(
            this.x + this.BBx, 
            this.y + this.BBy, 
            this.BBHeight, 
            this.BBWidth
        );
        console.log(this.x - 15);
        console.log(this.BB.x);
    }

    update() {
        // Reduce lifetime
        //console.log(this.timer);
        this.timer -= this.game.clockTick;
        if (this.timer <= 0) {
            this.removeFromWorld = true;
            return;
        }

        // Move projectile
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        // Update bounding box
        this.updateBB();

        // Check collisions
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            
            // Different collision logic based on shooter.
            if (this.friendly) { //this means the projectile is coming from us, the player
                // Player arrow hitting enemies 
                if ((entity instanceof Zombie || entity instanceof Ghost || entity instanceof BlueGhoul) 
                    && !entity.dead && 
                    this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                     
                    this.hitEntities.add(entity);
                    //knockback properties
                    const knockbackX = -Math.cos(this.angle) * this.knockback;
                    const knockbackY = -Math.sin(this.angle) * this.knockback;
                
                    entity.takeDamage(this.damage, this.knockback, 
                        this.x + knockbackX, 
                        this.y + knockbackY
                    );

                    if (!this.piercing) {
                        this.removeFromWorld = true;
                    }
                }
                //for charging enemies
                if ((entity instanceof HellSpawn) 
                    && !entity.dead) {
                    // Only apply damage if we haven't hit this zombie yet
                    if (this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the zombie to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        const knockbackX = -Math.cos(this.angle) * this.knockback;
                        const knockbackY = -Math.sin(this.angle) * this.knockback;
                    
                        entity.takeDamage(this.damage, this.knockback, 
                            this.x + knockbackX, 
                            this.y + knockbackY
                        );

                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        if (entity.isCharging || entity.isPreparingCharge) {
                            //no knockback if the entity is charging
                            entity.takeDamage(this.damage, 0);
                        } else {
                            entity.takeDamage(this.damage, this.knockback, 
                                this.x + knockbackX, 
                                this.y + knockbackY
                            );                        
                        }

                        if (!this.piercing) {
                            this.removeFromWorld = true;
                        }
                        
                    }
                }
                

                //checking projectile collisions with objects (destructable)
                if ((entity instanceof Barrel || entity instanceof Crate || entity instanceof Pot)) { 
                    if (this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);
                        entity.takeDamage(this.damage);

                        if (!this.piercing) {
                            this.removeFromWorld = true;
                        }
                    }
                }
            } else {
                // Enemy projectile hitting player
                if (entity === this.game.adventurer && !entity.invincible && 
                    this.BB.collide(entity.BB)) {
                    
                    entity.takeDamage(this.damage);

                    if (!this.piercing) {
                        this.removeFromWorld = true;
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Rotate projectile based on its angle
        ctx.translate(
            this.x - this.game.camera.x, 
            this.y - this.game.camera.y
        );
        ctx.rotate(this.angle);

        // Draw projectile
        this.animations.drawFrame(
            this.game.clockTick, 
            ctx, 
            -((32 * this.scale) / 2), 
            -((32 * this.scale) / 2), 
            this.scale
        );

        ctx.restore();

        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }





}