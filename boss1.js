class Boss1 { //goblin king
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.health = 500;
        this.name = "tbd";
        this.state = 0; //0 = walk, 1 = attack, 2 = 
        //attack will be throwing honestly
        this.facing = 0;
        this.bitSizeX = 64;
        this.bitSizeY = 64;

        this.bossHeals = 1; //should only heal 1 time

        this.animations = [];
    }


    updateBB() {

    }


    loadAnimation() {
        //RIGHT
        
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GoblinKing.png"), 0, 0, 64, 64, 2, 0.2, false, false);
    }



    update() {


    }



    draw(ctx) {

    }
}