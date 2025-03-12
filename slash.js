class AttackSlash { //this class will be for the sword slash entity. This will damage the mobs. Does a slash animation when player swing sword in front of them

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
        constructor(game, x, y, attackSpritePath, attackSpritePathFlipped, slashScale, angle, slashDirection, attackDamage, knockback, person, friendly) { //game will be the game engine!
            //slashDirection: 0 = right to left, 1 = left to right, 2 = second slash right to left, 3 = second slash left to right
            Object.assign(this, {game, x, y, attackSpritePath, attackSpritePathFlipped, slashScale, angle, slashDirection, attackDamage, knockback, person, friendly}); 
            

            this.spriteSheet = ASSET_MANAGER.getAsset(this.attackSpritePath);
            this.removeFromWorld = false;

      

            // Animation timing
            this.slashDuration = 0.4; // Duration in seconds
            this.slashTimer = this.slashDuration;

                 // Updated sprite properties for 128x128
            this.spriteWidth = 128;
            this.spriteHeight = 128;

            // Add a Set to track which entities have been hit by this slash
            this.hitEntities = new Set();

            this.slashDistance = this.person.scale * 10; //how far the slash should be away from the player

            this.entityOrder = 100;
            
            this.updatePosition();
            this.updateBC();

            // Load animations
            this.animations = [];
            this.loadAnimations();

        };

        //Update bounding circle
        updateBC() {
            // We'll make the radius match the visible slash area
            // Reduce the radius to better match the slash arc
            this.radius = (this.spriteWidth * this.slashScale) * 0.21; // Reduced from 0.3 to 0.2
            
            // Adjust the circle's center position to be more towards the slash
            // Calculate the offset distance from character center
            const offsetDistance = this.slashDistance + this.radius; //Add radius to move circle further out. -4 to make circle kind of smaller
            
            // Calculate the center position based on the angle and offset
            const centerX = this.person.x + (this.person.bitSize * this.person.scale) / 2 + Math.cos(this.angle) * offsetDistance + 5;
            const centerY = this.person.y + (this.person.bitSize * this.person.scale) / 2 + Math.sin(this.angle) * offsetDistance + 10;
            
            // Create bounding circle at the adjusted position
            this.BC = new BoundingCircle(centerX, centerY, this.radius);    
        }

        //updates position on where our slash animation is
        updatePosition() {

            // Center of the adventurer
            const characterCenterX = this.person.x + (this.person.bitSize * this.person.scale) / 2; //scale is 2.8 because it's the scale increase size of our player. 
            const characterCenterY = this.person.y + (this.person.bitSize * this.person.scale) / 2;

            //Update position using the angle and radius.
            //This is mainly for our animation
            this.x = characterCenterX + Math.cos(this.angle) * this.slashDistance - (this.spriteWidth * this.slashScale) / 2;
            this.y = characterCenterY + Math.sin(this.angle) * this.slashDistance - (this.spriteHeight * this.slashScale) / 2; 
        }

        loadAnimations() {
            //might add another parameter to array for different color slashes (possibly upgrading our slash)
            //[this.swordSwing][this.color/upgrade]

            //left to right slash 
            this.animations[0] = new Animator(ASSET_MANAGER.getAsset(this.attackSpritePath), 0, 0, 128, 128, 5, 0.1, false, false);

            
            this.animations[1] = new Animator(ASSET_MANAGER.getAsset(this.attackSpritePath), 0, 128, 128, 128, 4, 0.1, false, false);


            //reverse. Change sprite sheet to the flipped one (slash 1)
            this.animations[2] = new Animator(ASSET_MANAGER.getAsset(this.attackSpritePathFlipped), 0, 0, 128, 128, 5, 0.1, true, false);

            this.animations[3] = new Animator(ASSET_MANAGER.getAsset(this.attackSpritePathFlipped), 0, 128, 128, 128, 4, 0.1, false, false);


        }

        update() {
            this.slashTimer -= this.game.clockTick;

            //Update position every frame. The slash will try to match with player movement
            this.updatePosition();
            this.updateBC();


            // Check for collisions with zombies
            const entities = this.game.entities;
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                //melee/range mobs
                if ((entity instanceof Zombie || entity instanceof Ghost || entity instanceof BlueGhoul || entity instanceof FreakyGhoul 
                    || entity instanceof BanditNecromancer || entity instanceof Necromancer || entity instanceof RatMage || entity instanceof FoxMage || entity instanceof Imp 
                    || entity instanceof Crow || entity instanceof Wizard || entity instanceof Goblin || entity instanceof Summon) 
                    && !entity.dead && !entity.invincible) {
                    // Only apply damage if we haven't hit this zombie yet
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the entity to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        const centerX = this.person.x + (this.person.bitSize * this.person.scale) / 2 + Math.cos(this.angle) * this.slashDistance;
                        const centerY = this.person.y + (this.person.bitSize * this.person.scale) / 2 + Math.sin(this.angle) * this.slashDistance;

                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        let damage = this.attackDamage;
                        if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                        (this.attackDamage != damage) ? entity.didCrit = true : entity.didCrit = false;
                        entity.takeDamage(damage, this.knockback, centerX, centerY);
                        
                    }
                }

                //charging mobs
                if ((entity instanceof HellSpawn || entity instanceof Slime || entity instanceof Boar) 
                    && !entity.dead && !entity.invincible) {
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the zombie to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        const centerX = this.person.x + (this.person.bitSize * this.person.scale) / 2 + Math.cos(this.angle) * this.slashDistance;
                        const centerY = this.person.y + (this.person.bitSize * this.person.scale) / 2 + Math.sin(this.angle) * this.slashDistance;

                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        let damage = this.attackDamage;
                        if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                        (this.attackDamage != damage) ? entity.didCrit = true : entity.didCrit = false;

                        if (entity.isCharging || entity.isPreparingCharge) {
                            //no knockback if the entity is charging
                            entity.takeDamage(damage, 0, centerX, centerY);
                        } else {
                            entity.takeDamage(damage, this.knockback, centerX, centerY);
                        }
                        
                    }
                }


                //friendly just means that we the player hit it and not an enemy
                if ((entity instanceof Barrel || entity instanceof Crate || entity instanceof Pot) && this.friendly) { 
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);
                        entity.takeDamage(this.attackDamage);
                    }
                }
        
                //COMBO with sword and bow and arrow!
                if (entity instanceof Projectile && this.friendly && entity.friendly && this.game.adventurer.slashArrowCombo) { 
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        this.hitEntities.add(entity);
                        entity.speed *= 2;
                        entity.damage *= 2;
                    }
                }

                //if the player hits a projectile that's not friendly. Maybe change this when it comes to bosses. 
                if (entity instanceof Projectile && this.friendly && !entity.friendly && this.game.adventurer.parry && !(entity.person instanceof GolemMech)) {  //cant parry boss arm 
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        entity.removeFromWorld = true;
                    }
                }

                //COMBO with bomb where player can knock bomb back
                if (entity instanceof Bomb && this.friendly && this.game.adventurer.slashBombCombo) {
                    //if we hit the bomb and another entity, the bomb wont have any knockback
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity) && this.hitEntities.size == 0) { 
                        // Add the bomb to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        console.log("testing knockback for bomb):")
                        const centerX = this.person.x + (this.person.bitSize * this.person.scale) / 2 + Math.cos(this.angle) * this.slashDistance;
                        const centerY = this.person.y + (this.person.bitSize * this.person.scale) / 2 + Math.sin(this.angle) * this.slashDistance;

                        //Pass the center coordinates for knockback calculation and Apply damage and trigger damage state
                        entity.takeKnockback(4000, centerX, centerY);
                    }
                }
                
                //bosses/mini bosses
                if ((entity instanceof Minotaur || entity instanceof GoblinMech || entity instanceof Cyclops || entity instanceof Boss1 || entity instanceof GolemMech || entity instanceof Boss3 || entity instanceof Boss4) && this.friendly && !entity.invincible) {
                    //if we hit the bomb and another entity, the bomb wont have any knockback
                    if (this.BC.collidesWithBox(entity.BB) && !this.hitEntities.has(entity)) {
                        // Add the entity to our hit set
                        this.hitEntities.add(entity);
                        
                        //Calculate the knockback TRUE CENTER of the slash circle for knockback source
                        const centerX = this.person.x + (this.person.bitSize * this.person.scale) / 2 + Math.cos(this.angle) * this.slashDistance;
                        const centerY = this.person.y + (this.person.bitSize * this.person.scale) / 2 + Math.sin(this.angle) * this.slashDistance;

                        //We're gonna have 0 knockbacks for bosses/mini-bosses. Could potentially change
                        let damage = this.attackDamage;
                        if (this.person instanceof Adventurer) damage = this.person.critDamageCheck(damage);
                        (this.attackDamage != damage) ? entity.didCrit = true : entity.didCrit = false;

                        entity.takeDamage(damage, 0, centerX, centerY);
                        
                    }
                }
                
                //maybe a mob can have a big slash attack as well?
                if ((entity instanceof Adventurer && !this.friendly)) {
                    if (this.BC.collidesWithBox(entity.BB) && this.hitEntities.has(entity)) {

                    }
                }
            }
            
            //Slash duration. Once it's done, we'll remove this entity from the world as the player is done attacking.
            if (this.slashTimer <= 0) {
                this.removeFromWorld = true;
            }


            // Check collision with zombies
            // for (const entity of this.game.entities) {
            //     if (entity instanceof Zombie && !entity.dead) { // Only check for alive zombies
            //         if (this.BC.collidesWithBox(entity.BB)) { // Assuming you use a circle for slash
            //             entity.takeDamage(this.attackDamage); // Apply damage to zombie
            //         }
            //     }
            // }
        }





        draw(ctx) {

            const screenX = this.x - this.game.camera.x;
            const screenY = this.y - this.game.camera.y;
            //console.log("attack slash");
            ctx.save(); //Save the current context state
        	ctx.imageSmoothingEnabled = false;

            // Translate to the slash position
            // Translate to the center of the slash
            ctx.translate(
                screenX + (this.spriteWidth * this.slashScale) / 2 - 5,
                screenY + (this.spriteHeight * this.slashScale) / 2 + 10 //might remove + 10. Added 10 to move slash position down bc slashing up had more white space than slashing down
            );            
            // Rotate the context
            ctx.rotate(this.angle);
            
            
            //Draw the slash centered at the rotation point
            this.animations[this.slashDirection].drawFrame(
                this.game.clockTick,
                ctx,
                -(this.spriteWidth * this.slashScale) / 2, //Offset by half the sprite width
                -(this.spriteHeight * this.slashScale) / 2 , //Offset by half the sprite height
                this.slashScale
            );
            
            ctx.restore(); // Restore the context state


            // Draw bounding circle last so it's visible on top
            if (this.BC) {
                this.BC.draw(ctx, this.game.camera);
            }
            
        }
}