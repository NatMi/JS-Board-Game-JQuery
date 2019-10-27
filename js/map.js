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
        let newWeapon = map.randomPosition(map.allSquares());
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
    this.generatePosition = mapSquareCollectionName => {
      let isOnMap = 0;
      while (isOnMap < 1) {
        let newPlayer = map.randomPosition(mapSquareCollectionName);
        if (newPlayer.className === "mapSquare") {
          newPlayer.classList.add(this.cssClass);
          isOnMap++;
        }
        this.position = $(`.${this.cssClass}`)[0]; //jQuery: selecting first element of this.cssClass (i.e. playerOne/ playerTwo) HTML collection.
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
    };

    this.createStatbox = () => {
      let playerStatbox = $(`#${this.statboxId}`); // jQuery: selecting element with player's statbox id
      playerStatbox.html(""); // jQuery: using html() method to change elements's innerHTML
      playerStatbox.append($("<p></p>").text(`HEALTH: ${this.healthPoints}`)); // jQuery: appending new p with text content to selected elment
      playerStatbox.append($("<p></p>").text(`WEAPON: ${this.Weapon.name}`));
      playerStatbox.append(
        $("<div></div>").addClass(`weaponIcon ${this.Weapon.cssClass}`)
      ); // jQuery: appending new div and adding classes to it
      playerStatbox.append($("<p></p>").text(`DAMAGE: ${this.Weapon.damage}`));
    };
  }
}
/////////////////////////////    MAP   /////////////////////////////////////
let map = {
  allSquares: () => {
    return $(".mapSquare");
  }, // JQuery: checking HTML collection od mapSquare class elements

  firstRow: () => {
    return $("#mapGrid .mapGridRow:first .mapSquare"); //JQuery: selecting element, then inner elements of its first and last child
  },
  lastRow: () => {
    return $("#mapGrid .mapGridRow:last .mapSquare");
  },
  randomPosition: collectionName => {
    let randomIndex = Math.floor(Math.random() * collectionName.length);
    return collectionName[randomIndex]; // new random square
  },
  generateDimmedSquares: () => {
    let totalDimmed = 0;
    while (totalDimmed < 15) {
      let newDimmedSquare = map.randomPosition(map.allSquares());

      if (newDimmedSquare.className === "mapSquare") {
        newDimmedSquare.classList.add("dimmedSquare");
        totalDimmed++;
      }
    }
  },
  drawMapGrid: size => {
    for (let row = 0; row < size; row++) {
      $("#mapGrid").append($("<div></div").addClass("mapGridRow"));

      for (let column = 0; column < size; column++) {
        // JQuery: 1. Create div object,add mapSquareClass and id attribute (coordinates)
        let mapSquare = $("<div></div>")
          .addClass("mapSquare")
          .attr("id", `${[row]}-${[column + 1]}`);

        $(".mapGridRow:last").append(mapSquare);
      }
    }
  }
};

let game = {
  playerOne: "",
  playerTwo: "",

  newGame: () => {
    $("#mapGrid").fadeOut(10);
    $("#mapGrid")
      .html("")
      .removeClass("disabled")
      .fadeIn(900); // JQuery: using fadeIn() and fadeOut() effects, clearing mapGrid and removing pointer events blockade from previous game
    $(".btnBox").css("display", "none"); //hides fightMode button elements
    map.drawMapGrid(12);
    $(".stats-window").css("display", "block"); // sets statbox display to block ("none" before the game starts)
    game.playerOne = new Player("playerOne", "statboxOne");
    game.playerTwo = new Player("playerTwo", "statboxTwo");
    map.generateDimmedSquares();
    game.playerOne.generatePosition(map.firstRow());
    game.playerTwo.generatePosition(map.lastRow());
    game.playerOne.isActive = true;
    movementManager.checkAvailableSquares(game.activePlayer());
    weapons.generateOnMap();
    game.playerOne.createStatbox();
    game.playerTwo.createStatbox();
  },
  fightMode: () => {
    $("#mapGrid").addClass("disabled");
    game.btnBox().style.display = "block";
    movementManager.clearAccessible();
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
    } else {
      game.playerTwo.isActive = false;
      game.playerOne.isActive = true;
    }
  },
  availableSquares: () => {
    return $(".availableSquare");
  },

  btnBox: () => {
    let btn = "";
    if (game.activePlayer() == game.playerOne) {
      btn = $(".btnBox").get(0);
    } else {
      btn = $(".btnBox").get(1);
    }
    return btn;
  },
  toggleBtnBox: () => {
    game.btnBox().style.display = "none";
    game.toggleIsActive();
    game.btnBox().style.display = "block";
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
        let newCheckId = $(`#${newCheck}`);

        if (newCheckId == null) {
          break;
        } else if (
          i == 0 &&
          (newCheckId.hasClass("playerOne") || newCheckId.hasClass("playerTwo"))
        ) {
          game.fightMode();
          break;
        } else if (
          newCheckId.hasClass("playerOne") ||
          newCheckId.hasClass("playerTwo")
        ) {
          break;
        } else if (newCheckId.hasClass("dimmedSquare")) {
          break;
        } else {
          newCheckId.addClass("availableSquare");
        }
      }
    }

    check(player, 0, -1); //up
    check(player, 0, 1); //down
    check(player, 1, -1); //left
    check(player, 1, 1); //right
  },
  takePlayerAway: player => {
    $(`#${player.position.id}`).removeClass(`${player.cssClass}`);
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
    let chosenSquare = event.target;
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

//////////////////////////   CLICK EVENTS delegation /////////////////////////////////////////
$("body").on("click", () => {
  // JQuery: selecting element to which .on() event handling method is attached.
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
