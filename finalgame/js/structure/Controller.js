export class Controller {
    constructor() {
        this.keys = {
            up: new Controller.ButtonInput([87, 38]),    // W, Up Arrow
            left: new Controller.ButtonInput([65, 37]),   // A, Left Arrow
            right: new Controller.ButtonInput([68, 39]),  // D, Right Arrow
            down: new Controller.ButtonInput([83, 40])    // S, Down Arrow
        };

        this.handleKeyDownUp();
    }

    static ButtonInput = class {
        constructor(keyCodes) {
            this.isPressed = false;
            this.keyCodes = keyCodes;
        }
    }

    handleKeyDownUp() {
        // Handle keydown event
        document.addEventListener("keydown", (e) => {
            const keyCode = e.keyCode;
            
            for (const key in this.keys) {
                if (this.keys[key].keyCodes.includes(keyCode)) {
                    this.keys[key].isPressed = true;
                }
            }
        });

        // Handle keyup event
        document.addEventListener("keyup", (e) => {
            const keyCode = e.keyCode;

            for (const key in this.keys) {
                if (this.keys[key].keyCodes.includes(keyCode)) {
                    this.keys[key].isPressed = false;
                }
            }
        });
    }
}