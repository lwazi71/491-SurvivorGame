class Zombie {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle, 1 = walking, 2 = attack, 3 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.attackPower = 5;
        this.scale = 2.6;

        this.health = 10;

        this.dead = false;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 


        this.animations = []; //will be used to store animations
        this.loadAnimation();
    }

    updateBB() {
        this.BB = new BoundingBox((this.x + 13), (this.y + 17), 32 + 20, 32 + 35);
    }

    loadAnimation() {
        for (var i = 0; i < 4; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }


        //LOOKNG RIGHT
        //idle, looking to the right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 0, 32, 32, 7.9, 0.2, false, false);

        //Walking, looking right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 64, 32, 32, 8, 0.09, false, false);

        //Attack, to the right
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 32, 32, 32, 7, 0.05, false, false);

        //Damaged, to the right
        this.animations[3][0] =  new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 160, 32, 32, 2, 0.2, false, false);

        

        //LOOKING LEFT
        //idle, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 162, 0, 32, 32, 7.9, 0.2, true, false);

        //Walking, looking left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 160, 64, 32, 31.9, 7.9, 0.09, true, false);

        //Attack, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 190, 32, 32, 32, 7, 0.05, true, false);

        //Damaged, to the left
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 350, 160, 32, 32, 2, 0.2, true, false);


        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 160, 32, 32, 8, 0.2, false, false);
    }



    update() {
        this.state = 0;
        this.facing = 1;


        this.previousState = this.state;
    
        // // Check for collision with any attack slashes
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof AttackSlash) { // Check if the entity is an attack slash
                // Check if the slash's bounding circle collides with zombie's bounding box
                if (entity.BC.collidesWithBox(this.BB)) {
                    this.state = 3; // Change to damaged state
                    // Optional: Add a timer to control how long the damage animation plays
                    this.damageTimer = 0.4; // Duration in seconds for damage animation
                    
                    // Optional: Add damage flash effect
                    this.damaged = true;

                    this.takeDamage(entity.attackDamage);
                    
                    // this.health -= entity.attackDamage;
                    // console.log(this.health);
                    // if (this.health <= 0) this.dead = true;

                    this.animations[3][0].elaspedTime = 0;
                    this.animations[3][1].elaspedTime = 0;

                
                }
                
            }
        }
        
        // // Handle damage animation timer
        if (this.damageTimer > 0) {
            this.damageTimer -= this.game.clockTick;
            if (this.damageTimer <= 0) {
                this.state = 0; // Return to idle state after damage animation
                this.damaged = false;
            }
        }
        
        // Update facing based on player position (optional)
        const playerX = this.game.adventurer.x;
        this.facing = playerX < this.x ? 1 : 0;

        

        this.updateBB();

    }

    takeDamage(damage) {
       // this.health -= damage;
       this.state = 3; 
        if (this.health <= 0) {
            this.dead = true;
            this.state = 3; // Set to "damaged" or "dead" animation state
            // Optionally, remove the zombie from the game here or after its death animation finishes
        }
    }


    draw(ctx) {
        if (this.dead) {
            this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 28) - this.game.camera.x, (this.y + 77) - this.game.camera.y, 40, 16); //draw a shadow underneath our character
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }


        
        ctx.strokeStyle = 'Yellow';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);

    }
    
}