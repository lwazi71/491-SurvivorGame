class GameMap {
    constructor(game, map) {
        this.map = map;
        this.game = game;
        if (this.map == 1) {
            this.image = ASSET_MANAGER.getAsset("./Sprites/Map/level1.png");
            this.scale = 3.5;
        } else if (this.map == 2) { 
            this.image = ASSET_MANAGER.getAsset("./Sprites/Map/level2.png");
            this.scale = 5;
        } else if (this.map == 3) {
            this.image = ASSET_MANAGER.getAsset("./Sprites/Map/level3.png");
            this.scale = 3;
        } else if (this.map == 4) {
            this.image = ASSET_MANAGER.getAsset("./Sprites/Map/level4.png");
            this.scale = 3;
        }
        // this.scale = 5; // Scale the map by 10x
        this.entityOrder = -10; // Keep map underneath everything
    }

    update() {
        // No updates needed for a static background
    }

    draw(ctx) {
        let cam = this.game.camera;
        let canvas = ctx.canvas;

        let scaledWidth = this.image.width * this.scale;
        let scaledHeight = this.image.height * this.scale;

        let startX = -cam.x % scaledWidth;
        let startY = -cam.y % scaledHeight;

        for (let x = startX - scaledWidth; x < canvas.width; x += scaledWidth) {
            for (let y = startY - scaledHeight; y < canvas.height; y += scaledHeight) {
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, scaledWidth, scaledHeight);
            }
        }
    }
}