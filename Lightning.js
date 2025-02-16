class Lightning {
    constructor (game, x, y, damage, knockback, source, scale, mouseX, mouseY, lightningOption) {
        Object.assign(this, { game, x, y, damage, knockback, source, scale, mouseX, mouseY, lightningOption});

        if (this.lightningOption == 0) {
            this.x = this.x - (64 * this.scale) / 2;
            this.y = this.y - (128 * this.scale) / 1.2;
    
            this.animation = new Animator(
                ASSET_MANAGER.getAsset("./Sprites/Magic/Lightning.png"),
                0, 0, 64, 128, 10, 0.08, false, false
            );

            this.circle = new CircleAOE(
                this.game, this.mouseX, this.mouseY, null, null, this.scale,
                this.damage, this.knockback, this, true, 
                0, 0, 64, 128, 5, 0.1, false, true
            );

            this.lifespan = 10 * 0.08;  //10 * 0.05 is frameDuration * frameCount
        } else if (this.lightningOption == 1) {
            this.x = this.x - (64 * this.scale) / 2;
            this.y = this.y - (88 * this.scale) / 2;

            this.animation = new Animator(
                ASSET_MANAGER.getAsset("./Sprites/Magic/Dark-Bolt.png"),
                0, 0, 64, 88, 11, 0.08, false, false
            );

            this.circle = new CircleAOE(
                this.game, 
                this.x + (31 * this.scale),
                this.y + (60 * this.scale), // Add the height * scale to position at bottom
                null, null, this.scale,
                this.damage, this.knockback, this, true, 
                0, 0, 64, 88, 5, 0.1, false, true
            );

            this.lifespan = 11 * 0.08;
        } else {
            console.log("invalid lightning option");
        }


        this.elapsedTime = 0;
        this.circleSpawned = false;  // Add this flag
        this.entityOrder = 98;
    }

    update() {
        this.elapsedTime += this.game.clockTick;

        //if we've reached 0.3 seconds and haven't spawned the circle yet, we'll spawn in circleAOE
        if (this.elapsedTime >= 0.3 && !this.circleSpawned) {
            if (this.lightningOption == 0) {
                this.game.addEntity(this.circle);
            } else if (this.lightningOption == 1) {
                this.game.addEntity(this.circle);
            }
            this.game.camera.cameraShake(40);
            this.circleSpawned = true;
        }

        // Remove when animation completes
        if (this.elapsedTime >= this.lifespan) {
            this.removeFromWorld = true;
        }


    }


    draw(ctx) {
        this.animation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x - this.game.camera.x,
            this.y - this.game.camera.y,
            this.scale
        );
    }
}