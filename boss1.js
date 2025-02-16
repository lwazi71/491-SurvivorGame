class Boss1 { //goblin king
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.health = 500;
        this.name = "tbd";
        this.state = 7; //0 = walk, 1 = attack, 2 = throwing, 3 = order, 4 = healing, 5 = jumping up, 6 = jumping down, 7 = dakmaged
        //attack will be throwing honestly
        this.facing = 1;
        this.bitSizeX = 64;
        this.bitSizeY = 64;
        this.scale = 5;


        //Properties:
        this.bossHeals = 1; //should only heal 1 time
        

        
        //animations    
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks, so it doesnt hit player every tick
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 3 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.deathAnimationTimer = 7 * 0.2; //8 frames * 0.2 duration. Should be frameCount * frameDuration for death animation


        this.animations = [];
        

        this.loadAnimation();
    }


    updateBB() {

    }


    loadAnimation() {
        //RIGHT
        for (var i = 0; i < 8; i++) { //7 states
            this.animations.push([]);
            for (var j = 0; j < 2; j++) { //2 faces
                this.animations[i].push([]);
            }
        }

        //walking
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 64, 64, 64, 5.9, 0.1, false, false);

        //attack
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 128, 256, 64, 64, 5, 0.1, false, false);

        //throwing
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 256, 64, 64, 7.9, 0.1, false, false);

        //order
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 512, 64, 64, 5.9, 0.2, false, false);

        //healing
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 320, 64, 64, 14.9, 0.1, false, false);

        //jumping up
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 576, 64, 64, 6, 0.1, false, false);

        //jumping down
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 640, 64, 64, 7, 0.1, false, false);

        //damaged
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 64, 384, 64, 64, 3, 0.1, false, false);

        //LEFT  
        //walking
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 640, 64, 64, 64, 5.9, 0.1, true, false);

        //attack
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 576, 256, 64, 64, 5, 0.1, true, false);

        //throwing
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 512, 256, 64, 64, 7.9, 0.1, true, false);

        //order
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 640, 512, 64, 64, 5.9, 0.2, true, false);

        //healing
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 64, 320, 64, 64, 14.9, 0.1, true, false);

        //jumping up
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 640, 576, 64, 64, 6, 0.1, true, false);

        //jumping down
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 576, 640, 64, 64, 7, 0.1, true, false);

        //damaged
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing-flipped.png"), 768, 384, 64, 64, 3, 0.1, true, false);
    }



    update() {  

        //when jumping up, make him jump out of the screen and then track the player (this.game.adventurer). Warn the player of where he is


    }



    draw(ctx) {
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
            this.animations[7][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(
                this.game.clockTick, 
                ctx, 
                this.x - this.game.camera.x, 
                this.y - this.game.camera.y, 
                this.scale
            );
        }    


        // Draw AOE Warning Circle
        const drawX = this.aoeTargetX - this.game.camera.x;
        const drawY = this.aoeTargetY - this.game.camera.y;
    
        ctx.save();
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.aoeScale, 0, Math.PI * 2);
    
        if (this.isPreparingAOE) {
            // Gradually changing color from green to yellow to red
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        } else if (this.isAboutToAOE) {
            // Solid red when stationary
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        } else {
            // No circle if not preparing or about to AOE
            ctx.restore();
            return;
        }
    
        ctx.lineWidth = 5;
        ctx.fill(); 
        ctx.stroke();
        ctx.restore();


    }
}