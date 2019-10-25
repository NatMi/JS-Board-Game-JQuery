//////////////////////   WEAPONS   /////////////////////////////////////
let weapons = {
  allItems: [
    { name: "Snowball", cssClass: "snowball", damage: 10 },
    { name: "Fish", cssClass: "fish", damage: 15 },
    { name: "Small stone", cssClass: "smallStone", damage: 20 },
    { name: "Big stone", cssClass: "bigStone", damage: 30 }
  ],
  pickable: () => {
    return weapons.allItems.filter(item => {
      return item.damage > 10;
    });
  },
  default: () => {
    return weapons.allItems[0];
  },
  generateOnMap: () => {
    for (let weapon of weapons.pickable()) {
      let isOnMap = 0;
      while (isOnMap < 2) {
        let newWeapon = map.randomPosition(map.allSquares);
        if (newWeapon.className === "mapSquare") {
          newWeapon.classList.add(weapon.cssClass);
          isOnMap++;
        }
      }
    }
  }
};

//////////////////////////   PLAYER   /////////////////////////////////
class Player {
  constructor(cssClass, statboxId) {
    this.cssClass = cssClass;
    this.statboxId = statboxId;
    this.isActive = false;
    this.position = null;
    this.healthPoints = 100;
    this.Weapon = weapons.default();
    this.defenceMultiplier = 1;
    this.generatePosition = collectionName => {
      let isOnMap = 0;
      while (isOnMap < 1) {
        let newPlayer = map.randomPosition(collectionName);
        if (newPlayer.className === "mapSquare") {
          newPlayer.classList.add(this.cssClass);
          isOnMap++;
        }
        this.position = document.getElementsByClassName(this.cssClass)[0];
      }
    };
    this.positionArray = () => {
      let currentId = this.position.id.split("-");
      currentId[0] = parseInt(currentId[0]);
      currentId[1] = parseInt(currentId[1]);
      return currentId;
    };
    this.attack = () => {
      game.inactivePlayer().healthPoints =
        game.inactivePlayer().healthPoints -
        this.Weapon.damage * game.inactivePlayer().defenceMultiplier;
      game.inactivePlayer().defenceMultiplier = 1;
      if (game.inactivePlayer().healthPoints > 0) {
        game.inactivePlayer().createStatbox();
        game.toggleBtnBox();
        game.toggleIsActive();
      } else if (game.inactivePlayer().healthPoints <= 0) {
        game.inactivePlayer().healthPoints = 0;
        game.inactivePlayer().createStatbox();
        game.btnBox().style.display = "none";
        alert(`Game over! Winner: ${this.cssClass}`);
      }
    };
    this.defend = () => {
      this.defenceMultiplier = 0.5;
      game.toggleBtnBox();
      game.toggleIsActive();
    };

    this.createStatbox = () => {
      document.getElementById(`${this.statboxId}`).innerHTML = "";
      let paragraphHealth = document.createElement("p");
      let health = document.createTextNode(`HEALTH: ${this.healthPoints}`);
      paragraphHealth.appendChild(health);
      document.getElementById(`${this.statboxId}`).appendChild(paragraphHealth);

      let paragraphWeapon = document.createElement("p");
      let weapon = document.createTextNode(`WEAPON: ${this.Weapon.name}`);
      let weaponIcon = document.createElement("div");
      weaponIcon.classList.add(`${this.Weapon.cssClass}`);
      weaponIcon.classList.add("weaponIcon");
      paragraphWeapon.appendChild(weapon);
      paragraphWeapon.appendChild(weaponIcon);
      document.getElementById(`${this.statboxId}`).appendChild(paragraphWeapon);

      let paragraphDamage = document.createElement("p");
      let damage = document.createTextNode(`DAMAGE: ${this.Weapon.damage}`);

      paragraphDamage.appendChild(damage);
      document.getElementById(`${this.statboxId}`).appendChild(paragraphDamage);

      /* Code below adds info about current player's positions to the statbox*/
      // let paragraphPosition = document.createElement("p");
      // let position = document.createTextNode(`POSITION: ${this.position.id}`);

      // paragraphPosition.appendChild(position);
      // document
      //   .getElementById(`${this.statboxId}`)
      //   .appendChild(paragraphPosition);
    };
  }
}
/////////////////////////////    MAP   /////////////////////////////////////
let map = {
  container: document.getElementById("map-container"),
  allSquares: document.getElementsByClassName("mapSquare"),
  firstRow: () => {
    return mapGrid.firstChild.getElementsByClassName("mapSquare");
  },
  lastRow: () => {
    return mapGrid.lastChild.getElementsByClassName("mapSquare");
  },
  randomPosition: collectionName => {
    let randomIndex = Math.floor(Math.random() * collectionName.length);
    return collectionName[randomIndex]; // new random square
  },
  generateDimmedSquares: () => {
    let totalDimmed = 0;
    while (totalDimmed < 15) {
      let newDimmedSquare = map.randomPosition(map.allSquares);

      if (newDimmedSquare.className === "mapSquare") {
        newDimmedSquare.classList.add("dimmedSquare");
        totalDimmed++;
      }
    }
  },
  drawMapGrid: size => {
    for (let row = 0; row < size; row++) {
      let mapGridRow = document.createElement("div");
      mapGridRow.className = "mapGridRow";
      mapGrid.appendChild(mapGridRow);

      for (let column = 0; column < size; column++) {
        let mapSquare = document.createElement("div");
        mapSquare.className = "mapSquare";
        mapSquare.id = `${[row + 1]}-${[column + 1]}`;
        mapGridRow.appendChild(mapSquare);
      }
    }
  }
};

