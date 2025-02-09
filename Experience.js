class ExperienceOrb {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        // this.x = this.x + 32;
        // this.y = this.y + 32;
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/ExperienceOrb.png");
        this.scale = 0.3;
        this.animations = new Animator(this.spritesheet, 0, 0, 64, 64, 12.9, 0.5, false, true);

        this.radius = 200;
        this.speed = 0.1;
        this.location = {x: this.x, y: this.y};
        this.pickupDistance = 10;
        this.updateBB();
    }
    updateBB() {
        this.BB = new BoundingBox(this.x, this.y, 32, 32);
    };
    update() {
        this.target = {x: this.game.adventurer.x, y: this.game.adventurer.y}; //(this.x + (this.bitSize * this.scale)/2)
        if (this.target != null && this.location != null) {
            if (this.target != this.location && getDistance(this.location, this.target) < this.radius) {
                let deltaX = this.target.x - this.location.x;
                let deltaY = this.target.y - this.location.y;
                let distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                
                this.location.x += deltaX / distance * this.speed;
                this.location.y += deltaY / distance * this.speed;
                this.speed += 0.1;
                this.x = this.location.x;
                this.y = this.location.y;
            }
            if (getDistance(this.location, this.target) < this.pickupDistance && !this.game.adventurer.dead) {
                this.game.adventurer.experience += 100; // Change value to acceptable amount
                this.game.adventurer.levelUp();
                this.removeFromWorld = true;
            }
        }
        this.updateBB();

    }

    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);


        ctx.strokeStyle = 'Green';
        ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    }
};