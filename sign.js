class Sign { 
    constructor(game, x, y, text) { 
        Object.assign(this, {game, x, y, text});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/DestructibleObjects.png");    

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.scale = 2.3;
        this.showTextBox = false;
        this.textBoxWidth = 300;  // Width of text box
        this.textBoxHeight = 80;  // Height of text box
        this.textBoxPadding = 10; // Padding inside text box
        this.textBoxOffset = 20;  // Distance above sign
        this.lineHeight = 20;     // Height between lines of text
        this.fontSize = 12;       // Smaller font size for pixel font

        this.updateBB();
        this.signImage();
    }

    signImage() {
        this.sign = new Animator(this.spritesheet, 0, 384, 63.3, 63.3, 0.9, 1, false, true);
    }

    updateBB() {
        this.BB = new BoundingBox(this.x + 20, this.y + 63, 120, 84);
    }


    update() {
        this.updateBB();

        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            //contact mobs
            if (entity instanceof Adventurer) {
                //If the player is in the sign radius, give the pop-up!
                if (this.BB.collide(entity.BB)) {                    
                    this.showTextBox = true;
                } else {
                    this.showTextBox = false;
                }
            }
        }
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                if (line) {
                    lines.push(line);
                    line = word;
                } else {
                    // If a single word is too long, split it
                    line = word;
                }
            } else {
                line = testLine;
            }
        }
        if (line) {
            lines.push(line);
        }
        return lines;
    }

    drawTextBox(ctx) {
        const textX = this.x - this.game.camera.x;
        const textY = this.y - this.game.camera.y;
        
        // Set font before calculating text metrics
        ctx.font = `${this.fontSize}px "Press Start 2P"`;
        const maxWidth = this.textBoxWidth - (this.textBoxPadding * 2);
        const lines = this.wrapText(ctx, this.text, maxWidth);
        
        //Adjust text box height based on number of lines
        const totalTextHeight = lines.length * this.lineHeight;
        const actualBoxHeight = Math.max(this.textBoxHeight, totalTextHeight + (this.textBoxPadding * 2));
        
        //Position the text box above the sign
        const boxX = textX + (this.BB.width / 2) - (this.textBoxWidth / 2) + 20;
        const boxY = textY - actualBoxHeight - this.textBoxOffset + 50;

        //Draw text box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, this.textBoxWidth, actualBoxHeight);
        
        // Draw border
        ctx.strokeStyle = 'white';
        ctx.strokeRect(boxX, boxY, this.textBoxWidth, actualBoxHeight);

        // Draw text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        
        let currentY = boxY + this.textBoxPadding + this.lineHeight;
        for (let line of lines) {
            ctx.fillText(line, boxX + this.textBoxPadding, currentY);
            currentY += this.lineHeight;
        }
    }



    draw(ctx) {
        //Draw the sign
        ctx.drawImage(this.shadow, 0, 0, 64, 32, (this.x + 61) - this.game.camera.x, (this.y + 90) - this.game.camera.y, 36, 16);
        this.sign.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        
        //Draw text box if player is nearby
        if (this.showTextBox) {
            this.drawTextBox(ctx);
        }

        //DEBUG
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }

}