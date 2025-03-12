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
ASSET_MANAGER.queueDownload("./Sprites/Objects/shopIcons.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/red-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/red-slash-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue-slash-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/green-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/green-slash-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/yellow-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/yellow-slash-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue2-slash.png");
ASSET_MANAGER.queueDownload("./Sprites/Slash/blue2-slash-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/magic.png");




ASSET_MANAGER.queueDownload("./Sprites/Zombie/Zombie.png");
ASSET_MANAGER.queueDownload("./Sprites/Zombie/Zombie-Flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Cyclops/Cyclops.png")
ASSET_MANAGER.queueDownload("./Sprites/Projectiles/rock.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghost/Ghost.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghost/Ghost-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghoul/Blue_Ghoul-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Ghoul/Blue_Ghoul.png")
ASSET_MANAGER.queueDownload("./Sprites/HellSpawn/Hellspawn-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/HellSpawn/Hellspawn.png")
ASSET_MANAGER.queueDownload("./Sprites/FreakyGhoul/FreakyGhoul.png")
ASSET_MANAGER.queueDownload("./Sprites/FreakyGhoul/FreakyGhoul-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Necromancer/BanditNecromancer-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Necromancer/BanditNecromancer.png")
ASSET_MANAGER.queueDownload("./Sprites/Necromancer/Necromancer.png")
ASSET_MANAGER.queueDownload("./Sprites/Necromancer/Necromancer-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Mages/RatMage.png")
ASSET_MANAGER.queueDownload("./Sprites/Mages/RatMage-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Mages/FoxMage.png")
ASSET_MANAGER.queueDownload("./Sprites/Mages/FoxMage-Flipped.png")
ASSET_MANAGER.queueDownload("./Sprites/Mages/Imp.png")
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_idle.png")
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_attack.png")
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_walk.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_damage.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_idle-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_idle.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_walk-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_attack-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_damage-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Crow/crow_death2.png");
ASSET_MANAGER.queueDownload("./Sprites/Minotaur/Minotaur.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/GoblinMech.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/GoblinMech-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Slime/slime.png");
ASSET_MANAGER.queueDownload("./Sprites/Boar/boar.png");
ASSET_MANAGER.queueDownload("./Sprites/Boar/boar-flipped.png");

ASSET_MANAGER.queueDownload("./Sprites/Wizard/Idle.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Walk.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Cast.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Hurt.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Idle-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Walk-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Cast-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Hurt-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Wizard/Dead.png");

ASSET_MANAGER.queueDownload("./Sprites/Goblin/Idle.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Run.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Attack.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Hurt.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Idle-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Run-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Attack-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Hurt-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Goblin/Death.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/GoblinKing.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/GoblinKing-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/CoinBag.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/GolemMech.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/GolemMech-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/arm_projectile.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/ATTACK.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/FLYING.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/HURT.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/ATTACK-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/FLYING-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/HURT-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/projectile.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/DEATH.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/FlyingDemon/IDLE.png");

ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/idle.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/idle-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/attacking.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/attacking-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/casting.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/casting-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/skill.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/skill-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/death.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/death-flipped.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/summonDeath.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/summonIdle.png");
ASSET_MANAGER.queueDownload("./Sprites/Boss/Executioner/summonEmerge.png");






ASSET_MANAGER.queueDownload("./Sprites/Magic/PurpleProjectile.png")
ASSET_MANAGER.queueDownload("./Sprites/Magic/BlackProjectile.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/GreenProjectile.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/FireProjectile.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/spark.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/spark-blue.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/spark-black.png");
ASSET_MANAGER.queueDownload("./Sprites/Explosion/explosion.png")
ASSET_MANAGER.queueDownload("./Sprites/Explosion/explosion2.png")
ASSET_MANAGER.queueDownload("./Sprites/Explosion/explosion3.png")
ASSET_MANAGER.queueDownload("./Sprites/Explosion/explosion4.png")
ASSET_MANAGER.queueDownload("./Sprites/Magic/Lightning.png");
ASSET_MANAGER.queueDownload("./Sprites/Magic/Dark-Bolt.png");




ASSET_MANAGER.queueDownload("./Sprites/Objects/collectables.png");

