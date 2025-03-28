const vehicles = {
    path: "assets/images/vehicles/",
    log: {
        left: "left_log",
        middle: "middle_log",
        right: "right_log",
    }
}

class Images {
    constructor(){
        this.log = {
            left: new Image(),
            middle: new Image(),
            right: new Image()
        }
        this.log.left.src = vehicles.path + "/log/" + vehicles.log.left + ".png"
        this.log.middle.src = vehicles.path + "/log/" + vehicles.log.middle + ".png"
        this.log.right.src = vehicles.path + "/log/" + vehicles.log.right + ".png"  
    }
}

export {Images}