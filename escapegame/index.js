// Sound Manager
const soundManager = {
    audio: true,
    file: "assets/sounds/",
    backgroundMusic: null,
    baseVolume: 1,

    // Play an audio file.
    play: function(id){
        const audio = new Audio(`${this.file}${id}`)
        audio.play()
    },

    // Mute all sounds
    mute: function(){
        this.audio = false
        this.backgroundMusic.pause()
    },

    // Unmute sounds
    unmute: function(){
        this.audio = true
        this.backgroundMusic.play(this.baseVolume)
    },

    // Plays a background music
    playBackgroundMusic : function(src, vol = 1){
        this.baseVolume = vol
        try {this.backgroundMusic.pause()} catch(e){}
        this.backgroundMusic = new sound(src)
        this.backgroundMusic.play(vol)
    }
}

const sceneManager = {
    current: "cell",
    ready: true,
    display: function(id){
        if(this.ready){
            document.querySelector(`.gameScene-${this.current}`).classList.add("hidden")
            console.log(document.querySelector(`.gameScene-${this.current}`).classList)
            document.querySelector(`.gameScene-${id}`).classList.remove("hidden")
            console.log(document.querySelector(`.gameScene-${this.current}`).classList)
            this.current = id
            this.triggerScene()
        }
        
    },
    triggerScene: function(){
        switch(this.current){
            case "cell":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Aujourd'hui est le grand jour! Après des années de préparation, je peux enfin exécuter mon plan d'évasion de cette prison misérable.", wait: 3000},
                    {title: "Vous", text: "Bon, je dois d'abord retrouver le tournevis que j'avais dissimulé quelque part dans la pièce... Où ai-je bien pu le mettre déjà?", wait: 2500, id: "framestart"}
                ])
                document.addEventListener("dialogueend", function(e){
                    if(e.detail["id"] == "framestart"){
                        document.getElementById("cell-frame").onclick = () => {
                            sceneManager.display("frame")
                            soundManager.play("pop.mp3")
                        }
                    }
                })
                
                break;
            case "frame":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Ah oui, je m'en souviens maintenant! Je l'avais caché derrière ce cadre...", wait: 2500, id: "screwdriverstart"}
                ])
                document.addEventListener("dialogueend", function(e){
                    if(e.detail["id"] == "screwdriverstart"){
                        document.getElementById("frame-screwdriver").onclick = () => {
                            sceneManager.display("celldoor")
                            soundManager.play("pop.mp3")
                        }
                    }
                })
                
                break;
            case "celldoor":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Je pense pouvoir crocheter cette porte avec mon tournevis...", wait: 2000, id: "lockstart"}
                ])
                const lock = document.getElementById("celldoor-lock")

                var lockCounter = 0
                var clickable = true
                var lockOpened = false;
                document.addEventListener("dialogueend", function(e){
                    if(e.detail["id"] == "lockstart"){
                        lock.onclick = () => {
                            if(!lockOpened){
                                if(clickable){
                                    lockCounter++
                                    soundManager.play("chain.mp3")
                                    console.log(lockCounter)
                                    if(lockCounter >= 10){
                                        lock.style.backgroundImage = "url(assets/items/lockopened.png)"
                                        lockOpened = true
                                        soundManager.play("unlock.mp3")
                                        setTimeout(function(){
                                            lock.style.visibility = "hidden"
                                            document.querySelector(".gameScene-celldoor").style.backgroundImage = "url(assets/scenes/celldooropened.png)"
                                            dialogueManager.displayMessages([
                                                {title: "Vous", text: "Et voilà! C'était plus facile que je le pensais...", wait: 2000}
                                            ])
                                            setTimeout(function(){
                                                sceneManager.display("hallway")
                                            }, 3000)
                                        }, 3000)
                                    }
                                }
                                clickable = false
                                lock.classList.add("shake")
                                var delay = setTimeout(function(){
                                    clickable = true
                                    lock.classList.remove("shake")
                                }, 750)
                            }
                            
                        }
                    }
                })
                
                
                break;
            case "hallway":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Enfin! Je suis sorti de cette pièce misérable.", wait: 2000},
                    {title: "Garde", text: "Qui a parlé?", wait: 3000, id: "guardspawn"},
                    {title: "Vous", text: "Mince! Je me suis fait repérer... Je dois trouver un endroit pour me cacher.", wait: 4000, id: "hallway-door"}
                ])
                document.addEventListener("dialoguestart", function(e){
                    if(e.detail["id"] == "guardspawn"){
                        soundManager.play("hmmm.mp3")
                        document.getElementById("guard").style.visibility = "visible"
                        document.getElementById("guard").style.opacity = 1
                    }
                })
                document.addEventListener("dialogueend", function(e) {
                    if (e.detail["id"] == "hallway-door")
                        document.getElementById("hallway-door").style.visibility = "visible"
                })
                break;
            case "memory":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Oh non! La porte est barrée. Je dois tenter de l'ouvrir.", wait: 2000, id: "memorystart"}
                ])
                document.addEventListener("dialogueend", function(e) {
                    if (e.detail["id"] == "memorystart")
                        memoryGame.start()
                })
                break;
            case "cameras":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Wow! Je suis arrivé dans la salle de contrôle des caméras de surveillance...", wait: 2000},
                    {title: "Vous", text: "Ça tombe bien. Je devais justement les désactiver pour que mon évasion soit plus sécuritaire...", wait: 2500, id:"camerasstart"}
                ])
                document.addEventListener("dialogueend", function(e) {
                    console.log(e)
                    if (e.detail["id"] == "camerasstart")
                        document.getElementById("cameras-note").onclick = () => {
                            dialogueManager.displayMessages([
                                {title: "Note", text: "Mot de passe: camera123", wait: 2000}
                            ])
                            soundManager.play("pop.mp3")
                        }
                        
                        document.getElementById("cameras-computer").onclick = () => {
                            document.getElementById("cameras-computerGui").style.visibility = "visible"
                            soundManager.play("pop.mp3")
                        }
                        
                        document.getElementById("cameras-confirm").onclick = () => {
                            if(document.getElementById("cameras-input").value == "camera123"){
                                document.getElementById("cameras-confirm").style.visibility = "hidden"
                                document.getElementById("cameras-input").style.visibility = "hidden"
                                document.getElementById("cameras-instructions").innerHTML = "Mot de passe validé."
                                soundManager.play("correct2.mp3")
                                setTimeout(function(){
                                    sceneManager.display("trapdoor")
                                }, 2000)
                                
                            } else {
                                soundManager.play("wrong.mp3")
                            }
                        }
                })
                
                break;
            case "trapdoor":
                dialogueManager.displayMessages([
                    {title: "Vous", text: "Bon. Il ne me reste qu'une seule étape pour m'évader.", wait: 2000},
                    {title: "Vous", text: "Plus qu'une seule grille de ventilation à défaire et j'accède à la liberté.", wait: 3000, id:"screwstart"}
                ])
                document.addEventListener("dialogueend", function(e) {
                    if (e.detail["id"] == "screwstart")
                        screwGame.start()
                })
                
                break;
            case "ending":
                setTimeout(() => {
                    document.querySelector(".endingContainer").style.bottom = "400px"
                    setTimeout(() => {
                        document.getElementById("restart").style.visibility = "visible"
                        document.getElementById("restart").style.opacity = "1"
                    }, 16000)
                }, 1000)
                
                break;
        }
    }
}



