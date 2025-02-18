class HUD {
    constructor(game, adventurer) {
        Object.assign(this, {game, adventurer});
        this.entityOrder = 999;
        // this.minimap = new Minimap(this.game, PARAMS.CANVAS_WIDTH - 210, 10);
        this.weaponIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/weapons.png");
        this.heroIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/AdventurerSpriteHud2.png");
        this.miscIcon = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.magicIcon = ASSET_MANAGER.getAsset("./Sprites/Magic/magic.png");
        this.ultAnimation = new Animator(this.magicIcon, 0, 320, 64, 64, 9, 0.08, false, true);
        this.bombAnimation = new Animator(this.miscIcon, 0, 16, 16, 16, 4, 0.1, false, true);
        this.scale = 2;
        // this.weaponIconX = PARAMS.CANVAS_WIDTH - 32 * this.scale - 10; 
        // this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - 20;
        this.weaponIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale; // 16 half of size 32 
        // - (16 * this.scale * 2) - 20
        this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - 20;
        this.healthBarLength = 300;
        this.healthBarHeight = 25;

        this.secondaryIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
        this.BombIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;

        this.coinScale = 4;

        this.heroIconScale = 7;
        this.heroIconLength = 16;
        this.heroIconHeight = 16;
        this.heroIconX = 10;
        // this.heroIconY = PARAMS.CANVAS_HEIGHT - 16 * this.heroIconScale - 10;
        this.heroIconY = 10;
        this.heroanimation = new Animator(this.heroIcon, 0, 0, this.heroIconLength, this.heroIconHeight, 12.9, 0.2, false, true);

        this.experienceBarLength = 200; //375 174
        this.experienceBarHeight = 25;
        this.experienceBarX = (PARAMS.CANVAS_WIDTH / 2) - (this.experienceBarLength / 2);
        this.experienceBarY = PARAMS.CANVAS_HEIGHT - this.experienceBarHeight - 100;

        this.bitSize = 16;
        this.attackCount = 0;
        this.magicAdded = false;
        this.bombAdded = false;

    };
    update() {
        this.entityOrder = 999;
        this.meleeLevel = this.adventurer.swordUpgrade; //could be weapon level depending on design
        this.rangedLevel = 0;
        // let rangedLevel = 0;
        this.weaponType = this.adventurer.currentWeapon; // 0 for sword, 1 for bow
        this.weaponCD = (this.adventurer.attackCooldown - this.adventurer.attackCooldownTimer) / this.adventurer.attackCooldown;
        if (this.weaponType == 1) {         //Can change depending on weapon
            this.weaponCD = (this.adventurer.shootCooldown - this.adventurer.shootCooldownTimer) / this.adventurer.shootCooldown
        }
        this.ultCD = (this.adventurer.magicCooldown - this.adventurer.magicCooldownTimer) / this.adventurer.magicCooldown;
        this.bombCD = (this.adventurer.bombCooldown - this.adventurer.bombCooldownTimer) / this.adventurer.bombCooldown;
        this.bombRetrieveCD = (this.adventurer.bombCooldownRetrieve - this.adventurer.bombCooldownRetrieveTimer) / this.adventurer.bombCooldownRetrieve;

        this.healthRatio = this.adventurer.health / this.adventurer.maxhealth;
        this.stamina = (this.adventurer.rollCooldown - this.adventurer.rollCooldownTimer) / this.adventurer.rollCooldown;
        this.experience = this.adventurer.experience / this.adventurer.experienceToNextLvl;

        if (this.healthRatio < 0) this.healthRatio = 0;         //Sometimes, math doesn't math and breaks the thing
        if (this.stamina > 1) this.stamina = 1;
        if (this.weaponCD > 1) this.weaponCD = 1;
        if (this.ultCD > 1) this.ultCD = 1;
        if (this.bombCD > 1) this.bombCD = 1;
        if (this.bombRetrieveCD > 1) this.bombCD = 1;
    };
    draw(ctx) {
        this.entityOrder = 999;
        // Alignment center
        // ctx.beginPath();
        // ctx.moveTo(PARAMS.CANVAS_WIDTH / 5, 0);
        // ctx.lineTo(PARAMS.CANVAS_WIDTH / 5, PARAMS.CANVAS_HEIGHT);
        // ctx.closePath();
        // ctx.stroke();

        this.displayPlayerInfo(ctx);
        this.displayExperienceBar(ctx);
        this.displayWeapons(ctx);    

        // ctx.beginPath();
        // ctx.roundRect((PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale - 145 - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        // ctx.fillStyle = rgba(0,0,0, 0.5);
        // ctx.fill();

        // this.minimap.draw(ctx);
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
        
    };
    displayPlayerInfo(ctx) {
        this.entityOrder = 999;
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

        //Health Bar
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY - 30, this.healthBarLength, this.healthBarHeight, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();
        

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY - 30, this.healthBarLength * this.healthRatio, this.healthBarHeight, [5]);
        ctx.fillStyle = this.healthRatio < 0.2 ? rgb(150, 0, 0) : this.healthRatio < 0.5 ? rgb(190, 180, 0) : rgb(0, 110, 0);
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

        if (this.stamina == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY + 3, this.healthBarLength * this.stamina * 0.75, this.healthBarHeight / 2, [5]);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + 10, circleY + 3, this.healthBarLength * 0.75, this.healthBarHeight / 2, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Coin Icon
        ctx.drawImage(this.miscIcon, 
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


    }
    displayExperienceBar(ctx) {
        this.entityOrder = 999;
        //Experience Bar
        ctx.beginPath();
        ctx.roundRect(this.experienceBarX, this.experienceBarY, this.experienceBarLength, this.experienceBarHeight, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.experienceBarX, this.experienceBarY, this.experienceBarLength * this.experience, this.experienceBarHeight, [5]);
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
    }
    displayWeapons(ctx) {
        this.entityOrder = 999;
        this.checkAttacks();
        // WeaponIcons
        if ((this.adventurer.enableMagic && this.weaponType == 0)) { //|| (this.adventurer.enableBomb && this.weaponType == 1)
            let x = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
            this.secondaryIconX = x + 16 * this.scale + 15;
            this.weaponIconX = x - 16 * this.scale - 15;
        } else if (this.weaponType == 1) {
            this.weaponIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
        }
        ctx.beginPath();
        ctx.roundRect(this.weaponIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fill();
        if (this.weaponType == 1) { //If bow, use the bowUpgrade level
            this.meleeLevel = this.adventurer.bowUpgrade;
        }
        ctx.drawImage(this.weaponIcon, 
            0 + 32 * this.meleeLevel, this.weaponType * 32, 
            32, 32, 
            this.weaponIconX, this.weaponIconY, 
            32 * this.scale, 32 * this.scale
        );

        if (this.weaponCD == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.beginPath();
        ctx.roundRect(this.weaponIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * this.weaponCD, 10, [5]);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(this.weaponIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();
        
        if (this.attackCount > 0) {
            if (this.magicAdded && this.weaponType == 0) {
                //Ult magic thing
                ctx.beginPath();
                // ctx.roundRect(this.secondaryIconX - 10, this.weaponIconY - 10, 32 * this.scale, 32 * this.scale + 30, [5]);
                ctx.roundRect(this.secondaryIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
                ctx.fillStyle = rgba(0,0,0, 0.5);
                ctx.fill();

                //Ult image here
                this.ultAnimation.drawFrame(this.game.clockTick, ctx, this.secondaryIconX, this.weaponIconY, 1);
                // ctx.drawImage(this.magicIcon, 
                //     0, 320, 
                //     64, 64, 
                //     this.secondaryIconX, this.weaponIconY, 
                //     64, 64
                // );

                ctx.beginPath();
                if (this.ultCD == 1) {
                    ctx.fillStyle = rgb(250, 180, 60);
                } else {
                    ctx.fillStyle = rgb(250, 60, 60);
                }
                ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * this.ultCD, 10, [5]); // 32 offset from image
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
                ctx.strokeStyle = 'Black';
                ctx.stroke();

            //Can be used later for bow ultimate
            // } else if (this.bombAdded && this.weaponType == 1) {
            //     //Bomb stuff
            //     ctx.beginPath();
            //     ctx.roundRect(this.secondaryIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
            //     ctx.fillStyle = rgba(0,0,0, 0.5);
            //     ctx.fill();

            //     //Bomb Icon
            //     this.bombAnimation.drawFrame(this.game.clockTick, ctx, this.secondaryIconX, this.weaponIconY - 10, 4);
            //     // ctx.drawImage(this.miscIcon, 
            //     //     0, 16, //0 for unlit, 16 for lit 
            //     //     16, 16, 
            //     //     this.secondaryIconX, this.weaponIconY - 10, 
            //     //     16 * 4, 16 * 4
            //     // );

            //     //Retrieve time
            //     ctx.beginPath();
            //     if (this.bombRetrieveCD == 1) {
            //         ctx.fillStyle = rgba(0, 0, 0, 0);
            //     } else {
            //         ctx.fillStyle = rgb(250, 60, 60);
            //     }
            //     ctx.roundRect(this.secondaryIconX, this.weaponIconY, 32 * this.scale * this.bombRetrieveCD, 5, [5]); // 32 offset from image
            //     ctx.fill();

            //     //Cooldown time
            //     ctx.beginPath();
            //     if (this.bombCD == 1 && this.adventurer.bombCurrentAmnt > 0) {
            //         ctx.fillStyle = rgb(250, 180, 60);
            //     } else {
            //         ctx.fillStyle = rgb(250, 60, 60);
            //     }
            //     ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * this.bombCD, 10, [5]); // 32 offset from image
            //     ctx.fill();

            //     ctx.beginPath();
            //     ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
            //     ctx.strokeStyle = 'Black';
            //     ctx.stroke();
            //     if (this.adventurer.bombCurrentAmnt < 5 && this.adventurer.bombCurrentAmnt > 0) ctx.fillStyle = "White";
            //     ctx.font = '20px Lilita One';
            //     ctx.fillText(`x${this.adventurer.bombCurrentAmnt}`, this.secondaryIconX + 50, this.weaponIconY + 32 * this.scale - 10);
            //     ctx.strokeText(`x${this.adventurer.bombCurrentAmnt}`, this.secondaryIconX + 50, this.weaponIconY + 32 * this.scale - 10);
            }
            if (this.bombAdded) {
                this.bombScale = 1.5;
                this.BombIconX = (PARAMS.CANVAS_WIDTH / 5) - 16 * this.bombScale;
                ctx.beginPath();
                ctx.roundRect(this.BombIconX- 10, this.weaponIconY - 10 + 10 * this.bombScale, 32 * this.bombScale + 20, 32 * this.bombScale + 30, [5]);
                ctx.fillStyle = rgba(0,0,0, 0.5);
                ctx.fill();

                //Bomb Icon
                this.bombAnimation.drawFrame(this.game.clockTick, ctx, this.BombIconX, this.weaponIconY - 10 + 10 * this.bombScale, 3);
                // ctx.drawImage(this.miscIcon, 
                //     0, 16, //0 for unlit, 16 for lit 
                //     16, 16, 
                //     this.secondaryIconX, this.weaponIconY - 10, 
                //     16 * 4, 16 * 4
                // );

                //Retrieve time
                ctx.beginPath();
                if (this.bombRetrieveCD == 1) {
                    ctx.fillStyle = rgba(0, 0, 0, 0);
                } else {
                    ctx.fillStyle = rgb(250, 60, 60);
                }
                ctx.roundRect(this.BombIconX, this.weaponIconY + 7.5 * this.bombScale, 32 * this.bombScale * this.bombRetrieveCD, 5, [5]); // 32 offset from image
                ctx.fill();

                //Cooldown time
                ctx.beginPath();
                if (this.bombCD == 1 && this.adventurer.bombCurrentAmnt > 0) {
                    ctx.fillStyle = rgb(250, 180, 60);
                } else {
                    ctx.fillStyle = rgb(250, 60, 60);
                }
                ctx.roundRect(this.BombIconX, this.weaponIconY + 32 * this.bombScale + 10 * this.bombScale, 32 * this.bombScale * this.bombCD, 10, [5]); // 32 offset from image
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(this.BombIconX, this.weaponIconY + 32 * this.bombScale + 10 * this.bombScale, 32 * this.bombScale, 10, [5]);
                ctx.strokeStyle = 'Black';
                ctx.stroke();
                if (this.adventurer.bombCurrentAmnt < 5 && this.adventurer.bombCurrentAmnt > 0) ctx.fillStyle = "White";
                ctx.font = '20px Lilita One';
                ctx.fillText(`x${this.adventurer.bombCurrentAmnt}`, this.BombIconX + 25 * this.bombScale, this.weaponIconY + 32 * this.bombScale - 10 + 10 * this.bombScale);
                ctx.strokeText(`x${this.adventurer.bombCurrentAmnt}`, this.BombIconX + 25 * this.bombScale, this.weaponIconY + 32 * this.bombScale - 10 + 10 * this.bombScale);
                
                ctx.font = '36px Lilita One';
                ctx.fillStyle = "White";
                ctx.fillText(`E`, (PARAMS.CANVAS_WIDTH / 5), this.weaponIconY + 32 * this.bombScale - 45 - 10 * this.bombScale);
                ctx.strokeText(`E`, (PARAMS.CANVAS_WIDTH / 5), this.weaponIconY + 32 * this.bombScale - 45 - 10 * this.bombScale);
            }
        }
    }
    checkAttacks() {
        if (this.adventurer.enableMagic && !this.magicAdded) {
            this.attackCount++; 
            this.magicAdded = true;
        }
        if (this.adventurer.enableBomb && !this.bombAdded) {
            this.attackCount++;
            this.bombAdded = true;
        }
    }
};

class Minimap {
    constructor(game, x, y) {
        this.entityOrder = 999;
        Object.assign(this, {game, x, y});
    };
    update() {
        this.entityOrder = 999;
    };
    draw(ctx) {
        this.entityOrder = 999;
        ctx.strokeStyle = "Black";
        ctx.strokeRect(this.x, this.y, 200, 200);
        // this.adventurer.drawMinimap(ctx, this.x, this.y);
        // for (var i = 0; i < this.game.entities.length; i++) {
        //     this.game.entities[i].drawMinimap(ctx, this.x, this.y);
        // }
    };
};