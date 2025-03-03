class GameMap {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./Sprites/Map/testlevel1map.png");
        this.scale = 3; // Scale the map by 10x
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
