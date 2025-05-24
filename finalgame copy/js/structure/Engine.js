export class Engine {
    constructor(timeStep, update, render) {
        this.timeStep = timeStep;
        this.update = update;
        this.render = render;

        this.animationFrameRequest = undefined;
        this.time = undefined;
    }

    run = (timeStamp) => {
        if (!this.time) {
            this.time = timeStamp;
        }

        const deltaTime = timeStamp - this.time;

        if (deltaTime >= this.timeStep) {
            this.update();
            this.time = timeStamp;
        }

        this.render();
        this.animationFrameRequest = requestAnimationFrame(this.run);
    }

    start() {
        this.animationFrameRequest = requestAnimationFrame(this.run);
    }

    stop() {
        cancelAnimationFrame(this.animationFrameRequest);
    }
}