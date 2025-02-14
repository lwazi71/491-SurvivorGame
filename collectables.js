class Onecoin {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingBox(this.x + 2, this.y - 2, 32, 32);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 10, 140, 14, 14, 0.9, 0.15, false, true);
    }

    update() {

    }

    draw(ctx) {
        
        
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);

        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }

}

class Threecoin {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingBox(this.x + 3, this.y - 10, 45, 45);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();

    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 38, 140, 16, 14, 0.9, 1, false, true);
    }

    update() {

    }

    draw(ctx) {
      
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }

}

class MultipleCoins {
    constructor(game, x, y, value) {
        Object.assign(this, {game, x, y, value});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingCircle(this.game, this.x+21, this.y+18, 15);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 72, 140, 15, 10, 0.9, 1, false, true);
    }

    update() {

    }

    draw(ctx) {
     
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }

}

class CoinPile {
    constructor(game, x, y, value) {
        Object.assign(this, {game, x, y, value});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingCircle(this.game, this.x+21, this.y+18, 15);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 160, 128, 32, 32, 0.9, 1, false, true);
    }

    update() {

    }

    draw(ctx) {
     
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }

}


class HealthPotion {
    constructor(game, x, y, value) {
        
    }
}