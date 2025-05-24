import { userDataManager, sceneManager, soundManager } from "./main.js";


class ShopManager {
    constructor() {
        this.currentCategory = "none";
        this.userDataManager = userDataManager;
        this.guiManager = sceneManager;
        this.soundManager = soundManager;
        this.categoryList = document.querySelector(".itemsContainer");
        this.showcasePreview = document.querySelector(".preview");
        this.description = document.querySelector(".description");
        this.buyButton = document.getElementById("buy");
        this.priceTag = document.getElementById("shopPrice");
        this.playerCoins = document.getElementById("playerCoins");

        // Default skins data (This can be refactored as an external module if needed)
        this.shopItems = {
            skins: {
                default: {
                    name: "Chicken",
                    src: "assets/images/player/chicken.png",
                    price: 0,
                    description: "The default chicken.",
                },
                duck: {
                    name: "Duck",
                    src: "assets/images/player/duck.png",
                    price: 10,
                    description: "A duck, a simple bird.",
                },
                bear: {
                    name: "Bear",
                    src: "assets/images/player/bear.png",
                    price: 100,
                    description: "A bear, a big animal.",
                }
            },
        };
    }

    // Open shop GUI.
    openShop() {
        this.guiManager.display("shop");
        this.displayCategory("skins");
        this.updateCoins();
    }

    // Closes shop GUI and displays menu.
    closeShop() {
        this.guiManager.display("menu");
        this.categoryList.innerHTML = "";
        this.showcasePreview.style.backgroundImage = "";
        this.description.innerHTML = "";
        this.showcasePreview.style.visibility = "hidden";
        this.currentCategory = "none";
        this.clearListeners();
    }

    // Showcase item image and description.
    showcase(key, item, category) {
        this.clearListeners();
        this.showcasePreview.style.backgroundImage = `url(${item.src})`;
        this.description.innerHTML = item.description;
        this.showcasePreview.style.visibility = "visible";
        this.priceTag.innerHTML = item.price;

        // If player owns item
        if (this.userDataManager.getUserData().owned[category].includes(key)) {
            if (this.userDataManager.getUserData().info.activeSkin == key) {
                this.buyButton.innerHTML = "Selected";
            } else if (this.userDataManager.getUserData().info.activePerks.includes(key)) {
                this.buyButton.innerHTML = "Active";
            } else {
                this.buyButton.innerHTML = "Select";
                this.buyButton.onclick = () => {
                    if (category == "skins") {
                        this.userDataManager.setSkin(key);
                        this.showcase(key, item, category);
                    }
                    this.soundManager.play("click2");
                };
            }
        } else {
            this.buyButton.innerHTML = "Buy";
            this.buyButton.onclick = () => {
                this.buy(category, key);
            };
        }
    }

    // Clear buy button's listeners
    clearListeners() {
        const newBtn = this.buyButton.cloneNode(true);
        this.buyButton.parentNode.replaceChild(newBtn, this.buyButton);
        this.buyButton = document.getElementById("buy");
    }

    // Displays a category and its items
    displayCategory(category) {
        if (this.currentCategory !== category) {
            this.soundManager.play("click", 2);
            this.clearListeners();
            this.showcasePreview.style.backgroundImage = "";
            this.description.innerHTML = "";
            this.showcasePreview.style.visibility = "hidden";
            this.currentCategory = category;
            document.querySelectorAll(".category button").forEach((btn) => {
                if (btn.classList) {
                    btn.classList.remove("active");
                }
            });
            this.categoryList.innerHTML = "";
            const items = Object.entries(this.shopItems[category]);
            items.forEach((i) => {
                const li = document.createElement("li");
                li.innerHTML = i[1].name;
                this.categoryList.appendChild(li);
                li.addEventListener("click", () => {
                    this.soundManager.play("click", 2);
                    this.categoryList.childNodes.forEach((c) => {
                        if (c.classList) c.classList.remove("active");
                    });
                    li.classList.add("active");
                    this.showcase(i[0], i[1], category);
                });
            });
        }
    }

    // Update coins amount
    updateCoins() {
        console.log(this.userDataManager.getUserData())
        
        this.playerCoins.innerHTML = this.userDataManager.getUserData().info.coins;
    }

    // Buy items
    buy(category, id) {
        const price = this.shopItems[category][id].price;
        if (this.userDataManager.getUserData().info.coins >= price) {
            this.userDataManager.getUserData().owned[category].push(id);
            this.showcase(id, this.shopItems[category][id], category);
            this.userDataManager.removeCoins(price);
            this.soundManager.play("cash");
            this.updateCoins();
        } else {
            this.soundManager.play("error", 0.5);
        }
    }
}

// Export the ShopManager class
export {ShopManager};
