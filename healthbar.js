class HealthBar {
    constructor(game, entity, offsetX, offsetY) {
        Object.assign(this, { game, entity, offsetX, offsetY});
        this.length = 40;
        this.height = 8;
        this.entityOrder = 99;
        this.deathDelay = 0.5;
        this.deathTimer = this.deathDelay;
        this.lastHP = this.entity.health;
        this.count = 0;
    };

    update() {
        if (this.entity.dead) {
            if (this.deathTimer > 0) {
                this.deathTimer -= this.game.clockTick;
            } else {
                this.removeFromWorld = true;
                this.deathTimer = this.deathDelay;
            }
        }
    };

    draw(ctx) {
        var ratio = this.entity.health / this.entity.maxHealth;
        if (ratio < 0) ratio = 0;
        let hpLength = 0; //this.entity.health / 5;
        if (ratio < 0) ratio = 0;
        // console.log(this.entity.bit)
        let x = this.entity.x - this.game.camera.x + (this.entity.bitSizeX * this.entity.scale) / 2 + this.offsetX;
        let y = this.entity.y - this.game.camera.y + this.entity.bitSizeY * this.entity.scale + this.offsetY;
        ctx.strokeStyle = "Black";
        // ctx.fillStyle = ratio < 0.2 ? "Red" : ratio < 0.5 ? "Yellow" : "Green";
        ctx.fillStyle = "Red";
        ctx.fillRect(x - (this.length + hpLength) / 2, y, (this.length + hpLength) * ratio, this.height);
        ctx.strokeRect(x - (this.length + hpLength) / 2, y, this.length + hpLength, this.height);
        if (this.entity.health < 0 && this.count > 0) {
            this.entity.health = 0;
            this.lastHP = 0;
        }
        if (this.entity.health < 0 && this.count <= 0) {
            this.count++;
        }
        if (this.entity.health != this.lastHP) {
            this.game.addEntity(new DamageNumbers(this.game, this.entity, this.lastHP, this.entity.health));
            this.lastHP = this.entity.health;
        }
        if (PARAMS.DEBUG) {
            ctx.font = '24px Lilita One';

            ctx.strokeStyle = 'Black';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 

            ctx.fillText(`HP : ${this.entity.health} / ${this.entity.maxHealth}`, x, y + 20);
            ctx.strokeText(`HP : ${this.entity.health} / ${this.entity.maxHealth}`, x, y + 20);

            ctx.textAlign = "left"; 
            ctx.textBaseline = "alphabetic";  
        }
    };
};
class BossHealthBar {
    constructor(game, entity, animation, length, offsetX, offsetY, scale) {
        Object.assign(this, { game, entity, animation, length, offsetX, offsetY, scale});
        //length is just the bitsize of icon, offsetX, offsetY is the offset if there are any 
        this.proportion = PARAMS.CANVAS_WIDTH / 1024;

        this.entityOrder = 100;

        this.healthBarLength = 300 * this.proportion;
        this.healthBarHeight = 25 * this.proportion;

        this.lastHP = this.entity.currentHealth;
        this.deathDelay = 0.5;
        this.deathTimer = this.deathDelay;
    }
    update() {
        this.healthRatio = this.entity.currentHealth / this.entity.maxHealth;
        if (this.healthRatio < 0) this.healthRatio = 0;
        if (this.entity.dead) {
            if (this.deathTimer > 0) {
                this.deathTimer -= this.game.clockTick;
            } else {
                this.removeFromWorld = true;
                this.deathTimer = this.deathDelay;
            }
        }
    }
    draw(ctx) {
        if (this.game.settings.enableHUD) {
            ctx.beginPath();
            ctx.roundRect(PARAMS.CANVAS_WIDTH - 10 - this.length * this.scale + (this.offsetX * this.scale) * 2, 
                10, this.length * this.scale - (this.offsetX * this.scale) * 2, 
                this.length * this.scale - (this.offsetX * this.scale) * 2, [5]);
            ctx.fillStyle = rgba(204, 153, 42, 0.5);
            ctx.fill();

            this.animation.drawFrame(this.game.clockTick, ctx, 
                PARAMS.CANVAS_WIDTH - 10 - this.length * this.scale + this.offsetX * this.scale, 
                10 - this.offsetY * this.scale, this.scale);

            //Outline for boss icon
            ctx.beginPath();
            ctx.roundRect(PARAMS.CANVAS_WIDTH - 10 - this.length * this.scale + (this.offsetX * this.scale) * 2, 
                10, this.length * this.scale - (this.offsetX * this.scale) * 2, 
                this.length * this.scale - (this.offsetX * this.scale) * 2, [5]);
            ctx.strokeStyle = 'Black';
            ctx.lineWidth = 7 * this.proportion;
            ctx.stroke();
            ctx.lineWidth = 1;

            //Start of health bar drawing
            ctx.beginPath();
            ctx.roundRect(PARAMS.CANVAS_WIDTH - this.healthBarLength - 20 - this.length * this.scale, (7 * 16) / 2 - 20, this.healthBarLength, this.healthBarHeight, [5]); //Values from Hud 7 is hero scale 16 is hero height 20 is offset
            ctx.fillStyle = rgba(0, 0, 0, 0.5);
            ctx.fill();
            

            ctx.beginPath();
            ctx.roundRect(PARAMS.CANVAS_WIDTH - this.healthBarLength - 20 - this.length * this.scale + (this.healthBarLength - this.healthBarLength * this.healthRatio)
                , (7 * 16) / 2 - 20, this.healthBarLength * this.healthRatio, this.healthBarHeight, [5]);
            // ctx.fillStyle = this.healthRatio < 0.2 ? rgb(150, 0, 0) : this.healthRatio < 0.5 ? rgb(190, 180, 0) : rgb(0, 110, 0);
            ctx.fillStyle = "Red";
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(PARAMS.CANVAS_WIDTH - this.healthBarLength - 20 - this.length * this.scale, (7 * 16) / 2 - 20, this.healthBarLength, this.healthBarHeight, [5]);
            ctx.strokeStyle = 'Black';
            ctx.stroke();

            //Name on health bar
            let textSize = 20 * this.proportion;
            let x = PARAMS.CANVAS_WIDTH - this.healthBarLength / 2 - 20 - this.length * this.scale;
            let y = (7 * 16) / 2 - 20 + this.healthBarHeight / 2;
            ctx.font = textSize + 'px Lilita One';

            ctx.strokeStyle = 'Black';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 

            ctx.fillText(`${this.entity.name}`, x, y);
            ctx.strokeText(`${this.entity.name}`, x, y);
            ctx.textAlign = "left"; 
            ctx.textBaseline = "alphabetic";
        }
        if (this.entity.currentHealth != this.lastHP && !this.entity.dead) {
            this.game.addEntity(new DamageNumbers(this.game, this.entity, this.lastHP, this.entity.currentHealth));
            this.lastHP = this.entity.currentHealth;
        }
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Black';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.entity.BB.x - this.game.camera.x - 10, this.entity.BB.y - this.game.camera.y - 10, 
                this.entity.BB.width + 20, this.entity.BB.height / 2);
            ctx.font = '24px Lilita One';

