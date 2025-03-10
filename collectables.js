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
        this.animations[0] = new Animator(this.spritesheet, 10, 140, 14, 14, 1, 0.15, false, true);
    }

    update() {

    }

    draw(ctx) {
        
        
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
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
        this.animations[0] = new Animator(this.spritesheet, 38, 140, 16, 14, 1, 1, false, true);
    }

    update() {

    }

    draw(ctx) {
      
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }

}

class MultipleCoins {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingBox(this.x - 5, this.y - 10, 50, 50);

        this.scale = 2.8;

        this.animations = [];

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 72, 140, 15, 10, 1, 1, false, true);
    }

    update() {

    }

    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }

}

class CoinPile {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.BB = new BoundingBox(this.x - 5, this.y - 10, 160, 150);

        this.scale = 5;

        this.animations = [];

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png"); 

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 160, 128, 32, 32, 1, 1, false, true);
    }

    update() {
        
    }

    draw(ctx) {
        const shadowWidth = 150 * (this.scale / 5); // 2.6 is default scale
        const shadowHeight = 32 * (this.scale / 5);

        const shadowX = (this.x + (1 * (this.scale / 5))) - this.game.camera.x;
        const shadowY = (this.y + (110 * (this.scale / 5))) - this.game.camera.y;

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }

}


class HealthPotion {
    constructor(game, x, y, value) {
        
    }
}

//will activate a menu where player can randomly get a cool upgrade they want (similar to shop but you dont need coins)
class Chest {
    constructor (game, x, y) {  
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/DestructibleObjects.png");

        this.glow = ASSET_MANAGER.getAsset("./Sprites/Objects/glow.png");
        
        this.BB = new BoundingBox(this.x + 97, this.y + 95, 64, 64);

        this.scale = 4;

        this.animations = [];

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png"); 

        this.glowIntensity = 0.5;
        this.glowColor = '#ffeb3b'; // Yellow glow
        this.glowRadius = 30;
        this.glowTimer = 0;

        this.loadAnimations();
    }

    loadAnimations() {
        this.animations[0] = new Animator(this.spritesheet, 0, 640, 63.3, 63.3, 0.9, 0.15, false, true);

        this.glowAnim = new Animator(this.glow, 0, 64, 32, 32, 2.9, 0.1, false, true);
    }

    update() {
        
    }

    draw(ctx) {

        
        const shadowWidth = 85 * (this.scale / 4); // 2.6 is default scale
        const shadowHeight = 32 * (this.scale / 4);

        const shadowX = (this.x + (86 * (this.scale / 4))) - this.game.camera.x;
        const shadowY = (this.y + (135 * (this.scale / 4))) - this.game.camera.y;

        this.glowAnim.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x + 50, this.y - this.game.camera.y + 50, 5);
        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }
}