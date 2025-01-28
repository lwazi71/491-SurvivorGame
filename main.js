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
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue-slash-flipped.png");



ASSET_MANAGER.queueDownload("./Sprites/Zombie/Zombie.png");
ASSET_MANAGER.queueDownload("./Sprites/Zombie/Zombie-Flipped.png");

ASSET_MANAGER.queueDownload("./Sprites/Cyclops/Cyclops.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghost/Ghost.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghost/Ghost-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghoul/Blue_Ghoul-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghoul/Blue_Ghoul.png")
ASSET_MANAGER.queueDownload("./Sprites/HellSpawn/Hellspawn-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/HellSpawn/Hellspawn.png")
ASSET_MANAGER.queueDownload("./Sprites/FreakyGhoul/FreakyGhoul.png")
ASSET_MANAGER.queueDownload("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Objects/collectables.png");








ASSET_MANAGER.queueDownload("./Sprites/Projectiles/arrow.png")
ASSET_MANAGER.queueDownload("./Sprites/Projectiles/Arrows_pack.png")













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
