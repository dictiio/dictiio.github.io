let userData = {
    owned: {
        skins: ["default"],
        perks: []
    },
    info: {
        coins: 0,
        activeSkin: "default",
        activePerks: []
    }
}

const userDataManager = {
    retrieve: function(){
        if(localStorage.getItem("userData") == null) localStorage.setItem("userData", JSON.stringify(userData))
        userData = JSON.parse(localStorage.getItem("userData"))
        console.log(userData)
    },
    save: function(){
        localStorage.setItem("userData", JSON.stringify(userData))
    },
    reset: function(){
        localStorage.clear()
    },
    getUserData: function(){
        return userData
    },
    addCoins: function(coins){
        userData.info.coins += coins
        this.save()
    },
    removeCoins: function(coins){
        userData.info.coins -= coins
        this.save()
    },
    setSkin: function(skin){
        userData.info.activeSkin = skin
        this.save()
    }
}

userDataManager.retrieve()