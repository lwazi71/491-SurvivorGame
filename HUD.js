class HUD {
    constructor(game, adventurer) {
        Object.assign(this, {game, adventurer});

        // this.minimap = new Minimap(this.game, PARAMS.CANVAS_WIDTH - 210, 10);
        this.weaponIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/weapons.png");
        this.heroIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/AdventurerSpriteHud2.png");
        this.coinIcon = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");

        this.scale = 2;
        // this.weaponIconX = PARAMS.CANVAS_WIDTH - 32 * this.scale - 10; 
        // this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - 20;
        this.weaponIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale - 48; 
        this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - 20;
        this.healthBarLength = 300;
        this.healthBarHeight = 25;

        this.ultIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale + 48;

        this.coinScale = 4;

        this.heroIconScale = 7;
        this.heroIconLength = 16;
        this.heroIconHeight = 16;
        this.heroIconX = 10;
        // this.heroIconY = PARAMS.CANVAS_HEIGHT - 16 * this.heroIconScale - 10;
        this.heroIconY = 10;
        this.heroanimation = new Animator(this.heroIcon, 0, 0, this.heroIconLength, this.heroIconHeight, 12.9, 0.2, false, true);

        this.experienceBarLength = 180; //375
        this.experienceBarHeight = 25;
        this.experienceBarX = (PARAMS.CANVAS_WIDTH / 2) - (this.experienceBarLength / 2);
        this.experienceBarY = PARAMS.CANVAS_HEIGHT - this.experienceBarHeight - 100;
    };
    update() {

    };
    draw(ctx) {

        //Hero Icon
        let circleX = this.heroIconX + (this.heroIconLength * this.heroIconScale / 2);
        let circleY = this.heroIconY + (this.heroIconHeight * this.heroIconScale / 2);
        let circleRadius = (this.heroIconHeight / 2) * this.heroIconScale;

        ctx.beginPath();
        ctx.fillStyle = 'Brown'
        ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
        ctx.fill();

        this.heroanimation.drawFrame(this.game.clockTick, ctx, this.heroIconX, this.heroIconY, this.heroIconScale);

        ctx.beginPath();
        ctx.strokeStyle = 'Black'
        ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.lineWidth = 1; //Reset line width

        let meleeLevel = 0; //could be weapon level depending on design
        // let rangedLevel = 0;
        let weaponType = this.adventurer.currentWeapon; // 0 for sword, 1 for bow
        let weaponCD = (this.adventurer.attackCooldown - this.adventurer.attackCooldownTimer) / this.adventurer.attackCooldown;
        if (weaponType == 1) {         //Can change depending on weapon
            weaponCD = (this.adventurer.shootCooldown - this.adventurer.shootCooldownTimer) / this.adventurer.shootCooldown
        }

        let ultCD = (this.adventurer.magicCooldown - this.adventurer.magicCooldownTimer) / this.adventurer.magicCooldown;

        let healthRatio = this.adventurer.health / this.adventurer.maxhealth;
        let stamina = (this.adventurer.rollCooldown - this.adventurer.rollCooldownTimer) / this.adventurer.rollCooldown;
        let experience = this.adventurer.experience / this.adventurer.experienceToNextLvl;

        if (healthRatio < 0) healthRatio = 0;         //Sometimes, math doesn't math and breaks the thing
        if (stamina > 1) stamina = 1;
        if (weaponCD > 1) weaponCD = 1;

        //Health Bar
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY - 30, this.healthBarLength, this.healthBarHeight, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();
        

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY - 30, this.healthBarLength * healthRatio, this.healthBarHeight, [5]);
        ctx.fillStyle = healthRatio < 0.2 ? rgb(150, 0, 0) : healthRatio < 0.5 ? rgb(190, 180, 0) : rgb(0, 110, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY - 30, this.healthBarLength, this.healthBarHeight, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Health Text
        let healthX = circleX + circleRadius + 10 + this.healthBarLength / 2;
        let healthY = circleY - 17.5;

        ctx.font = '20px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 

        ctx.fillText(`HP : ${this.adventurer.health} / ${this.adventurer.maxhealth}`, healthX, healthY);
        ctx.strokeText(`HP : ${this.adventurer.health} / ${this.adventurer.maxhealth}`, healthX, healthY);


        // Roll Cooldown
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY + 3, this.healthBarLength * 0.75, this.healthBarHeight / 2, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();

        if (stamina == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY + 3, this.healthBarLength * stamina * 0.75, this.healthBarHeight / 2, [5]);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY + 3, this.healthBarLength * 0.75, this.healthBarHeight / 2, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        // WeaponIcons
        ctx.beginPath();
        ctx.roundRect(this.weaponIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fill();

        ctx.drawImage(this.weaponIcon, 
            0 + 32 * meleeLevel, weaponType * 32, 
            32, 32, 
            this.weaponIconX, this.weaponIconY, 
            32 * this.scale, 32 * this.scale
        );

        if (weaponCD == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.beginPath();
        ctx.roundRect(this.weaponIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * weaponCD, 10, [5]);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.weaponIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Coin Icon
        ctx.drawImage(this.coinIcon, 
            10, 140, 
            14, 14, 
            circleX + circleRadius -4, circleY + 10, 
            14 * this.coinScale, 14 * this.coinScale
        );

        ctx.font = '24px Lilita One';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';

        ctx.textAlign = "left"; 
        ctx.fillText(`${this.adventurer.coins}`, circleX + circleRadius + 36, circleY + 32);
        ctx.strokeText(`${this.adventurer.coins}`, circleX + circleRadius + 36, circleY + 32);
        // ctx.fillText("10", circleX + circleRadius + 48, circleY + 32);
        // ctx.strokeText("10 ", circleX + circleRadius + 50, circleY + 32);

        //Experience Bar
        ctx.beginPath();
        ctx.roundRect(this.experienceBarX, this.experienceBarY, this.experienceBarLength, this.experienceBarHeight, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.experienceBarX, this.experienceBarY, this.experienceBarLength * experience, this.experienceBarHeight, [5]);
        ctx.fillStyle = 'Green';
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.experienceBarX, this.experienceBarY, this.experienceBarLength, this.experienceBarHeight, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();


        //Experience Text
        ctx.font = '20px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        
        // ctx.fillText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        // ctx.strokeText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);

        ctx.font = '24px Lilita One';
        ctx.fillText(`Level ${this.adventurer.level}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY - 12.5);
        ctx.strokeText(`Level ${this.adventurer.level}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY - 12.5);
        ctx.font = '20px Lilita One';
        ctx.fillText(`Exp : ${this.adventurer.experience} / ${this.adventurer.experienceToNextLvl}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        ctx.strokeText(`Exp : ${this.adventurer.experience} / ${this.adventurer.experienceToNextLvl}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        

        //Ult magic thing
        ctx.beginPath();
        ctx.roundRect(this.ultIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fill();

            //Ult image here

        ctx.beginPath();
        if (ultCD == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.roundRect(this.ultIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * ultCD, 10, [5]); // 32 offset from image
        
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.ultIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Temp stuff
        
        // ctx.beginPath();
        // ctx.roundRect((PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale + 145 - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        // ctx.fillStyle = rgba(0,0,0, 0.5);
        // ctx.fill();

        // ctx.beginPath();
        // ctx.roundRect((PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale - 145 - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        // ctx.fillStyle = rgba(0,0,0, 0.5);
        // ctx.fill();

        // this.minimap.draw(ctx);
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
        
    };
};

class Minimap {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
    };
    update() {

    };
    draw(ctx) {
        ctx.strokeStyle = "Black";
        ctx.strokeRect(this.x, this.y, 200, 200);
        this.game.adventurer.drawMinimap(ctx, this.x, this.y);
        // for (var i = 0; i < this.game.entities.length; i++) {
        //     this.game.entities[i].drawMinimap(ctx, this.x, this.y);
        // }
    };
};