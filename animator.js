class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, reverse, loop) {
        Object.assign(this, {spritesheet, xStart, yStart, width, height, frameCount, frameDuration, reverse, loop}); //copies down all of the parameters into our object
        //frameCount will be how many frames we're looking at. Frame Duration how long each frame should be
        //Where does the frame start? (x, y coords). What is the width and height of the frame?

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration; 
    };


    drawFrame(tick, ctx, x, y, scale) { //goes into our spread sheet and select which frame we want to draw of our animation
        //x and y is where want to draw on the canvas

        this.elapsedTime += tick; //if elasped time is just 0, it'll just give us first frame
        if (this.isDone()) {
            if (this.loop) {
                this.elapsedTime -= this.totalTime;
            } else {
                return;
            }
        }
        
        let frame = this.currentFrame(); //cant be const because of reverse. We're changing frame

        // if (this.elapsedTime > this.totalTime) this.elapsedTime -= this.totalTime; //used to keep the animation going

        if (this.reverse) frame = this.frameCount - frame - 1;
        ctx.drawImage(this.spritesheet, 
            this.xStart + this.width * frame, this.yStart, 
            this.width, this.height, 
            x, y, 
            this.width * scale, this.height * scale
        ); //because our frames are in columns, not rows, we're going to move xStart instead of yStart

        
    };

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };
};