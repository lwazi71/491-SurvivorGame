const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./Sprites/Mobs/Blue Ghoul/Shardsoul Slayer Sprite Sheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Mobs/Freaky Ghoul/Ghoul Sprite Sheet.png");

ASSET_MANAGER.downloadAll(() => {
    console.log("Assets downloaded. Initializing game...");

    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    const blueGhoul = new Ghoul(gameEngine);
    gameEngine.addEntity(blueGhoul);

    const freakyGhoul = new FreakyGhoul(gameEngine);
    gameEngine.addEntity(freakyGhoul);

    gameEngine.init(ctx);
    gameEngine.start();

    console.log("Game started successfully!");
});
