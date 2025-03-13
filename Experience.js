class ExperienceOrb {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        // this.x = this.x + 32;
        // this.y = this.y + 32;
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/ExperienceOrb.png");
        this.scale = 0.3;
        this.animations = new Animator(this.spritesheet, 0, 0, 64, 64, 13, 0.1, false, true);

        this.radius = 200;
        this.speed = 0.1;
        this.location = {x: this.x, y: this.y};
        this.pickupDistance = 20;
        this.updateBB();
    }
    updateBB() {
        this.BB = new BoundingBox(this.x, this.y, 64* this.scale, 64* this.scale);
    };
    update() {
        this.target = {x: this.game.adventurer.x + (32 * 2.8) / 2, 
                    y: this.game.adventurer.y + (32 * 2.8) / 2}; //(this.x + (this.bitSize * this.scale)/2)
        if (this.target != null && this.location != null) {
            if ((this.target != this.location && getDistance(this.location, this.target) < this.radius) ||
                (this.target != this.location && this.game.camera.bossDead)) {
                let deltaX = this.target.x - this.location.x;
                let deltaY = this.target.y - this.location.y;
                let distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                
                this.location.x += deltaX / distance * this.speed;
                this.location.y += deltaY / distance * this.speed;
                this.speed += 0.1;
                this.x = this.location.x;
                this.y = this.location.y;
            } else {
                this.speed = 0.1;
            }
            if (getDistance(this.location, this.target) < this.pickupDistance && !this.game.adventurer.dead) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/ExperienceOrb.wav");
                let expAmount = Math.floor(Math.random() * (5 - 3 + 1)) + 3; //3 - 5
                this.game.adventurer.experience += Math.round(expAmount * this.game.adventurer.expMultiplier); // Change value to acceptable amount
                this.game.adventurer.levelUp();
                this.removeFromWorld = true;
            }
        }
        this.updateBB();
    }
    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);

        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.x - this.game.camera.x, this.y - this.game.camera.y, this.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
};
class BossExperienceOrb {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        // this.x = this.x + 32;
        // this.y = this.y + 32;
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/ExperienceOrb.png");
        this.scale = 1;
        this.animations = new Animator(this.spritesheet, 0, 0, 64, 64, 13, 0.1, false, true);

        this.radius = 200 * 3;
        this.speed = 0.1;
        this.location = {x: this.x, y: this.y};
        this.pickupDistance = 20;
        this.updateBB();
    }
    updateBB() {
        this.BB = new BoundingBox(this.x, this.y, 64* this.scale, 64* this.scale);
    };
    update() {
        this.target = {x: this.game.adventurer.x + (32 * 2.8) / 2, 
                    y: this.game.adventurer.y + (32 * 2.8) / 2}; //(this.x + (this.bitSize * this.scale)/2)
        if (this.target != null && this.location != null) {
            if ((this.target != this.location && getDistance(this.location, this.target) < this.radius)) {
                let deltaX = this.target.x - this.location.x;
                let deltaY = this.target.y - this.location.y;
                let distance = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
                
                this.location.x += deltaX / distance * this.speed;
                this.location.y += deltaY / distance * this.speed;
                this.speed += 0.3;
                this.x = this.location.x;
                this.y = this.location.y;
            } else {
                this.speed = 0.1;
            }
            if (getDistance(this.location, this.target) < this.pickupDistance && !this.game.adventurer.dead) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/ExperienceOrb.wav");
                this.game.adventurer.experience += Math.round(50 * this.game.adventurer.expMultiplier); // Change value to acceptable amount
                this.game.adventurer.levelUp();
                this.removeFromWorld = true;
            }
        }
        this.updateBB();
    }
    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);

        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
    
            ctx.strokeStyle = 'Red';
            ctx.beginPath();
            ctx.arc(this.x - this.game.camera.x, this.y - this.game.camera.y, this.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
}