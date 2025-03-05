class Hud {
    constructor(game, adventurer) {
        Object.assign(this, {game, adventurer});
        this.proportion = PARAMS.CANVAS_WIDTH / 1024; //Assuming it's always going to be 4:3
        // this.minimap = new Minimap(this.game, PARAMS.CANVAS_WIDTH - 210, 10);
        this.scale = 2 * this.proportion;
        this.abilitiesScale = 1.5;
        // this.weaponIconX = PARAMS.CANVAS_WIDTH - 32 * this.scale - 10; 
        // this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - 20;
        this.weaponIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale; // 16 half of size 32 
        this.weaponIconY = PARAMS.CANVAS_HEIGHT - 32 * this.scale - (20 * this.proportion);
        this.healthBarLength = 300 * this.proportion;
        this.healthBarHeight = 25 * this.proportion;

        // this.secondaryIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
        // this.BombIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;

        this.coinScale = 4 * this.proportion;
        this.menuScale = 4 * this.proportion;

        this.heroIconScale = 7 * this.proportion;
        this.heroIconLength = 16;
        this.heroIconHeight = 16;
        this.heroIconX = 10;
        this.heroIconY = 10;

        this.experienceBarLength = 200 * this.proportion; //375 174
        this.experienceBarHeight = 25 * this.proportion;
        this.experienceBarX = (PARAMS.CANVAS_WIDTH / 2) - (this.experienceBarLength / 2);
        this.experienceBarY = PARAMS.CANVAS_HEIGHT - this.experienceBarHeight - (100 * this.proportion);

        this.bitSize = 16;
        this.attackCount = 0;
        this.magicAdded = false;
        this.bombAdded = false;

        this.weaponIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/weapons.png");
        this.miscIcon = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        
        this.ultAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Magic/magic.png"), 0, 320, 64, 64, 9, 0.08, false, true);
        this.bombAnimation = new Animator(this.miscIcon, 0, 16, 16, 16, 4, 0.1, false, true);
        this.lightningAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Magic/Lightning.png"), 0, 0, 64, 128, 10, 0.1, false, true);
        this.boltAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Magic/Dark-Bolt.png"), 0, 0, 64, 88, 11, 0.08, false, true);
        this.heroanimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/HudIcons/AdventurerSpriteHud2.png"), 0, 0, this.heroIconLength, this.heroIconHeight, 12.9, 0.2, false, true);

    };
    update() {
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
        this.lightningCD = (this.adventurer.lightningCooldown - this.adventurer.lightningCooldownTimer) / this.adventurer.lightningCooldown;
        this.boltCD = (this.adventurer.boltCooldown - this.adventurer.boltCooldownTimer) / this.adventurer.boltCooldown;
        this.boltRetrieveCD = (this.adventurer.boltCooldownRetrieve - this.adventurer.boltCooldownRetrieveTimer) / this.adventurer.boltCooldownRetrieve;
        this.potionCD = (this.adventurer.potionCooldown - this.adventurer.potionCooldownTimer) / this.adventurer.potionCooldown;
        this.healthRatio = this.adventurer.health / this.adventurer.maxhealth;
        this.stamina = (this.adventurer.rollCooldown - this.adventurer.rollCooldownTimer) / this.adventurer.rollCooldown;
        this.experience = this.adventurer.experience / this.adventurer.experienceToNextLvl;

        if (this.healthRatio < 0) this.healthRatio = 0;         //Sometimes, math doesn't math and breaks the thing
        if (this.stamina > 1) this.stamina = 1;
        if (this.weaponCD > 1) this.weaponCD = 1;
        if (this.ultCD > 1) this.ultCD = 1;
        if (this.bombCD > 1) this.bombCD = 1;
        if (this.bombRetrieveCD > 1) this.bombCD = 1;
        if (this.lightningCD > 1) this.lightningCD = 1;
        if (this.boltCD > 1) this.boltCD = 1;
        if (this.boltRetrieveCD > 1) this.boltRetrieveCD = 1;
        if (this.potionCD > 1) this.potionCD = 1;

        
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.click != null) {
            mouseX = this.game.click.x;
            mouseY = this.game.click.y;
        }
        //Upgrade menu icon
        if (mouseX > PARAMS.CANVAS_WIDTH - 16 * this.menuScale * 1.5 - this.menuBuffer && mouseX < PARAMS.CANVAS_WIDTH - this.menuBuffer &&
            mouseY > PARAMS.CANVAS_HEIGHT - 16 * this.menuScale * 1.5 - this.menuBuffer && PARAMS.CANVAS_HEIGHT - this.menuBuffer && 
            !this.game.upgradePause && !this.game.adventurer.dead && !this.game.pause && !this.game.shopPause
        ) {
            this.game.toggleUpgradePause();
            this.game.click = {x: 0, y: 0};
            this.game.leftClick = false;

        }

    };
    draw(ctx) {
        // Alignment center
        // ctx.beginPath();
        // ctx.moveTo(PARAMS.CANVAS_WIDTH / 5, 0);
        // ctx.lineTo(PARAMS.CANVAS_WIDTH / 5, PARAMS.CANVAS_HEIGHT);
        // ctx.closePath();
        // ctx.stroke();

        this.displayPlayerInfo(ctx);
        this.displayExperienceBar(ctx);
        this.displayWeapons(ctx);    
        this.displayMenu(ctx);
        // ctx.beginPath();
        // ctx.roundRect((PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale - 145 - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
        // ctx.fillStyle = rgba(0,0,0, 0.5);
        // ctx.fill();

        // this.minimap.draw(ctx);
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
        
    };
    displayPlayerInfo(ctx) {
        let offX = 10 * this.proportion;
        let offY = 30 * this.proportion;
        let textSize = 20 * this.proportion;
        let spacing = 5;
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
        ctx.strokeStyle = rgb(25, 25, 25);
        ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
        ctx.lineWidth = 7 * this.proportion;
        ctx.stroke();
        ctx.lineWidth = 1; //Reset line width

        //Health Bar
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY, this.healthBarLength, this.healthBarHeight, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();
        

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY, this.healthBarLength * this.healthRatio, this.healthBarHeight, [5]);
        ctx.fillStyle = this.healthRatio < 0.2 ? rgb(150, 0, 0) : this.healthRatio < 0.5 ? rgb(190, 180, 0) : rgb(0, 110, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY, this.healthBarLength, this.healthBarHeight, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Health Text
        let healthX = circleX + circleRadius + offX + this.healthBarLength / 2;
        let healthY = circleY - (offY + 5) / 2;

        ctx.font = textSize + 'px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 

        ctx.fillText(`HP : ${this.adventurer.health} / ${this.adventurer.maxhealth}`, healthX, healthY);
        ctx.strokeText(`HP : ${this.adventurer.health} / ${this.adventurer.maxhealth}`, healthX, healthY);


        // Roll Cooldown
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY + this.healthBarHeight + spacing, this.healthBarLength * 0.75, this.healthBarHeight / 2, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();

        if (this.stamina == 1) {
            ctx.fillStyle = rgb(250, 180, 60);
        } else {
            ctx.fillStyle = rgb(250, 60, 60);
        }
        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY + this.healthBarHeight + spacing, this.healthBarLength * this.stamina * 0.75, this.healthBarHeight / 2, [5]);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(circleX + circleRadius + offX, circleY - offY + this.healthBarHeight + spacing, this.healthBarLength * 0.75, this.healthBarHeight / 2, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Coin Icon
        ctx.drawImage(this.miscIcon, 
            10, 140, 
            14, 14, 
            circleX + circleRadius -4, circleY - offY + this.healthBarHeight + spacing + this.healthBarHeight / 2 + spacing - 10, 
            14 * this.coinScale, 14 * this.coinScale
        );

        ctx.font = textSize + 'px Lilita One';
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';

        ctx.textAlign = "left"; 
        ctx.fillText(`${this.adventurer.coins}`, circleX + circleRadius + (14 -5)* this.coinScale, circleY - offY + this.healthBarHeight + spacing + this.healthBarHeight / 2 + spacing - 10 + (14 -4) * this.coinScale / 2);
        ctx.strokeText(`${this.adventurer.coins}`, circleX + circleRadius + (14 -5)* this.coinScale, circleY - offY + this.healthBarHeight + spacing + this.healthBarHeight / 2 + spacing - 10 + (14 -4) * this.coinScale / 2);
        // ctx.fillText("10", circleX + circleRadius + 48, circleY + 32);
        // ctx.strokeText("10 ", circleX + circleRadius + 50, circleY + 32);


    }
    displayExperienceBar(ctx) {
        let fontSize = 20 * this.proportion;
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
        ctx.font = fontSize + 'px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        
        // ctx.fillText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        // ctx.strokeText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);

        ctx.font = fontSize + 4 * this.proportion +'px Lilita One';
        ctx.fillText(`Level ${this.adventurer.level}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY - this.experienceBarHeight / 2);
        ctx.strokeText(`Level ${this.adventurer.level}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY - this.experienceBarHeight / 2);
        ctx.font = fontSize + 'px Lilita One';
        ctx.fillText(`Exp : ${this.adventurer.experience} / ${this.adventurer.experienceToNextLvl}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + this.experienceBarHeight / 2);
        ctx.strokeText(`Exp : ${this.adventurer.experience} / ${this.adventurer.experienceToNextLvl}`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + this.experienceBarHeight / 2);
    }
    displayWeapons(ctx) {
        // WeaponIcons
        if ((this.adventurer.enableMagic && this.weaponType == 0) || (this.adventurer.enableLightning && this.weaponType == 1)) { //|| (this.adventurer.enableBomb && this.weaponType == 1)
            let x = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
            this.secondaryIconX = x + 16 * this.scale + 15;
            this.weaponIconX = x - 16 * this.scale - 15;
        } else if (this.weaponType == 1 && !this.adventurer.enableLightning || !this.adventurer.enableMagic && this.weaponType == 0) {
            this.weaponIconX = (PARAMS.CANVAS_WIDTH / 2) - 16 * this.scale;
        }
        //Speical Ability Icons
        if(this.adventurer.enableBomb && this.adventurer.enableBolt) {
            this.BombIconX = (PARAMS.CANVAS_WIDTH / 5) - 16 * this.abilitiesScale - 37; 
            this.boltIconX = (PARAMS.CANVAS_WIDTH / 5) - 16 * this.abilitiesScale + 37;
        } else if (this.adventurer.enableBomb) {
            this.BombIconX = (PARAMS.CANVAS_WIDTH / 5) - 16 * this.abilitiesScale;
        } else if (this.adventurer.enableBolt) {
            this.boltIconX = (PARAMS.CANVAS_WIDTH / 5) - 16 * this.abilitiesScale;
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

        if (this.adventurer.enableMagic && this.weaponType == 0) {
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

        //Lightning
        } else if (this.adventurer.enableLightning && this.weaponType == 1) {
            //Bomb stuff
            ctx.beginPath();
            ctx.roundRect(this.secondaryIconX - 10, this.weaponIconY - 10, 32 * this.scale + 20, 32 * this.scale + 30, [5]);
            ctx.fillStyle = rgba(0,0,0, 0.5);
            ctx.fill();

            //Bomb Icon
            this.lightningAnimation.drawFrame(this.game.clockTick, ctx, this.secondaryIconX + (64 * 0.6) / 2 - 6, this.weaponIconY - 10, 0.6);
            //

        //     //Retrieve time
        //     ctx.beginPath();
        //     if (this.bombRetrieveCD == 1) {
        //         ctx.fillStyle = rgba(0, 0, 0, 0);
        //     } else {
        //         ctx.fillStyle = rgb(250, 60, 60);
        //     }
        //     ctx.roundRect(this.secondaryIconX, this.weaponIconY, 32 * this.scale * this.bombRetrieveCD, 5, [5]); // 32 offset from image
        //     ctx.fill();

            //Cooldown time
            ctx.beginPath();
            if (this.lightningCD == 1) {
                ctx.fillStyle = rgb(250, 180, 60);
            } else {
                ctx.fillStyle = rgb(250, 60, 60);
            }
            ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale * this.lightningCD, 10, [5]); // 32 offset from image
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(this.secondaryIconX, this.weaponIconY + 32 * this.scale, 32 * this.scale, 10, [5]);
            ctx.strokeStyle = 'Black';
            ctx.stroke();
            // if (this.adventurer.bombCurrentAmnt < 5 && this.adventurer.bombCurrentAmnt > 0) ctx.fillStyle = "White";
            // ctx.font = '20px Lilita One';
            // ctx.fillText(`x${this.adventurer.bombCurrentAmnt}`, this.secondaryIconX + 50, this.weaponIconY + 32 * this.scale - 10);
            // ctx.strokeText(`x${this.adventurer.bombCurrentAmnt}`, this.secondaryIconX + 50, this.weaponIconY + 32 * this.scale - 10);
        }
        if (this.adventurer.enableBomb) {
            let length = 32 * this.abilitiesScale + 20;
            let height = 32 * this.abilitiesScale + 30;
            ctx.beginPath();
            ctx.roundRect(this.BombIconX, this.weaponIconY - 10 + 10 * this.abilitiesScale, length, height, [5]);
            ctx.fillStyle = rgba(0,0,0, 0.5);
            ctx.fill();

            //Bomb Icon
            this.bombAnimation.drawFrame(this.game.clockTick, ctx, this.BombIconX + length / 2 - (16 * 3) / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale, 3);
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
            ctx.roundRect(this.BombIconX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 7.5 * this.abilitiesScale, 32 * this.abilitiesScale * this.bombRetrieveCD, 5, [5]); // 32 offset from image
            ctx.fill();

            //Cooldown time
            ctx.beginPath();
            if (this.bombCD == 1 && this.adventurer.bombCurrentAmnt > 0) {
                ctx.fillStyle = rgb(250, 180, 60);
            } else {
                ctx.fillStyle = rgb(250, 60, 60);
            }
            ctx.roundRect(this.BombIconX  + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale * this.bombCD, 10, [5]); // 32 offset from image
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(this.BombIconX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale, 10, [5]);
            ctx.strokeStyle = 'Black';
            ctx.stroke();

            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            if (this.adventurer.bombCurrentAmnt < this.adventurer.bombMaxAmount && this.adventurer.bombCurrentAmnt > 0) ctx.fillStyle = "White";
            ctx.font = 20 * this.proportion + 'px Lilita One';
            ctx.fillText(`x${this.adventurer.bombCurrentAmnt}`, this.BombIconX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            ctx.strokeText(`x${this.adventurer.bombCurrentAmnt}`, this.BombIconX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.font = 36 * this.proportion + 'px Lilita One';
            ctx.fillStyle = "White";
            ctx.fillText(`E`, this.BombIconX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);
            ctx.strokeText(`E`, this.BombIconX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);

        } 
        if (this.adventurer.enableBolt) { //Dark bolt
            let length = 32 * this.abilitiesScale + 20;
            let height = 32 * this.abilitiesScale + 30;
            ctx.beginPath();
            ctx.roundRect(this.boltIconX, this.weaponIconY - 10 + 10 * this.abilitiesScale, length, height, [5]);
            ctx.fillStyle = rgba(0,0,0, 0.5);
            ctx.fill();

            //Dark bolt Icon
            this.boltAnimation.drawFrame(this.game.clockTick, ctx, this.boltIconX + length / 2 - (64 * 0.7) / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale, 0.7);
            // ctx.drawImage(this.miscIcon, 
            //     0, 16, //0 for unlit, 16 for lit 
            //     16, 16, 
            //     this.secondaryIconX, this.weaponIconY - 10, 
            //     16 * 4, 16 * 4
            // );

            //Retrieve time
            ctx.beginPath();
            if (this.boltRetrieveCD == 1) {
                ctx.fillStyle = rgba(0, 0, 0, 0);
            } else {
                ctx.fillStyle = rgb(250, 60, 60);
            }
            ctx.roundRect(this.boltIconX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 7.5 * this.abilitiesScale, 32 * this.abilitiesScale * this.boltRetrieveCD, 5, [5]); // 32 offset from image
            ctx.fill();

            //Cooldown time
            ctx.beginPath();
            if (this.boltCD == 1 && this.adventurer.boltCurrentAmount > 0) {
                ctx.fillStyle = rgb(250, 180, 60);
            } else {
                ctx.fillStyle = rgb(250, 60, 60);
            }
            ctx.roundRect(this.boltIconX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale * this.boltCD, 10, [5]); // 32 offset from image
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(this.boltIconX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale, 10, [5]);
            ctx.strokeStyle = 'Black';
            ctx.stroke();

            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            if (this.adventurer.boltCurrentAmount < this.adventurer.boltMaxAmount && this.adventurer.boltCurrentAmount > 0) ctx.fillStyle = "White";
            ctx.font = 20 * this.proportion + 'px Lilita One';
            ctx.fillText(`x${this.adventurer.boltCurrentAmount}`, this.boltIconX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            ctx.strokeText(`x${this.adventurer.boltCurrentAmount}`, this.boltIconX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.font = 36 * this.proportion + 'px Lilita One';
            ctx.fillStyle = "White";
            ctx.fillText(`F`, this.boltIconX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);
            ctx.strokeText(`F`, this.boltIconX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);
        }
        if (this.adventurer.enablePotion) {
            const locationX = (PARAMS.CANVAS_WIDTH * 0.8) - 32 * this.abilitiesScale;
            let length = 32 * this.abilitiesScale + 20;
            let height = 32 * this.abilitiesScale + 30;
            ctx.beginPath();
            ctx.roundRect(locationX, this.weaponIconY - 10 + 10 * this.abilitiesScale, length, height, [5]);
            ctx.fillStyle = rgba(0,0,0, 0.5);
            ctx.fill();

            //Health Potion Icon
            ctx.drawImage(this.miscIcon, 
                32, 160, 
                16, 16, 
                locationX + length / 2 - (16 * 3.8) / 2, this.weaponIconY - 15 + 10 * this.abilitiesScale, 
                16 * 3.8, 16 * 3.8
            );

            //Retrieve time
            // ctx.beginPath();
            // if (this.boltRetrieveCD == 1) {
            //     ctx.fillStyle = rgba(0, 0, 0, 0);
            // } else {
            //     ctx.fillStyle = rgb(250, 60, 60);
            // }
            // ctx.roundRect(this.boltIconX, this.weaponIconY + 7.5 * this.abilitiesScale, 32 * this.abilitiesScale * this.boltRetrieveCD, 5, [5]); // 32 offset from image
            // ctx.fill();

            // //Cooldown time
            ctx.beginPath();
            if (this.potionCD == 1 && this.adventurer.potion > 0) {
                ctx.fillStyle = rgb(250, 180, 60);
            } else {
                ctx.fillStyle = rgb(250, 60, 60);
            }
            ctx.roundRect(locationX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale * this.potionCD, 10, [5]);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(locationX + length / 2 - (32 * this.abilitiesScale) / 2, this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale, 32 * this.abilitiesScale, 10, [5]);
            ctx.strokeStyle = 'Black';
            ctx.stroke();

            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            if (this.adventurer.potion < this.adventurer.potionMaxAmount && this.adventurer.boltCurrentAmount > 0) ctx.fillStyle = "White";
            if (this.adventurer.potion == 0) ctx.fillStyle = "Red";
            ctx.font = 20 * this.proportion + 'px Lilita One';
            ctx.fillText(`x${this.adventurer.potion}`, locationX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            ctx.strokeText(`x${this.adventurer.potion}`, locationX + length / 2 + (32 * this.abilitiesScale) / 2, 
                this.weaponIconY + 32 * this.abilitiesScale + 10 * this.abilitiesScale);
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.font = 36 * this.proportion + 'px Lilita One';
            ctx.fillStyle = "White";
            ctx.fillText(`X`, locationX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);
            ctx.strokeText(`X`, locationX + length / 2, this.weaponIconY - 10 + 10 * this.abilitiesScale);
        }
    }
    displayMenu(ctx) {
        this.menuScale = 4 * this.proportion;
        this.menuBuffer = 10 * this.proportion;
        let mouseX = 0;
        let mouseY = 0;
        ctx.font = 20 * this.proportion + 'px Lilita One';
        if (this.game.mouse != null) {
            mouseX = this.game.mouse.x;
            mouseY = this.game.mouse.y;
        }
        if (mouseX > PARAMS.CANVAS_WIDTH - 16* this.menuScale * 1.5 - this.menuBuffer && mouseX < PARAMS.CANVAS_WIDTH - this.menuBuffer &&
            mouseY > PARAMS.CANVAS_HEIGHT - 16 * this.menuScale * 1.5 - this.menuBuffer && PARAMS.CANVAS_HEIGHT - this.menuBuffer && 
            !this.game.upgradePause && !this.game.pause && !this.game.shopPause
        ) {
            this.menuScale = 4.5 * this.proportion;
            this.menuBuffer = 5 * this.proportion;
            ctx.font = 24 * this.proportion + 'px Lilita One';
        }
        ctx.drawImage(this.miscIcon, 
            112, 160, 
            16, 16, 
            PARAMS.CANVAS_WIDTH - 16* this.menuScale * 1.5 - this.menuBuffer, PARAMS.CANVAS_HEIGHT - 16 * this.menuScale * 1.5 - this.menuBuffer, 
            16 * this.menuScale * 1.5, 16 * this.menuScale * 1.5
        );
        //Menu Indicator
        if (this.game.upgrade.points > 0 && !this.game.upgrade.noUpgrades) {
            ctx.beginPath();
            ctx.arc(PARAMS.CANVAS_WIDTH - this.menuBuffer - 15, 
                PARAMS.CANVAS_HEIGHT - 16 * this.menuScale - this.menuBuffer - 10, 11 * this.proportion, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.fillStyle = "White";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("!", PARAMS.CANVAS_WIDTH - this.menuBuffer - 15, 
                PARAMS.CANVAS_HEIGHT - 16 * this.menuScale - this.menuBuffer - 10);
            // ctx.strokeText("!", PARAMS.CANVAS_WIDTH - this.menuBuffer - 15, 
            //     PARAMS.CANVAS_HEIGHT - 16 * this.menuScale - this.menuBuffer - 10);
        }
        //Menu text
        ctx.fillStyle = "White";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Upgrade",PARAMS.CANVAS_WIDTH - (16 * this.menuScale * 1.5) / 2 - this.menuBuffer + 5, 
            PARAMS.CANVAS_HEIGHT - this.menuBuffer - 20 * this.proportion - 5);
        ctx.strokeText("Upgrade",PARAMS.CANVAS_WIDTH - (16 * this.menuScale * 1.5) / 2 - this.menuBuffer + 5, 
            PARAMS.CANVAS_HEIGHT - this.menuBuffer - 20 * this.proportion- 5);
        ctx.fillText("Menu", PARAMS.CANVAS_WIDTH - (16 * this.menuScale * 1.5) / 2 - this.menuBuffer + 5, 
            PARAMS.CANVAS_HEIGHT - this.menuBuffer - 5);
        ctx.strokeText("Menu", PARAMS.CANVAS_WIDTH - (16 * this.menuScale * 1.5) / 2 - this.menuBuffer + 5, 
            PARAMS.CANVAS_HEIGHT - this.menuBuffer - 5);
        //Reset text?
    }
    displayWaves(ctx) {
        // ctx.fillText
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