            ctx.strokeStyle = 'Black';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 
            let x = this.entity.x - this.game.camera.x + (this.entity.bitSizeX * this.entity.scale) / 2 + this.offsetX;
            let y = this.entity.y - this.game.camera.y + this.entity.bitSizeY * this.entity.scale + this.offsetY;
            ctx.fillText(`HP : ${this.entity.currentHealth} / ${this.entity.maxHealth}`, x, y + 20);
            ctx.strokeText(`HP : ${this.entity.currentHealth} / ${this.entity.maxHealth}`, x, y + 20);

            ctx.textAlign = "left"; 
            ctx.textBaseline = "alphabetic";   
        }
    }
}
class DamageNumbers {
    constructor(game, entity, lastHealth, currentHealth) {
        Object.assign(this, { game, entity, lastHealth, currentHealth});
        this.damageTimer = 0.5;
        this.damagerTime = 0.5;
        this.entityOrder = 100;
    }
    update() {
        if (this.damageTimer <= 0) this.removeFromWorld = true;
    }
    draw(ctx) {
        if (this.lastHealth < this.currentHealth) { //this means that the entity is healing. We don't want to show a number
            return;
        }
        ctx.save();
        if (this.damageTimer == this.damagerTime && !this.game.isPaused()) {
            let minX = -10;
            let maxX = minX + this.entity.BB.width + 20;
            let minY = -10;
            let maxY = minY + this.entity.BB.height / 2;
            this.xRange = Math.random() * (maxX - minX) + minX;
            this.yRange = Math.random() * (maxY - minY) + minY;
            this.movement = 0;
        }
        if (this.damageTimer > 0) {
            // console.log("damage");
            ctx.font = '30px Lilita One';
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 
            if (this.entity.didCrit) {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillStyle = 'Yellow';  
                ctx.lineWidth = 1;
                ctx.shadowColor = 'Black';
                ctx.shadowBlur = 10;
                ctx.strokeStyle = rgb(139, 118, 2);
            } else {
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillStyle = "White";
                ctx.lineWidth = 1;
                ctx.shadowColor = "Black";
                ctx.shadowBlur = 5;
                ctx.strokeStyle = 'Black';
            }
            let damage = this.lastHealth - this.currentHealth;
            ctx.fillText(`-${damage}`, this.xRange + this.entity.BB.x - this.game.camera.x, this.yRange + this.entity.BB.y - this.game.camera.y + this.movement);
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeText(`-${damage}`, this.xRange + this.entity.BB.x - this.game.camera.x, this.yRange + this.entity.BB.y - this.game.camera.y + this.movement);
            this.damageTimer -= this.game.clockTick;
            ctx.lineWidth = 1;
            if (this.game.timer.isPaused) {
                this.movement -= 0;
            } else {
                this.movement -= 1;
            }
            
        } else {
            this.damageTimer = this.damagerTime;
        }
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Black';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.entity.BB.x - this.game.camera.x - 10, this.entity.BB.y - this.game.camera.y - 10, 
                this.entity.BB.width + 20, this.entity.BB.height / 2
            )
            
        }
        ctx.restore();
    }
}