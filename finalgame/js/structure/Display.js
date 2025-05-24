export class Display {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")

        this.canvas.width = 1280
        this.canvas.height = 720

        this.images = {
            player: new Image(),
            platform: new Image(),
            milestone: new Image()
        }

        this.images.player.src = "assets/images/player/default.png"
    }

    render(){
        
        
    }

    renderPlayer(player){
        if(player.flipped){
            this.ctx.save();
            this.ctx.translate(player.x + player.w, player.y);
            this.ctx.scale(-1, 1); // Flip horizontally
            this.ctx.drawImage(this.images.player, 0, 0, player.w, player.h);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(this.images.player, player.x, player.y, player.w, player.h)
        }
        
    }

    renderPlayerArrow(player){
        if(player.y > 0) return;
        this.ctx.fillStyle = "blue"
        this.ctx.fillRect(player.x + player.w/2 - 10, 10, 20, 20)

    }

    renderColor(color){
        this.ctx.fillStyle = color
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    renderPlatforms(platforms){
        platforms.forEach(platform => {
            if(platform.y+platform.h < 0 || platform.y > 720) return;

            this.ctx.fillStyle = platform.color
            this.ctx.fillRect(platform.x, platform.y, platform.w, platform.h)


        });
    }

    renderMilestones(milestones){
        milestones.forEach(milestone => {
            if(milestone.y < 0 || milestone.y-milestone.h > 720) return;

            this.ctx.fillStyle = milestone.color;
            this.ctx.strokeStyle = "black"; // Outline color
            this.ctx.lineWidth = 8;         // Outline thickness
            this.ctx.font = "32px Start2P";

            // Draw outline
            this.ctx.strokeText(milestone.text, milestone.x, milestone.y);
            // Draw fill
            this.ctx.fillText(milestone.text, milestone.x, milestone.y);
        })
    }

    
}