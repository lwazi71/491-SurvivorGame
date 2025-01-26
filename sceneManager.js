class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; //this class will be this.game.camera
        this.adventurer = new Adventurer(this.game, 0, 0); //placing player character at 0, 0 in world map
        this.x = 0;
        this.y = 0;

        this.loadTestLevel();
    };



    loadTestLevel() {
        var adventurer = false;
        if(!adventurer) this.game.addEntity(this.adventurer);
        // this.game.addEntity(new Adventurer(this.game, 0, 0));
        //this.game.addEntity(new BlueGhoul(this.game, 400, 400));
        this.game.addEntity(new HellSpawn(this.game, 400, 400));
        this.game.addEntity(new HellSpawn(this.game, 800, 400));



        this.game.addEntity(new Barrel(this.game, 100, 100, false));
        this.game.addEntity(new Crate(this.game, 300, 100, false));
        this.game.addEntity(new Pot(this.game, 500, 100, false));
        this.game.addEntity(new Barrel(this.game, 100, 100, false));
        this.game.addEntity(new Crate(this.game, 100, 300, false));
        this.game.addEntity(new Pot(this.game, 100, 500, false));
        this.game.addEntity(new Crate(this.game, 300, 500, false));
        this.game.addEntity(new Barrel(this.game, 500, 500, false));
        this.game.addEntity(new Crate(this.game, 500, 300, false));




       //this.game.addEntity(new Ghost(this.game, 400, 400));
        this.game.addEntity(new Ghost(this.game, 400, 400));


        this.game.addEntity(new Zombie(this.game, 400, 400));
        this.game.addEntity(new Zombie(this.game, 200, 400));
        // this.game.addEntity(new Zombie(this.game, 300, 450));
        // this.game.addEntity(new Zombie(this.game, 130, 400));
        // this.game.addEntity(new Zombie(this.game, 323, 400));
        // this.game.addEntity(new Zombie(this.game, 513, 400));
        // this.game.addEntity(new Zombie(this.game, 42, 400));
      

        this.game.addEntity(new Cyclops(this.game, 300, 300));

    }


    update() {
        //Midpoint of the canvas
        const midPointX = PARAMS.CANVAS_WIDTH / 2 ;
        const midPointY = PARAMS.CANVAS_HEIGHT / 2 ;

        //Update camera position to middle of the player
        this.x = this.adventurer.x - midPointX + (32 * this.adventurer.scale)/2 + 20; //Hard code to add 20 because character was not yet in the middle of the canvas screen. (Was more bottom right)
        this.y = this.adventurer.y - midPointY + (32 * this.adventurer.scale)/2 + 20; //Same here
    }


    draw(ctx) {

    }

}