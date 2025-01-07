let userData = {
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
}

const userDataManager = {
    // Retrieve user data from local storage.
    retrieve: function(){
        if(localStorage.getItem("userData") == null) localStorage.setItem("userData", JSON.stringify(userData))
        userData = JSON.parse(localStorage.getItem("userData"))
        console.log(userData)
    },
    // Saves all user data to local storage.
    save: function(){
        localStorage.setItem("userData", JSON.stringify(userData))
    },
    // Clears local storage.
    reset: function(){
        localStorage.clear()
    },
    // Returns user data.
    getUserData: function(){
        return userData
    },
    // Add coins to user data.
    addCoins: function(coins){
        userData.info.coins += coins
        this.save()
    },
    // Removes coins from user data.
    removeCoins: function(coins){
        userData.info.coins -= coins
        this.save()
    },
    // Sets active skin of user data.
    setSkin: function(skin){
        userData.info.activeSkin = skin
        this.save()
    },
    // Add perks to user data.
    addPerk: function(perk){
        userData.owned.perks.push(perk)
        userData.info.activePerks.push(perk)
        this.save()
    },
    // Sets highest distance of user.
    setHighestDistance: function(distance){
        userData.info.highestDistance = distance
        this.save()
    }
}

userDataManager.reset()
userDataManager.retrieve()