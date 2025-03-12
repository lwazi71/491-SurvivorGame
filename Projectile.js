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
     * @param {*} BBx Where the boundary x coordinate will start with this.x
     * @param {*} BBy Where the boundary y coordinate will start with this.y
     * @param {*} BBHeight How big our bounding box is for projectile, height wise
     * @param {*} BBWidth How big our bounding box is for projectile, width wise
     * @param {*} pixelX what the projectile image bitSizeX is
     * @param {*} pixelY what the projectile image bitSizeY is
     * @param {*} person what entity this is coming from
     * @param {*} dynamicBB false if want to create the bounding box ourselves. true otherwise.
     */
    constructor(game, x, y, angle, damage, speed, spritePath, knockback,
        friendly, scale, piercing, lifetime, 
        animX, animY, animSizeX, animSizeY, frameCount, animDuration, reverse, loop, BBx, BBy, BBHeight, BBWidth, pixelX, pixelY, person, dynamicBB) {

        Object.assign(this, {game, x, y, angle, damage, speed, spritePath, knockback,
            friendly, scale, piercing, lifetime, animX, animY, animSizeX, animSizeY, 
            frameCount, animDuration, reverse, loop, BBx, BBy, BBHeight, BBWidth, pixelX, pixelY, person, dynamicBB});
        

        this.spritesheet = ASSET_MANAGER.getAsset(this.spritePath);
        this.removeFromWorld = false;

        //Velocity components
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };

        this.entityOrder = 97;
    

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

        if (this.dynamicBB) {            
            // Adjust the bounding box based on the angle
            const offsetX = Math.cos(this.angle) * (this.BBx);
            const offsetY = Math.sin(this.angle) * (this.BBy);
            
            this.boundingBoxX = this.x + offsetX;
            this.boundingBoxY = this.y + offsetY;
            // Create bounding box for collision with rotation applied
            this.BB = new BoundingBox(
                this.boundingBoxX, 
                this.boundingBoxY, 
                this.BBHeight, 
                this.BBWidth
            );
        } else {
            this.BB = new BoundingBox(
                this.x + this.BBx, 
                this.y + this.BBy, 
                this.BBHeight, 
                this.BBWidth
            );
        }
    }

    update() {
        // Reduce lifetime
        this.timer -= this.game.clockTick;
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - this.x;
        const dy = (player.y + (player.bitSize * player.scale)/2) - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //BOSS1 and BOSS2 PROJECTILES
        if (this.timer <= 0 && this.person instanceof Boss1) { //This will only be used for boss1 because he's the only one that throws a money bag at the player
            this.removeFromWorld = true;
            this.game.addEntity(new Onecoin(this.game, (this.x + 28), (this.y + 55)));
            return;
        }
        if (this.person instanceof GolemMech && (this.timer <= 0 || distance <= 150)) { //This will only be used for boss2 because he'll have an explosion at the end of his projectile
            this.removeFromWorld = true;
            this.game.camera.cameraShake(100);
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Explosion.mp3");
            this.game.addEntity(new CircleAOE
                (this.game, this.boundingBoxX, this.boundingBoxY, "./Sprites/Explosion/explosion.png", null, 10, 25, 0, this, false, 0, 0, 48, 48, 8, 0.1, false, false));
            return;
        }

        if (this.timer <= 0) {
            this.removeFromWorld = true;
            return;
        }

        //added velocity because speed can change when its mid air due to combo with slash
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };

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

                //Player arrow hitting enemies (for melee and range enemies)
                if ((entity instanceof Zombie || entity instanceof Ghost || entity instanceof BlueGhoul || entity instanceof FreakyGhoul 
                    || entity instanceof BanditNecromancer || entity instanceof Necromancer || entity instanceof RatMage || entity instanceof FoxMage || entity instanceof Imp 
                    || entity instanceof Crow || entity instanceof Wizard || entity instanceof Goblin || entity instanceof Summon) 
                    && !entity.dead && !entity.invincible &&
                    this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                     
                    this.hitEntities.add(entity);
                    //knockback properties
                    const knockbackX = -Math.cos(this.angle) * this.knockback;
                    const knockbackY = -Math.sin(this.angle) * this.knockback;
                    // console.log(this.damage);
                    let damage = this.damage;
                    if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                    (this.damage != damage) ? entity.didCrit = true : entity.didCrit = false;

                    entity.takeDamage(damage, this.knockback, 
                        this.x + knockbackX, 
                        this.y + knockbackY
                    );

                    if (!this.piercing) {
                        this.removeFromWorld = true;
                    }
                }
                //for charging enemies
                if ((entity instanceof HellSpawn || entity instanceof Slime || entity instanceof Boar) 
                    && !entity.dead) {
                    // Only apply damage if we haven't hit this zombie yet
                    if (this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the zombie to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        const knockbackX = -Math.cos(this.angle) * this.knockback;
                        const knockbackY = -Math.sin(this.angle) * this.knockback;
                    

                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        let damage = this.damage;
                        if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                        (this.damage != damage) ? entity.didCrit = true : entity.didCrit = false;

                        if (entity.isPreparingCharge || entity.isCharging) {
                            //no knockback if the entity is charging
                            entity.takeDamage(damage, 0);
                        } else {
                            entity.takeDamage(damage, this.knockback, 
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

                //Mini-bosses / bosses
                if ((entity instanceof Minotaur || entity instanceof GoblinMech || entity instanceof Cyclops || entity instanceof Boss1 || entity instanceof GolemMech || entity instanceof Boss3 || entity instanceof Boss4) && !entity.invincible) { 
                    if (this.BB.collide(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);

                        let damage = this.damage;
                        if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                        (this.damage != damage) ? entity.didCrit = true : entity.didCrit = false;

                        entity.takeDamage(damage, 0);

                        if (!this.piercing) {
                            this.removeFromWorld = true;
                        }
                    }
                }
            } else {
                //BOSS GOBLIN KING projectile
                if (entity instanceof Adventurer && !entity.invincible && this.person instanceof Boss1 && this.BB.collide(entity.BB)) {
                    const knockbackX = -Math.cos(this.angle) * this.knockback;
                    const knockbackY = -Math.sin(this.angle) * this.knockback;
                        
                    entity.takeDamageKnockback(this.damage, this.knockback, 
                        this.x + knockbackX, 
                        this.y + knockbackY
                    );

                    this.game.addEntity(new Threecoin(this.game, (this.x - 20), (this.y - 20)));

                    if (!this.piercing) {
                        this.removeFromWorld = true;
                    }
                }

                //BOSS GOBLIN KING projectile
                if (entity instanceof Adventurer && !entity.invincible && this.person instanceof GolemMech && this.BB.collide(entity.BB)) {
                    const knockbackX = -Math.cos(this.angle) * this.knockback;
                    const knockbackY = -Math.sin(this.angle) * this.knockback;
                        
                    entity.takeDamageKnockback(this.damage, this.knockback, 
                        this.x + knockbackX, 
                        this.y + knockbackY
                    );

                    this.game.addEntity(new CircleAOE
                        (this.game, this.boundingBoxX, this.boundingBoxY, "./Sprites/Explosion/explosion.png", null, 10, 25, 0, this, false, 0, 0, 48, 48, 8, 0.1, false, false));

                    if (!this.piercing) {
                        this.removeFromWorld = true;
                    }
                }

                //Normal enemy projectile hitting player
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
            -((this.pixelX * this.scale) / 2), 
            -((this.pixelY * this.scale) / 2), 
            this.scale
        );

        ctx.restore();
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }





}