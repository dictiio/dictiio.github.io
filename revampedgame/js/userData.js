class UserDataManager {
    constructor() {
        this.userData = {
            owned: {
                skins: ["default"],
                perks: []
            },
            info: {
                coins: 0,
                highestDistance: 0,
                activeSkin: "default",
                activePerks: []
            }
        };
    }

    // Retrieve user data from local storage.
    retrieve() {
        if (localStorage.getItem("userData") == null) {
            localStorage.setItem("userData", JSON.stringify(this.userData));
        }
        this.userData = JSON.parse(localStorage.getItem("userData"));
        console.log(this.userData);
    }

    // Save all user data to local storage.
    save() {
        localStorage.setItem("userData", JSON.stringify(this.userData));
    }

    // Clears local storage.
    reset() {
        localStorage.clear();
    }

    // Returns user data.
    getUserData() {
        return this.userData;
    }

    // Add coins to user data.
    addCoins(coins) {
        this.userData.info.coins += coins;
        this.save();
    }

    // Removes coins from user data.
    removeCoins(coins) {
        this.userData.info.coins -= coins;
        this.save();
    }

    // Sets active skin of user data.
    setSkin(skin) {
        this.userData.info.activeSkin = skin;
        this.save();
    }

    // Add perks to user data.
    addPerk(perk) {
        this.userData.owned.perks.push(perk);
        this.userData.info.activePerks.push(perk);
        this.save();
    }

    // Sets highest distance of user.
    setHighestDistance(distance) {
        this.userData.info.highestDistance = distance;
        this.save();
    }
}

// Export the class to be used in other files
export {UserDataManager};