const guiManager = {
    current: "menu",
    display: function(id){
        document.querySelector(`.gui.${this.current}`).classList.add("hidden")
        document.querySelector(`.gui.${id}`).classList.remove("hidden")
        this.current = id
    }
}

const game = {
    start: function(){
        guiManager.display("scene")
        sceneManager.display("cell")
        //sceneManager.display("trapdoor")
    }
}

const dialogueManager = {
    container: document.querySelector(".dialogueContainer"),
    title: document.getElementById("dialogueTitle"),
    text: document.getElementById("dialogueText"),
    visible: false,
    setVisible: function(value){
        if(value){
            this.container.style.visibility = "visible"
        } else {
            this.container.style.visibility = "hidden"
        }
    },
    displayMessages: function(lines){
        let index = 0
        this.text.innerHTML = ""
        sceneManager.ready = false
        this.setVisible(true)
        function next(){
            if(index+1 <= lines.length){
                dialogueManager.text.innerHTML = ""
                dialogueManager.title.innerHTML = lines[index]["title"]
                const msg = lines[index]["text"];
                if(lines[index].hasOwnProperty("id")){
                    let event = new CustomEvent("dialoguestart", {
                        detail: {id: lines[index]["id"]}
                    })
                    document.dispatchEvent(event)
                }
                for (let i = 0; i < msg.length; i++) {
                    setTimeout(() => {
                        dialogueManager.text.textContent += msg[i];
                        if(i % 40 == 0){
                            console.log("a")
                            soundManager.play("dialogueclick.mp3")
                        }
                        
                        if(i == msg.length-1){
                            let wait;
                            if(lines[index].hasOwnProperty("wait")) {
                                wait = lines[index]["wait"]
                            } else {
                                wait = 1000
                            }        
                            index++
                            setTimeout(() => {
                                if(lines[index-1].hasOwnProperty("id")){
                                    let event = new CustomEvent("dialogueend", {
                                        detail: {id: lines[index-1]["id"]}
                                    })
                                    console.log(event)
                                    document.dispatchEvent(event)
                                }
                                next()
                            }, wait)
                        }
                    }, i * 15);
                }
            } else {
                console.log("a")
                sceneManager.ready = true
                dialogueManager.setVisible(false)
            }
            
            
        }
        next()

        
    }

}



document.getElementById("playButton").onclick = () => {
    game.start()
}







