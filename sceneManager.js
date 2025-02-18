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
        this.HUD = new HUD(this.game, this.adventurer);
        this.upgrade = new UpgradeSystem(this.game);

        this.shakeIntensity = 0;
        this.shakeDecay = 0.9; 

        this.loadTestLevel();
    };



    loadTestLevel() {
        var adventurer = false;
        if(!adventurer) this.game.addEntity(this.adventurer);        
        // this.game.addEntity(new Adventurer(this.game, 0, 0));

        // this.game.addEntity(new BlueGhoul(this.game, 400, 400));
        // this.game.addEntity(new BlueGhoul(this.game, 400, 400));
        // this.game.addEntity(new HellSpawn(this.game, 400, 400));
        // this.game.addEntity(new HellSpawn(this.game, 800, 400));

        // this.game.addEntity(new FreakyGhoul(this.game, 800, 800));
        // this.game.addEntity(new FreakyGhoul(this.game, 300, 800));



        // this.game.addEntity(new Ghost(this.game, 400, 400));
        // this.game.addEntity(new Ghost(this.game, 400, 400));


        // this.game.addEntity(new Zombie(this.game, 400, 400));
        // this.game.addEntity(new Zombie(this.game, 200, 400));
        // this.game.addEntity(new Zombie(this.game, 300, 450));
        // this.game.addEntity(new Zombie(this.game, 130, 400));
        // this.game.addEntity(new Zombie(this.game, 323, 400));
        // this.game.addEntity(new Zombie(this.game, 513, 400));
        // this.game.addEntity(new Zombie(this.game, 42, 400));
        // this.game.addEntity(new BanditNecromancer(this.game, 42, 400));
        // this.game.addEntity(new Necromancer(this.game, 42, 400));
        // this.game.addEntity(new Imp(this.game, 42, 400));

        // this.game.addEntity(new RatMage(this.game, 200, 400));
        // this.game.addEntity(new FoxMage(this.game, 200, 400));
        // this.game.addEntity(new Crow(this.game, 200, 400));
        // this.game.addEntity(new Slime(this.game, 200, 400));
        // this.game.addEntity(new Boar(this.game, 200, 400));
        // this.game.addEntity(new Wizard(this.game, 200, 200));
        // this.game.addEntity(new Goblin(this.game, 200, 200));
        // this.game.addEntity(new Cyclops(this.game, 200, 400));
        // this.game.addEntity(new Minotaur(this.game, 200, 400));
        // this.game.addEntity(new GoblinMech(this.game, 200, 400));

        this.game.addEntity(new Boss1(this.game, 200, 400));


        // this.game.addEntity(this.generateObject("Barrel", 100, 100));
        // this.game.addEntity(this.generateObject("Crate", 300, 100));
        // this.game.addEntity(this.generateObject("Pot", 500, 100));
        // this.game.addEntity(this.generateObject("Barrel", 200, 100));
        // this.game.addEntity(this.generateObject("Crate", 100, 300));
        // this.game.addEntity(this.generateObject("Pot", 100, 500));
        // this.game.addEntity(this.generateObject("Crate", 300, 500));
        // this.game.addEntity(this.generateObject("Barrel", 500, 500));
        // this.game.addEntity(this.generateObject("Crate", 500, 300));

        //find a better way to do this.
        this.game.addEntity(new Sign(this.game, 20, 20, 
            "KeyBoard Controls:      - Move using WASD              - Attack using left click " +                
            "                    - Use Ultimate AOE using x                    - Switch weapons using 1 and 2 (Sword is 1 and Bow is 2)" + 
            "                - To roll press shift (Will give invincibility frames          - Press e to place bomb down" +
            "                    - Right click to strike down lightning"));

        this.game.addEntity(new Sign(this.game, 220, 20, 
            "KeyBoard Controls (cont):                  - Press f for Dark-bolt ability (will slow down enemies if hit and be in random places around character"));

        this.game.addEntity(new Sign(this.game, 420, 20, 
            "Cool Combos:                  - Slashing your arrow in mid air will double the arrow speed and damage                          " +
                "- Putting a bomb down, you can slash it towards enemies                      " + 
                "- Striking lightning down on dark-bolt will create an explosion that'll do ALOT of damage"));
        
      

    //     this.game.addEntity(new Cyclops(this.game, 300, 300));

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
        //Midpoint of the canvas
        const midPointX = PARAMS.CANVAS_WIDTH / 2 ;
        const midPointY = PARAMS.CANVAS_HEIGHT / 2 ;

        //Update camera position to middle of the player
        this.x = this.adventurer.x - midPointX + (this.adventurer.bitSize * this.adventurer.scale)/2 + 20; //Hard code to add 20 because character was not yet in the middle of the canvas screen. (Was more bottom right)
        this.y = this.adventurer.y - midPointY + (this.adventurer.bitSize * this.adventurer.scale)/2 + 20; //Same here
        if (this.game.keys["p"]) {
            this.game.addEntity(new ExperienceOrb(this.game, this.game.adventurer.x, this.game.adventurer.y));
            this.game.keys["p"] = false;
        }
        
        if (this.shakeIntensity > 0) {
            this.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay; 
        }

       // this.waveManager.update();

       
    }

    /**
     * Method used to initialize shakeIntensity to shake the camera.
     */
    cameraShake(intensity) {
        this.shakeIntensity = intensity;
    }

    draw(ctx) {
     //   this.waveManager.draw(ctx); //to tell us how many zombies are on screen and waves
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        // ctx.fillText(`Player Health: ${this.adventurer.health}`, 10, 120);
        // ctx.fillText(`Player Coins: ${this.adventurer.coins}`, 10, 150);

        ctx.fillText(`Player Dark Bolts: ${this.adventurer.boltCurrentAmount}`, 10, 180);
        ctx.fillText(`Player Bolts Cooldown: ${Math.ceil(this.adventurer.boltCooldownRetrieveTimer * 100) / 100}`, 10, 210);
        this.HUD.update();
        this.HUD.draw(ctx);
    }

}