class Barrel {
    constructor(game, x, y, drop) { //the drop will let us know whether to drop coins, an item, or nothing
        Object.assign(this, {game, x, y, drop});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/DestructibleObjects.png");

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.hp = 15;
        this.animations = [];

        this.state = 0; //0 = idle, 1 = hit, 2 = destroyed


        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.3; //Duration of damage animation
        this.isPlayingDamageAnimation = false;


        this.dead = false;
        this.deathAnimationTimer = 4 * 0.15;

        this.updateBB();
        this.loadAnimations();
    } 

    updateBB() {
        this.BB = new BoundingBox((this.x + 52), (this.y + 43), 30, 40);
    }

    loadAnimations() {
        //idle
        this.animations[0] = new Animator(this.spritesheet, 0, 0, 63.3, 63.3, 0.9, 0.15, false, true);

        //hit animation
        this.animations[1] = new Animator(this.spritesheet, 64, 64, 63.3, 63.3, 1.9, 0.1, false, true);

        //destroyed animation
        this.animations[2] = new Animator(this.spritesheet, 192, 64, 63.3, 63.3, 4, 0.15, false, false);
    }

    update() {
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle state
            }
        }

        // Handle death animation
        if (this.dead) {
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return;
            } else {
                // Remove barrel from world after the animation finishes
                this.removeFromWorld = true;
                return;
            }
        }

        this.updateBB();

    }

    takeDamage (attackDamage) {
        this.hp -= attackDamage;
        if(this.hp <= 0) {
            this.spawnItem();
            this.state = 2;
            this.dead = true;
        } else {
            this.state = 1;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
        }
    }

    draw(ctx) {

        //draw the shadow under barrel
        ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 49) - this.game.camera.x, (this.y + 82) - this.game.camera.y, 36, 16);

   
        //draw the barrel animation
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 2);

        ctx.strokeStyle = 'Red';

        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }


    spawnItem() {
        this.game.addEntity(new ExperienceOrb(this.game, this.BB.x - 5, this.BB.y + 20, 3));
        switch(this.drop.toLowerCase()) {
            case "onecoin":
                this.game.addEntity(new Onecoin(this.game, this.BB.x - 5, this.BB.y + 20, 3));
                break;
            case "threecoin":
                this.game.addEntity(new Threecoin(this.game, this.BB.x - 7, this.BB.y + 20, 3));
                break;
            default:
        }
    }

}
