class GreenGhoul {
    constructor(game) {
        this.game = game;
        this.animator = new Animator(ASSET_MANAGER.getAsset("./Sprites/monster1.png"),6,0,56,108,8,0.2);
};

update() {

};

draw(ctx) {
  this.animator.drawFrame(this.game.clockTick,ctx,25,25);
};
}

