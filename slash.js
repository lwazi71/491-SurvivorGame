class AttackSlash { //this class will be for the sword slash entity. This will damage the mobs. Does a slash animation when player swing sword in front of them

        /**
         * 
         * @param {*} game 
         * @param {*} x 
         * @param {*} y 
         * @param {*} attackSpritePath sprite path to the attack slash animation
         * @param {*} radius 
         * @param {*} attackDamge how much the slash will do if enemies are in it
         * @param {*} angle the angle of the slash depending on where our mouse is
         * @param {*} slashType what our slash should look like
         */
        constructor(game, x, y, attackSpritePath, slashScale, attackDamge, angle, slashDirection, attackDamage, personX, personY) { //game will be the game engine!
            Object.assign(this, {game, x, y, attackSpritePath, slashScale, attackDamge, angle, slashDirection, attackDamage}); //slashType: 0 = right to left, 1 = left to right, 2 = second slash right to left, 3 = second slash left to right
            

            this.spriteSheet = ASSET_MANAGER.getAsset(this.attackSpritePath);
            this.removeFromWorld = false;

      

            // Animation timing
            this.slashDuration = 0.3; // Duration in seconds
            this.slashTimer = this.slashDuration;

                 // Updated sprite properties for 128x128
            this.spriteWidth = 128;
            this.spriteHeight = 128;
           // this.scale = 2.8; // Reduced scale since sprite is larger

            this.slashDistance = 27;
            
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
            const centerX = this.game.adventurer.x + (32 * 2.8) / 2 + Math.cos(this.angle) * offsetDistance + 5;
            const centerY = this.game.adventurer.y + (32 * 2.8) / 2 + Math.sin(this.angle) * offsetDistance + 10;
            
            // Create bounding circle at the adjusted position
            this.BC = new BoundingCircle(centerX, centerY, this.radius);    
        }

        updatePosition() {

            // Center of the adventurer
            const characterCenterX = this.game.adventurer.x + (32 * 2.8) / 2; //2.8 because it's the scale increase size of our player. 
            const characterCenterY = this.game.adventurer.y + (32 * 2.8) / 2;

            // Update position using the angle and radius
            this.x = characterCenterX + Math.cos(this.angle) * this.slashDistance - (this.spriteWidth * this.slashScale) / 2;
            this.y = characterCenterY + Math.sin(this.angle) * this.slashDistance - (this.spriteHeight * this.slashScale) / 2; 
        }

        loadAnimations() {
            //might add another parameter to array for different color slashes (possibly upgrading our slash)
            //[this.swordSwing][this.color/upgrade]

            //left to right slash 
            this.animations[0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Slash/red-slash.png"), 0, 0, 128, 128, 5, 0.1, false, false);

            
            this.animations[1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Slash/red-slash.png"), 0, 128, 128, 128, 4, 0.1, false, false);


            //reverse. Change sprite sheet to the flipped one (slash 1)
            this.animations[2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Slash/red-slash-flipped.png"), 0, 0, 128, 128, 5, 0.1, true, false);

            this.animations[3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Slash/red-slash-flipped.png"), 0, 128, 128, 128, 4, 0.1, false, false);


        }

        update() {
            this.slashTimer -= this.game.clockTick;

            //Update position every frame. The slash will try to match with player movement
            this.updatePosition();
            this.updateBC();
            
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