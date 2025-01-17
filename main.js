const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

//PLAYER ADVENTURER SPRITE SHEETS
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/WalkingUp.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/AttackUp.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/WalkingDown.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/BowLeft.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/RollLeft.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/AdventurerSprite.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/AdventurerSprite2.png");
ASSET_MANAGER.queueDownload("./Sprites/Adventurer/AdventurerSprite2Flipped.png");


ASSET_MANAGER.queueDownload("./Sprites/Objects/DestructibleObjects.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/shadow.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/red-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/red-slash-flipped.png");













ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;


	
	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;

	
	// gameEngine.addEntity(new Adventurer(gameEngine)); 
	// gameEngine.addEntity(new Barrel(gameEngine, 40, 40, false));

	//new SceneManager(gameEngine);

	gameEngine.init(ctx);

	new SceneManager(gameEngine);

	gameEngine.start();
});
