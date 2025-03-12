class Rock {
    constructor(game, x, y, facing, target) {
        Object.assign(this, {game, x, y, facing, target})
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Projectiles/rock.png");

        let dist = getDistance(this, this.target);
        this.speed = 1000;
        this.velocity = {x: (this.target.x - this.x) / dist * this.speed, y : (this.target.y - this.y) / dist * this.speed};


        this.updateBB();
        this.animations = [];
        this.loadAnimations();
        
    };
    loadAnimations() {
        for (var i = 0; i < 1; i++) {
            this.animations.push([]);
        }
        
        this.animations[0] = new Animator(this.spritesheet, 0,0, 16, 15, 1, 1, 0, false, true);
    };
    updateBB() {
        this.BB = new BoundingBox(this.x+8, this.y+8, 16*2, 16*2);
    };
    update() {
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        this.updateBB();
    };
    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    };
};