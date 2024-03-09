const categoryList = document.querySelector(".itemsContainer")
const showcasePreview = document.querySelector(".preview")
const description = document.querySelector(".description")
let buyButton = document.getElementById("buy")
const priceTag = document.getElementById("shopPrice")
const playerCoins = document.getElementById("playerCoins")


const shopManager = {
    currentCategory: "none",
    openShop: function(){
        guiManager.display("shop")
        shopManager.displayCategory("skins")
        let buttons = document.querySelectorAll(".category button")
        buttons[0].classList.add("active")
        this.updateCoins()
    },
    closeShop: function(){
        guiManager.display("menu")
        categoryList.innerHTML = ""
        showcasePreview.style.backgroundImage = ""
        description.innerHTML = ""
        showcasePreview.style.visibility = "hidden"
        this.currentCategory = "none"
        this.clearListeners()
        soundManager.play("click")
    },
    showcase: function(key, item, category){
        this.clearListeners()
        showcasePreview.style.backgroundImage = `url(${item.src})`
        description.innerHTML = item.description
        showcasePreview.style.visibility = "visible"
        priceTag.innerHTML = "x" + item.price
        console.log({key, item, category})
        if(userData.owned[category].includes(key)){
            if(userData.info.activeSkin == key){
                buyButton.innerHTML = "Selected"
            } else if (userData.info.activePerks.includes(key)) {
                buyButton.innerHTML = "Active"
            } else {
                buyButton.innerHTML = "Select"
                buyButton.onclick = () => {
                    
                    if(category == "skins") {
                        userDataManager.setSkin(key)
                        this.showcase(key, item, category)
                    }
                    if(category == "perks") {
                        userDataManager.addPerk(key)
                        this.showcase(key, item, category)
                    }
                    soundManager.play("click2")
                    
                }
            }
            

        } else {
            buyButton.innerHTML = "Buy"
            buyButton.onclick = () => {
                shopManager.buy(category, key)
            }
        }
    },
    clearListeners: function(){
        const newBtn = buyButton.cloneNode(true)
        buyButton.parentNode.replaceChild(newBtn, buyButton)
        buyButton = document.getElementById("buy")
    },
    displayCategory: function(category){
        if(this.currentCategory != category){
            soundManager.play("click")
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
            console.log(items)
            items.forEach((i) => {
                const li = document.createElement("li")
                
                li.innerHTML = i[1].name
                categoryList.appendChild(li)
                li.addEventListener("click", () => {
                    soundManager.play("click")
                    categoryList.childNodes.forEach(c => {
                        if(c.classList) c.classList.remove("active")
                    })
                    li.classList.add("active")
                    this.showcase(i[0], i[1], category)
                })
            })
        }
        
    },
    updateCoins: function(){
        playerCoins.innerHTML = "x" + userData.info.coins
    },
    buy: function(category, id){
        const price = shopItems[category][id].price
        console.log(price)
        if(userData.info.coins >= price){
            userData.owned[category].push(id)
            this.showcase(id, shopItems[category][id], category)
            userDataManager.removeCoins(price)
            soundManager.play("cash")
            this.updateCoins()
        }
    },
    select: function(id){

    }
    
}

document.querySelectorAll(".category button").forEach(btn => {
    btn.onclick = () => {
        shopManager.displayCategory(btn.value)
        btn.classList.add("active")
    }
})