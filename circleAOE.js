class CircleAOE { //this class will be for the sword slash entity. This will damage the mobs. Does a slash animation when player swing sword in front of them

    /**
     * 
     * @param {*} game GameEngine
     * @param {*} x Where we want to start our circle on x
     * @param {*} y Where we want to start our circle on y
     * @param {*} attackSpritePath sprite path to the attack slash animation
     * @param {*} radius How big the radius of our circle slash will be
     * @param {*} attackDamge how much the slash will do if enemies are in it
     * @param {*} angle the angle of the slash depending on where our mouse is
     * @param {*} slashType what our slash should look like
     */
    constructor(game, x, y, attackSpritePath, attackSpritePathFlipped, scale, attackDamage, knockback, person, friendly, 
        animationX, animationY, animationSizeX, animationSizeY, frameCount, frameDuration, reverse, loop) { //game will be the game engine!
        Object.assign(this, {game, x, y, attackSpritePath, attackSpritePathFlipped, scale,  attackDamage, knockback, person, friendly, 
            animationX, animationY, animationSizeX, animationSizeY, frameCount, frameDuration, reverse, loop}); 
        

        this.spriteSheet = ASSET_MANAGER.getAsset(this.attackSpritePath);
        this.removeFromWorld = false;

        // Animation timing
        this.attackDuration = this.frameCount * frameDuration; // Duration in seconds
        this.attackTimer = this.attackDuration;
    
        this.entityOrder = 99;
    
        this.spriteWidth = this.animationSizeX;
        this.spriteHeight = this.animationSizeY;

        this.radius = (this.spriteWidth * this.scale)/3;

        // Add a Set to track which entities have been hit by this slash
        this.hitEntities = new Set();
        
        this.updateBC();

        // Load animations
        this.animations = [];
        this.loadAnimations();

    };

    updateBC() {
        this.BC = new BoundingCircle(this.x, this.y, this.radius);    
    }

    loadAnimations() {
        this.animations[0] = new Animator(ASSET_MANAGER.getAsset(this.attackSpritePath), this.animationX, this.animationY, 
            this.animationSizeX, this.animationSizeY, this.frameCount, this.frameDuration, this.reverse, this.loop);
    }

    update() {
       // console.log((this.spriteWidth * this.scale)/2);
        this.attackTimer -= this.game.clockTick;

        if (this.person) {
            //Get the character's center position. We have to update the character center when they're moving
            const characterCenterX = this.person.x + (this.person.bitSize * this.person.scale) / 2;
            const characterCenterY = this.person.y + (this.person.bitSize * this.person.scale) / 2;
            
            // Update circle position to character's center
            this.x = characterCenterX;
            this.y = characterCenterY;
            
            this.updateBC();
        }


        //Slash duration. Once it's done, we'll remove this entity from the world as the player is done attacking.
        if (this.attackTimer <= 0) {
            this.removeFromWorld = true;
        }


        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            //mobs/enemies
            if (this.friendly) {
                if ((entity instanceof Zombie || entity instanceof Ghost || entity instanceof BlueGhoul || entity instanceof FreakyGhoul || entity instanceof HellSpawn 
                        || entity instanceof BanditNecromancer || entity instanceof Necromancer || entity instanceof RatMage || entity instanceof FoxMage || entity instanceof Imp
                        || entity instanceof Crow || entity instanceof Minotaur || entity instanceof GoblinMech || entity instanceof Cyclops || entity instanceof Slime 
                        || entity instanceof Boar || entity instanceof Wizard || entity instanceof Goblin) 
                    && !entity.dead) {
                    // Only apply damage if we haven't hit this mob yet
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the zombie to our hit set
                        this.hitEntities.add(entity);
                        this.game.camera.cameraShake(40);

                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
    
                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        entity.takeDamage(this.attackDamage, this.knockback, this.x, this.y);
                        
                    }
                }
    
                if ((entity instanceof Barrel || entity instanceof Crate || entity instanceof Pot)) { 
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);
                        entity.takeDamage(this.attackDamage);
                    }
                }
            } else {
                if ((entity instanceof Adventurer)) {
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);
                        entity.takeDamage(this.attackDamage);
                    }
                }
            }
        }
    }


    draw(ctx) {
        const drawX = this.x - (this.spriteWidth * this.scale) / 2 - this.game.camera.x;
        const drawY = this.y - (this.spriteHeight * this.scale) / 2 - this.game.camera.y;

        // Draw the animation centered on the position
        this.animations[0].drawFrame(
            this.game.clockTick, 
            ctx, 
            drawX,
            drawY,
            this.scale
        );

        if (this.BC) {
            this.BC.draw(ctx, this.game.camera);
        }
    }


}