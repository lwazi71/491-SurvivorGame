// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.lastTimestamp = 0;
        this.lastTimestamp2 = 0;
        this.isPaused = false;
        this.enablePauseTick = false;
    };

    tick() {
        if (this.isPaused) return 0;
        
        const current = Date.now();
        const delta = (current - this.lastTimestamp) / 1000;
        this.lastTimestamp = current;

        const gameDelta = Math.min(delta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    };
    pauseTick() {
        if (!this.enablePauseTick) return 0;

        const current = Date.now();
        const delta = (current - this.lastTimestamp2) / 1000;
        this.lastTimestamp2 = current;

        const gameDelta = Math.min(delta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    }
};
