class Barrel {
    constructor(game, x, y, drop) { //the drop will let us know whether to drop coins, an item, or nothing
        Object.assign(this, {game, x, y, drop});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/DestructibleObjects.png");

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        

        this.animations = [];


        this.loadAnimations();
    } 

    updateBB() {
        this.BB = new BoundingBox((this.x + 14) - this.game.camera.x, (this.y + 11) - this.game.camera.y, 22, 35);
    }

    loadAnimations() {
        //idle
        this.animations[0] = new Animator(this.spritesheet, 21, 24, 32, 32, 0.9, 0.15, false, true);

        //hit animation
        this.animations[1] = new Animator(this.spritesheet, 0, 64, 64, 64, 3, 0.1,false, true);

        //destroyed animation
        this.animations[2] = new Animator(this.spritesheet, 192, 64, 64, 64, 4, 0.15, false, false);
            
    }

    update() {
        this.updateBB();
    }

    draw(ctx) {

        //draw the shadow under barrel
        ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 7) - this.game.camera.x, (this.y + 34) - this.game.camera.y, 36, 16);

   
        //draw the barrel animation
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 2);

        ctx.strokeStyle = 'Red';

        ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }

}
