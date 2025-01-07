const categoryList = document.querySelector(".itemsContainer")
const showcasePreview = document.querySelector(".preview")
const description = document.querySelector(".description")
let buyButton = document.getElementById("buy")
const priceTag = document.getElementById("shopPrice")
const playerCoins = document.getElementById("playerCoins")

const shopItems = {
    skins: {
        default: {
            name: "Aqua Drake",
            src: "assets/images/skins/AquaDrake.png",
            price: 0,
            description: "The default, boring dragon.",
        },
        adultgreendragon: {
            name: "Adult Green Dragon",
            src: "assets/images/skins/AdultGreenDragon.png",
            price: 100,
            description: "A green dragon in its prime.",
        },
        babybrassdragon: {
            name: "Baby Brass Dragon",
            src: "assets/images/skins/BabyBrassDragon.png",
            price: 100,
            description: "A small brass dragon.",
        },
        babycopperdragon: {
            name: "Baby Copper Dragon",
            src: "assets/images/skins/BabyCopperDragon.png",
            price: 100,
            description: "A small copper dragon.",
        },
        mudwyvern: {
            name: "Mud Wyvern",
            src: "assets/images/skins/MudWyvern.png",
            price: 100,
            description: "A wyvern made of mud.",
        },
        poisondrake: {
            name: "Poison Drake",
            src: "assets/images/skins/PoisonDrake.png",
            price: 100,
            description: "A dragon made of poison.",
        },
        viridiandrake: {
            name: "Viridian Drake",
            src: "assets/images/skins/ViridianDrake.png",
            price: 100,
            description: "A green dragon.",
        },
        youngbrassdragon: {
            name: "Young Brass Dragon",
            src: "assets/images/skins/YoungBrassDragon.png",
            price: 100,
            description: "A young brass dragon.",
        }
        


        
    },
}

const shopManager = {
    currentCategory: "none",
    // Open shop GUI.
    openShop: function(){
        guiManager.display("shop")
        shopManager.displayCategory("skins")
        this.updateCoins()
    },
    // Closes shop GUI and displays menu.
    closeShop: function(){
        guiManager.display("menu")
        categoryList.innerHTML = ""
        showcasePreview.style.backgroundImage = ""
        description.innerHTML = ""
        showcasePreview.style.visibility = "hidden"
        this.currentCategory = "none"
        this.clearListeners()
        //soundManager.play("click")
    },
    // Showcase item image and description.
    showcase: function(key, item, category){
        this.clearListeners()
        showcasePreview.style.backgroundImage = `url(${item.src})`
        description.innerHTML = item.description
        showcasePreview.style.visibility = "visible"
        priceTag.innerHTML = "x" + item.price
        // If players owns item
        if(userData.owned[category].includes(key)){
            // If skin is currently active
            if(userData.info.activeSkin == key){
                buyButton.innerHTML = "Selected"
            }
            // If perk is active
            else if (userData.info.activePerks.includes(key)) {
                buyButton.innerHTML = "Active"
            } 
            // If skin/perk is not active
            else {
                buyButton.innerHTML = "Select"
                buyButton.onclick = () => {
                    
                    if(category == "skins") {
                        userDataManager.setSkin(key)
                        this.showcase(key, item, category)
                    }
                    //soundManager.play("click2")
                    
                }
            }
            
        // If player doesn't own item
        } else {
            buyButton.innerHTML = "Buy"
            buyButton.onclick = () => {
                shopManager.buy(category, key)
            }
        }
    },
    // Clear buy button's listeners
    clearListeners: function(){
        const newBtn = buyButton.cloneNode(true)
        buyButton.parentNode.replaceChild(newBtn, buyButton)
        buyButton = document.getElementById("buy")
    },
    // Displays a category and its items
    displayCategory: function(category){
        if(this.currentCategory != category){
            //soundManager.play("click")
            this.clearListeners()
            showcasePreview.style.backgroundImage = ""
            description.innerHTML = ""
            showcasePreview.style.visibility = "hidden"
            this.currentCategory = category
            document.querySelectorAll(".category button").forEach(btn => {
                if(btn.classList){
                    btn.classList.remove("active")
                }
            })
            categoryList.innerHTML = ""
            const items = Object.entries(shopItems[category])
            items.forEach((i) => {
                const li = document.createElement("li")
                
                li.innerHTML = i[1].name
                categoryList.appendChild(li)
                li.addEventListener("click", () => {
                    //soundManager.play("click")
                    categoryList.childNodes.forEach(c => {
                        if(c.classList) c.classList.remove("active")
                    })
                    li.classList.add("active")
                    this.showcase(i[0], i[1], category)
                })
            })
        }
        
    },
    // Update coins amount
    updateCoins: function(){
        playerCoins.innerHTML = "x" + userData.info.coins
        console.log("Updating coins")
    },
    // Buy items 
    buy: function(category, id){
        const price = shopItems[category][id].price
        if(userData.info.coins >= price){
            userData.owned[category].push(id)
            this.showcase(id, shopItems[category][id], category)
            userDataManager.removeCoins(price)
            //soundManager.play("cash")
            this.updateCoins()
        }
    },
}

// Category buttons listeners
document.querySelectorAll(".category button").forEach(btn => {
    btn.onclick = () => {
        shopManager.displayCategory(btn.value)
        btn.classList.add("active")
    }
})


