class Pointer {
    constructor(game, entity) {
        Object.assign(this, { game, entity });

        this.pointerSpritePath = ASSET_MANAGER.getAsset("./Sprites/HudIcons/pointer.png");
        
        // Pointer properties
        this.scale = 0.3;
        this.width = 300;  // Assuming your pointer sprite is 32x32 pixels
        this.height = 300;
        this.padding = 40; // Distance from screen edge
        this.visible = false; // Only visible when target is off-screen
        this.entityOrder = 102;
    }

    update() {
        // Check if the entity still exists
        if (this.entity.removeFromWorld || this.entity.dead) {
            this.removeFromWorld = true;
            return;
        }

        // Determine if the entity is visible on screen
        const entityCenterX = this.entity.BB.x + this.entity.BB.width / 2;
        const entityCenterY = this.entity.BB.y + this.entity.BB.height / 2;
        
        // Get camera boundaries
        const cameraLeft = this.game.camera.x;
        const cameraRight = this.game.camera.x + PARAMS.CANVAS_WIDTH;
        const cameraTop = this.game.camera.y;
        const cameraBottom = this.game.camera.y + PARAMS.CANVAS_HEIGHT;
        
        // Check if entity is off-screen
        this.visible = !(
            entityCenterX >= cameraLeft &&
            entityCenterX <= cameraRight &&
            entityCenterY >= cameraTop &&
            entityCenterY <= cameraBottom
        );
    }

    draw(ctx) {
        if (!this.visible) return;
        
        // Get player's center position
        const player = this.game.adventurer;
        const playerCenterX = player.x + (player.bitSize * player.scale)/2;
        const playerCenterY = player.y + (player.bitSize * player.scale)/2;
        
        // Get entity's center position
        const entityCenterX = this.entity.BB.x + this.entity.BB.width / 2;
        const entityCenterY = this.entity.BB.y + this.entity.BB.height / 2;
        
        // Calculate direction vector from player to entity
        const dirX = entityCenterX - playerCenterX;
        const dirY = entityCenterY - playerCenterY;
        
        // Normalize the direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        const normalizedDirX = dirX / length;
        const normalizedDirY = dirY / length;
        
        // Calculate angle in radians
        const angle = Math.atan2(normalizedDirY, normalizedDirX);
        
        // Calculate position of the pointer (on the edge of the screen)
        // Canvas center coordinates relative to the camera
        const canvasCenterX = ctx.canvas.width / 2;
        const canvasCenterY = ctx.canvas.height / 2;
        
        // Calculate the point where the line from player to entity intersects with screen edge
        const screenEdgeX = canvasCenterX + Math.cos(angle) * (canvasCenterX - this.padding);
        const screenEdgeY = canvasCenterY + Math.sin(angle) * (canvasCenterY - this.padding);
        
        // Draw the pointer
        ctx.save();
        ctx.translate(screenEdgeX, screenEdgeY);
        ctx.rotate(angle);
        
        // Draw the pointer image
        ctx.drawImage(
            this.pointerSpritePath,
            0, 0, this.width, this.height,
            -this.width * this.scale / 2, -this.height * this.scale / 2,
            this.width * this.scale, this.height * this.scale
        );
        
        ctx.restore();

    }
}