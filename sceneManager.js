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
        this.game.addEntity(new Barrel(this.game, 100, 100, false));

        this.game.addEntity(new Zombie(this.game, 400, 400));
    }


    update() {
        //Midpoint of the canvas
        const midPointX = PARAMS.CANVAS_WIDTH / 2 ;
        const midPointY = PARAMS.CANVAS_HEIGHT / 2 ;

        //Update camera position to middle of the player
        this.x = this.adventurer.x - midPointX + (32 * 2.8)/2 + 20; //Hard code to add 25 because character was not yet in the middle of the canvas screen. (Was more bottom right)
        this.y = this.adventurer.y - midPointY + (32 * 2.8)/2 + 20; //Same with 15
    }


    draw(ctx) {

    }

}