let game = {
  playerOne: "",
  playerTwo: "",

  newGame: () => {
    game.playerOne = new Player("playerOne", "statboxOne");
    game.playerTwo = new Player("playerTwo", "statboxTwo");
    mapGrid.innerHTML = "";
    mapGrid.classList.remove("disabled");
    map.drawMapGrid(12);
    document.getElementById("mapGrid").style.display = "block";
    document.getElementsByClassName("stats-window")[0].style.display = "block";
    document.getElementsByClassName("stats-window")[1].style.display = "block";
    map.generateDimmedSquares();
    game.playerOne.generatePosition(map.firstRow());
    game.playerTwo.generatePosition(map.lastRow());
    game.playerOne.isActive = true;
    movementManager.checkAvailableSquares(game.activePlayer());
    weapons.generateOnMap();
    document.getElementsByClassName("btnBox")[0].style.display = "none";
    document.getElementsByClassName("btnBox")[1].style.display = "none";
    game.playerOne.createStatbox();
    game.playerTwo.createStatbox();
  },
  fightMode: () => {
    mapGrid.classList.add("disabled");
    game.btnBox().style.display = "block";
  },

  activePlayer: () => {
    if (game.playerOne.isActive) {
      return game.playerOne;
    } else {
      return game.playerTwo;
    }
  },
  inactivePlayer: () => {
    if (!game.playerOne.isActive) {
      return game.playerOne;
    } else {
      return game.playerTwo;
    }
  },
  toggleIsActive: () => {
    if (game.activePlayer() == game.playerOne) {
      game.playerOne.isActive = false;
      game.playerTwo.isActive = true;
    } else if (game.activePlayer() == game.playerTwo) {
      game.playerTwo.isActive = false;
      game.playerOne.isActive = true;
    }
  },
  availableSquares: () => {
    let availables = document.getElementsByClassName("availableSquare");
    return availables;
  },

  btnBox: () => {
    let btn = "";
    if (game.activePlayer() == game.playerOne) {
      btn = document.getElementsByClassName("btnBox")[0];
    } else if (game.activePlayer() == game.playerTwo) {
      btn = document.getElementsByClassName("btnBox")[1];
    }
    return btn;
  },
  toggleBtnBox: () => {
    let btn = "";
    if (game.activePlayer() == game.playerOne) {
      btn = document.getElementsByClassName("btnBox")[0];
      btn.style.display = "none";
      btn = document.getElementsByClassName("btnBox")[1];
      btn.style.display = "block";
    } else if (game.activePlayer() == game.playerTwo) {
      btn = document.getElementsByClassName("btnBox")[1];
      btn.style.display = "none";
      btn = document.getElementsByClassName("btnBox")[0];
      btn.style.display = "block";
    }
  }
};

///////////////////////// MOVEMENT ///////////////////////////
let movementManager = {
  checkAvailableSquares: player => {
    function check(player, index, multiplier) {
      let x = player.positionArray()[0];
      let y = player.positionArray()[1];

      for (let i = 0; i < 3; i++) {
        if (index === 1) {
          y = player.positionArray()[index] + (i + 1) * multiplier;
        } else if (index === 0) {
          x = player.positionArray()[index] + (i + 1) * multiplier;
        }

        let newCheck = `${x}-${y}`;
        let newCheckId = document.getElementById(`${newCheck}`);

        if (newCheckId == null) {
          break;
        } else if (
          i == 0 &&
          (newCheckId.classList.contains("playerOne") ||
            newCheckId.classList.contains("playerTwo"))
        ) {
          game.fightMode();
          break;
        } else if (
          newCheckId.classList.contains("playerOne") ||
          newCheckId.classList.contains("playerTwo")
        ) {
          break;
        } else if (newCheckId.classList.contains("dimmedSquare")) {
          break;
        } else {
          newCheckId.classList.add("availableSquare");
        }
      }
    }

    check(player, 0, -1); //up
    check(player, 0, 1); //down
    check(player, 1, -1); //left
    check(player, 1, 1); //right
  },
  takePlayerAway: player => {
    document
      .getElementById(player.position.id)
      .classList.remove(player.cssClass);
  },
  clearAccessible: () => {
    while (game.availableSquares().length) {
      game
        .availableSquares()
        [game.availableSquares().length - 1].classList.remove(
          "availableSquare"
        );
    }
  },
  movePlayer: player => {
    movementManager.clearAccessible();
    movementManager.takePlayerAway(player);

    let chosenSquare = document.getElementById(event.target.id);
    chosenSquare.classList.add(player.cssClass);
    player.position = chosenSquare;
    // check if chosen square contains weapon
    for (let i = 0; i < weapons.allItems.length; i++) {
      if (chosenSquare.classList.contains(`${weapons.allItems[i].cssClass}`)) {
        console.log(`grabbed ${weapons.allItems[i].cssClass}`);
        chosenSquare.classList.add(`${player.Weapon.cssClass}`);
        player.Weapon = weapons.allItems.find(item => {
          return item.cssClass == weapons.allItems[i].cssClass;
        });
        chosenSquare.classList.remove(`${weapons.allItems[i].cssClass}`);
        i = weapons.allItems.length;
      }
    }

    game.toggleIsActive();
    player.createStatbox();
    movementManager.checkAvailableSquares(game.activePlayer());
  }
};

//////////////////////////   CLICK EVENTS   /////////////////////////////////////////
const body = document.querySelector("body");
body.addEventListener("click", event => {
  if (event.target.id == "newGameBtn") {
    game.newGame();
  } else if (event.target.classList.contains("availableSquare")) {
    movementManager.movePlayer(game.activePlayer());
  } else if (event.target.classList.contains("attackBtn")) {
    game.activePlayer().attack();
  } else if (event.target.classList.contains("defendBtn")) {
    game.activePlayer().defend();
  }
});