ASSET_MANAGER.queueDownload("./Sprites/Objects/ExperienceOrb.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/Boss1Hud.png");

ASSET_MANAGER.queueDownload("./Sprites/HudIcons/Boss2Hud.png");

ASSET_MANAGER.queueDownload("./Sprites/HudIcons/boss4Hud_32x32.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/boss4Hud_48x48.png");

ASSET_MANAGER.queueDownload("./Sprites/HudIcons/weapons.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/AdventurerSpriteHud.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/AdventurerSpriteHud2.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/pointer.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/AdventurerSpriteTransition.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/AdventurerSpriteTransition2.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/PlayerBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/shopBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/HudIcons/stars.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/spotlight.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/brokenheart.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/glow.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/warning.png");
ASSET_MANAGER.queueDownload("./Sprites/Objects/portal.png");





ASSET_MANAGER.queueDownload("./Sprites/Projectiles/arrow.png")
ASSET_MANAGER.queueDownload("./Sprites/Projectiles/Arrows_pack.png")
ASSET_MANAGER.queueDownload("./Sprites/Map/level1.png");
ASSET_MANAGER.queueDownload("./Sprites/Map/level2.png");
ASSET_MANAGER.queueDownload("./Sprites/Map/level3.png");
ASSET_MANAGER.queueDownload("./Sprites/Map/level4.png");

//Audio
//Music
ASSET_MANAGER.queueDownload("./Audio/Music/Survivorio Clone Battle Song (1).wav");
ASSET_MANAGER.queueDownload("./Audio/Music/Jungle.mp3");
ASSET_MANAGER.queueDownload("./Audio/Music/devil_music.mp3");
ASSET_MANAGER.queueDownload("./Audio/Music/spooky.mp3");
ASSET_MANAGER.queueDownload("./Audio/Music/Death.wav");
ASSET_MANAGER.queueDownload("./Audio/Music/Win.wav");
ASSET_MANAGER.queueDownload("./Audio/Music/Shop Music.mp3");
ASSET_MANAGER.queueDownload("./Audio/Music/minecraftmenumusic.mp3");

//Sfx
//boss1
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss1 Coin Attack.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss1 Jumping.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss1 summon.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss1 death.wav");

//boss2
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss2 Arm Launch.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss2 Death.wav");
//boss3
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss3 death.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss3 idle.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss3 ranged attacks.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss3 fire.wav");
//boss4
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 attack.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 idle.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 death.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 summon.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 ranged attack.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/boss4 charging.wav");

//Common enemies
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Enemy damage.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Enemy magic attack.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Enemy melee bite.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Enemy melee punch.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Rock Throw.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Portal Open.wav");

//Player sounds
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Dodge.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Healing.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/LevelUp.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/coinCollecting.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/ExperienceOrb.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Chest open.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Bomb Placing.wav");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Arrows.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/FireBall.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/LightningStrike.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Audio_Music_Slash.mp3");

//UI sounds
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Back.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Hover.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Pause.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Select.mp3");
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Unpause.mp3");

//Player sounds
ASSET_MANAGER.queueDownload("./Audio/SoundEffects/Explosion.mp3");






ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	canvas.style.cursor = "crosshair";
	ASSET_MANAGER.autoRepeat("./Audio/Music/Survivorio Clone Battle Song (1).wav");
	ASSET_MANAGER.autoRepeat("./Audio/Music/Jungle.mp3");
	ASSET_MANAGER.autoRepeat("./Audio/Music/devil_music.mp3");
	ASSET_MANAGER.autoRepeat("./Audio/Music/spooky.mp3");

	ASSET_MANAGER.autoRepeat("./Audio/Music/Shop Music.mp3");
	ASSET_MANAGER.autoRepeat("./Audio/Music/minecraftmenumusic.mp3");

	PARAMS.CHEATS = false;
	// document.getElementById("btn").addEventListener("click", function() {
	// 	PARAMS.CHEATS = true;
	// });
	PARAMS.DEBUG = false;
	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;
	// gameEngine.addEntity(new Adventurer(gameEngine)); 
	// gameEngine.addEntity(new Barrel(gameEngine, 40, 40, false));

	//new SceneManager(gameEngine);

	gameEngine.init(ctx);
	new SceneManager(gameEngine);

	gameEngine.start();
});