document.getElementById("hallway-door").onclick = () => {
    sceneManager.display("memory")
}
const memoryGame = {
    sequence: "",
    playerSequence: "",
    canPlay: false,
    active: false,
    buttons: document.querySelectorAll("#memory-pad button"),
    start: function(){
        this.active = true
        this.restart()
        this.registerListeners()
    },
    playSequence: function(seq){
        let array = seq.toString().split("")
        console.log(array)
        console.log(seq)
        for(let i = 0; i < array.length; i++){
            setTimeout(() => {
                console.log(this.buttons[parseInt(array[i])])
                this.buttons[parseInt(array[i])].classList.add("computerActive")
                soundManager.play("note.mp3")
                setTimeout(() => {
                    this.buttons[parseInt(array[i])].classList.remove("computerActive")
                }, 750)
                if(i == array.length-1){
                    console.log("done")
                    this.canPlay = true
                }
            }, i*1000)
            
        }
    },
    restart: function(){
        this.playerSequence = ""
        this.sequence = ""
        this.canPlay = false
        for(let i = 0; i < 5; i++){
            let randomNum = Math.floor(Math.random() * 8)
            this.sequence += String(randomNum)
        }
        this.playSequence(this.sequence)
    },
    registerListeners: function(){
        this.buttons.forEach(btn => {
            btn.onclick = () => {
                if(this.canPlay){
                    this.playerSequence += btn.value
                    let seq = this.sequence.substring(0, this.playerSequence.length)
                    if(this.playerSequence == seq){
                        soundManager.play("note.mp3")
                        btn.classList.add("playerActive")
                        setTimeout(() => {
                            if(this.active){
                                btn.classList.remove("playerActive")
                            }
                            
                        }, 250)
                        if(this.sequence.length == this.playerSequence.length){
                            soundManager.play("correct.mp3")
                            this.end()
                        }
                    } else {
                        btn.classList.add("playerWrong")
                        soundManager.play("wrong.mp3")
                        this.canPlay = false
                        setTimeout(() => {
                            btn.classList.remove("playerWrong")
                            this.restart()
                        }, 1000)
                        
                    }
                }
                
            }
        })
    },
    end: function(){
        this.active = false
        this.canPlay = false
        this.buttons.forEach(btn => {
            btn.classList.add("playerActive")
        })
        setTimeout(() => {
            sceneManager.display("cameras")
        }, 2000)
    }

}

const screwGame = {
    screws: [],
    selectedScrew: null,
    screwCount: 4,
    returnScrewObj: function(btn){
        let obj;
        this.screws.forEach(screw => {
            if(screw.button == btn) { 
                obj = screw
            }
        })
        return obj;
    },
    start: function(){
        document.querySelectorAll(".trapdoor-screw").forEach(btn => {
        
            this.screws.push({button: btn, completion: 0})
            btn.onclick = () => {
                this.setSelected(this.returnScrewObj(btn))
            }
        })

        document.addEventListener("keydown", (e) => {
            console.log(e)
            if(this.selectedScrew !== null){
                if(e.code == "Space"){
                    if(this.selectedScrew.completion <= 1){
                        this.selectedScrew.completion += 0.01
                        this.selectedScrew.button.style.rotate = `${this.selectedScrew.completion*-1400}deg`
                        this.selectedScrew.button.style.transform = `scale(${1+this.selectedScrew.completion*0.3})`
                        console.log(Math.round(this.selectedScrew.completion*100))
                        if(Math.round(this.selectedScrew.completion*100) % 20 == 0 || Math.round(this.selectedScrew.completion*100) == 1) {
                            soundManager.play("screw.mp3")
                        }
                    } else {
                        this.selectedScrew.button.classList.add("screwGone")
                        this.selectedScrew = null;
                        this.screwCount--;
                        soundManager.play("pop2.mp3")
                        
                        if(this.screwCount <= 0){
                            console.log("game done")
                            document.querySelector(".gameScene-trapdoor h3").style.opacity = 0
                            setTimeout(() => {
                                document.getElementById("trapdoor-grid").style.bottom = "-700px"
                                setTimeout(() => {
                                    dialogueManager.displayMessages([
                                        {title: "Vous", text: "Enfin! J'ai réussi à faire tomber ce grillage.", wait: 1500},
                                        {title: "Vous", text: "Bon. Il ne me reste plus qu'une chose à faire... M'évader de cette FOUTUE prison!", wait: 2000}
                                    ])
                                    setTimeout(() => {
                                        document.querySelector(".trapdoor-gridContainer").style.cursor = "pointer"
                                        document.querySelector(".trapdoor-gridContainer").onclick = () => {
                                            sceneManager.display("ending")
                                        }
                                    }, 4000)
                                    
                                }, 2000)
                            }, 1000)
                            
                        }
                    }
                    
                }
            }
        })
        
    },
    
    setSelected: function(screw){
        if(this.selectedScrew !== screw && screw.completion < 1){
            document.querySelector(".gameScene-trapdoor h3").style.opacity = 1
            if(this.selectedScrew !== null){
                this.selectedScrew.button.style.borderColor = "black"
            }
            this.selectedScrew = screw
            soundManager.play("pop.mp3")
            screw.button.style.borderColor = "red"
        }
    },
}

