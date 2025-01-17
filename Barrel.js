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

        //hit
        this.animations[1] = new Animator(this.spritesheet, 0, 64, 64, 64, 3, 0.1,false, true);

        //destroyed
        this.animations[2] = new Animator(this.spritesheet, 192, 64, 64, 64, 4, 0.15, false, false);
            
    }

    update() {
        this.updateBB();
    }

    draw(ctx) {
        //draw the shadow
        // ctx.globalAlpha = 0.6; // change opacity
        // ctx.drawImage(this.shadow, 0, 0, 64, 32, this.x - this.game.camera.x + 12, this.y - this.game.camera.y + 44, 32, 16);
        // ctx.globalAlpha = 1;
        // this.animations[this.state].drawFrame(this.game.clockTick, ctx, 
        //     this.x - this.offset - this.game.camera.x, this.y - this.offset - this.game.camera.y, this.scale);
        // //this.hp.draw();
        // if (PARAMS.debug) {
        //     this.bound.draw();
        // }

        ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 7) - this.game.camera.x, (this.y + 34) - this.game.camera.y, 36, 16);

   

        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 2);

        ctx.strokeStyle = 'Red';

        ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }

    spawnItem() {
        switch(this.drop.toLowerCase()) {
            case "fayere":
                this.game.addEntity(new Fayere(this.game, this.bound.x, this.bound.y)); //Offset with sprite size.
                break;
            case "red":
                this.game.entities.splice(this.game.entities.length - 1, 0, new Potion(this.game, this.bound.x+5, this.bound.y, 0));;
                break;
            case "blue":
                this.game.addEntity(new Potion(this.game, this.bound.x+5, this.bound.y, 1));
                break;
            case "sred":
                this.game.addEntity(new Potion(this.game, this.bound.x+5, this.bound.y, 2));
                break;
            case "sblue":
                this.game.addEntity(new Potion(this.game, this.bound.x+5, this.bound.y, 3));
                break;
            case "onecoin":
                this.game.addEntity(new Onecoin(this.game, this.bound.x+5, this.bound.y, 3));
                break;
            case "threecoin":
                this.game.addEntity(new Threecoin(this.game, this.bound.x+5, this.bound.y, 3));
                break;
            default:
        }
    }

}
