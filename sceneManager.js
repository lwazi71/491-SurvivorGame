class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; //this class will be this.game.camera
        this.x = 0;
        this.y = 0;
        this.game.camera.x = this.x;
        this.game.camera.y = this.y;
        
        this.adventurer = new Adventurer(this.game, 0, 0); //placing player character at 0, 0 in world map

        this.waveManager = new WaveManager(game);
        this.Hud = new Hud(this.game, this.adventurer);
        this.upgrade = new UpgradeSystem(this.game);
        this.shop = new Shop(this.game);
        this.enableShop = false;
        this.title = true;

        this.shakeIntensity = 0;
        this.shakeDecay = 0.9; 


        // Add the Game Map first so it's always underneath everything
        this.game.addEntity(new GameMap(this.game));

        this.deathScreen = new DeathScreen(this.game);
        this.game.addEntity(this.deathScreen);

        this.loadTestLevel();
    };



    loadTestLevel() {
        var adventurer = false;
        if(!adventurer) this.game.addEntity(this.adventurer);        
        // this.game.addEntity(new Adventurer(this.game, 0, 0));

    //     this.game.addEntity(new BlueGhoul(this.game, 400, 400));
    //     this.game.addEntity(new BlueGhoul(this.game, 400, 400));
    //     this.game.addEntity(new HellSpawn(this.game, 400, 400));
    //     this.game.addEntity(new HellSpawn(this.game, 800, 400));

    //     this.game.addEntity(new FreakyGhoul(this.game, 800, 800));
    //     this.game.addEntity(new FreakyGhoul(this.game, 300, 800));
    //     this.game.addEntity(new Ghost(this.game, 400, 400));
    //     this.game.addEntity(new Ghost(this.game, 400, 400));


    //     this.game.addEntity(new Zombie(this.game, 400, 400));
    //     this.game.addEntity(new Zombie(this.game, 200, 400));
    //     this.game.addEntity(new Zombie(this.game, 300, 450));
    //     this.game.addEntity(new Zombie(this.game, 130, 400));
    //     this.game.addEntity(new Zombie(this.game, 323, 400));
    //     this.game.addEntity(new Zombie(this.game, 513, 400));
    //     this.game.addEntity(new Zombie(this.game, 42, 400));
    //      this.game.addEntity(new BanditNecromancer(this.game, 42, 400));
    //     this.game.addEntity(new Necromancer(this.game, 42, 400));
    //     this.game.addEntity(new Imp(this.game, 42, 400));

    //     this.game.addEntity(new RatMage(this.game, 200, 400));
    //     this.game.addEntity(new FoxMage(this.game, 200, 400));
    //     this.game.addEntity(new Crow(this.game, 200, 400));
    //     this.game.addEntity(new Slime(this.game, 200, 400));
    //     this.game.addEntity(new Boar(this.game, 200, 400));
    //     this.game.addEntity(new Wizard(this.game, 200, 200));
    //     this.game.addEntity(new Goblin(this.game, 200, 200));
    //     this.game.addEntity(new Cyclops(this.game, 200, 400));
    //     this.game.addEntity(new Minotaur(this.game, 200, 400));
    //     this.game.addEntity(new GoblinMech(this.game, 200, 400));

    //      this.game.addEntity(new Boss1(this.game, 200, 400));
    //     this.game.addEntity(new GolemMech(this.game, 200, 200));
    //    this.game.addEntity(new Boss3(this.game, 200, 200));
       //this.game.addEntity(new PortalDoor(this.game, 100, 100));



        this.game.addEntity(this.generateObject("Barrel", 100, 100));
        this.game.addEntity(this.generateObject("Crate", 300, 100));
        this.game.addEntity(this.generateObject("Pot", 500, 100));
        this.game.addEntity(this.generateObject("Barrel", 200, 100));
        this.game.addEntity(this.generateObject("Crate", 100, 300));
        this.game.addEntity(this.generateObject("Pot", 100, 500));
        this.game.addEntity(this.generateObject("Crate", 300, 500));
        this.game.addEntity(this.generateObject("Barrel", 500, 500));
        this.game.addEntity(this.generateObject("Crate", 500, 300));

        //find a better way to do this.
        this.game.addEntity(new Sign(this.game, 20, 20, 
            "KeyBoard Controls:      - Move using WASD              - Attack using left click " +                
            "                    - Right click on item 1 to use close Range AOE                   - Switch weapons using 1 and 2 (Sword is 1 and Bow is 2)" + 
            "                - To roll press shift (Will give invincibility frames          - Press e to place bomb down" +
            "                    - Right click on bow item to use long-ranged AOE"));

        this.game.addEntity(new Sign(this.game, 220, 20, 
            "KeyBoard Controls (cont):                  - Press f for Dark-bolt ability (will slow down enemies if hit and be in random places around character"));

        this.game.addEntity(new Sign(this.game, 420, 20, 
            "Cool Combos:                  - Slashing your arrow in mid air will double the arrow speed and damage                          " +
                "- Putting a bomb down, you can slash it towards enemies                      " + 
                "- Striking lightning down on dark-bolt will create an explosion that'll do ALOT of damage"));
        
      

        //this.game.addEntity(new GameMap(this.game));
    }

    triggerDeathScreen() {
        this.deathScreen.trigger();
    }
    

    respawn() {
        this.deathScreen.respawn();
    }

    generateObject(object, x, y) {
        //random generator
        var pool = ["onecoin", "threecoin", "nothing"];
        console.log(object);

        if (object == "Barrel") {
            console.log("test");
            return new Barrel(this.game, x, y, pool[randomInt(pool.length)]);
        } else if (object == "Crate") {
            return new Crate(this.game, x, y, pool[randomInt(pool.length)]);
        } else {
            return new Pot(this.game, x, y, pool[randomInt(pool.length)]);    
        }
    }


    update() {
        PARAMS.DEBUG = document.getElementById("debug").checked;
        // PARAMS.CHEATS = document.getElementById("cheats").checked;
        //Midpoint of the canvas
        const midPointX = PARAMS.CANVAS_WIDTH / 2 ;
        const midPointY = PARAMS.CANVAS_HEIGHT / 2 ;

        //Update camera position to middle of the player
        this.x = this.adventurer.x - midPointX + (this.adventurer.bitSize * this.adventurer.scale)/2; //Removed + 20 here if we find a glitch.
        this.y = this.adventurer.y - midPointY + (this.adventurer.bitSize * this.adventurer.scale)/2; 
        if (this.game.keys["p"]) {// && PARAMS.CHEATS
            this.game.addEntity(new ExperienceOrb(this.game, this.game.adventurer.x, this.game.adventurer.y));
            this.game.keys["p"] = false;
        }
        
        if (this.shakeIntensity > 0) {
            this.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay; 
        }

        this.waveManager.update();

       
    }

    /**
     * Method used to initialize shakeIntensity to shake the camera.
     */
    cameraShake(intensity) {
        this.shakeIntensity = intensity;
    }

    draw(ctx) {
        // Sort entities by entityOrder (lower values are drawn first)
        //this.game.entities.sort((a, b) => a.entityOrder - b.entityOrder);
    
        // Draw all entities
        // for (let entity of this.game.entities) {
        //     entity.draw(ctx);
        // }
    
        // Draw UI text
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        if (!this.game.adventurer.dead) {
            this.Hud.update();
            this.Hud.draw(ctx);
        }
        if(this.enableShop) {
            this.game.shopPause = true;
            this.enableShop = false;
        }
    }
    

}
class Title {
    constructor(game) {
        Object.assign(this, {game});
    }
    update() {

    }
    draw(ctx) {

    }
}