class HealthBar {
    constructor(entity, game) {
        Object.assign(this, { entity, game});
    };

    update() {
       
    };

    draw(ctx) {
        var ratio = this.entity.health / this.entity.maxHealth;
        if (ratio < 0) ratio = 0;
        let x = this.entity.x - this.game.camera.x + 32;
        let y = this.entity.y - this.game.camera.y + 96;
        ctx.strokeStyle = "Black";
        ctx.fillStyle = ratio < 0.2 ? "Red" : ratio < 0.5 ? "Yellow" : "Green";
        ctx.fillRect(x - 10, y, 20 * 2 * ratio, 6);
        ctx.strokeRect(x - 10, y, 20 * 2, 6);

        ctx.font = '15px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 

        ctx.fillText(`HP : ${this.entity.health} / ${this.entity.maxHealth}`, x, y + 20);
        ctx.strokeText(`HP : ${this.entity.health} / ${this.entity.maxHealth}`, x, y + 20);

        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
    };
};