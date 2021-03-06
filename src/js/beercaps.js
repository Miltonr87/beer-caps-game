// MODEL - Here the beer position records are kept (where they are, hit and discovered)

const model = {
  boardSize: 7,
  numBeers: 3,
  beerLength: 3,
  beersDrink: 0,

  beers: [
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
  ],

  // Original hard-coded values for beers locations
  /*
	beers: [
		{ locations: ["06", "16", "26"], hits: ["", "", ""] },
		{ locations: ["24", "34", "44"], hits: ["", "", ""] },
		{ locations: ["10", "11", "12"], hits: ["", "", ""] }
	],
*/

  drink: function (guess) {
    for (var i = 0; i < this.numBeers; i++) {
      let beer = this.beers[i];
      let index = beer.locations.indexOf(guess);

      // here's an improvement! Check to see if the beer
      // has already been found, message the user, and return true.
      if (beer.hits[index] === "hit") {
        view.displayMessage("Oops, you already hit that LOCATION 🎯");
        return true;
      } else if (index >= 0) {
        beer.hits[index] = "hit";
        view.displayHit(guess);
        view.displayMessage("Found a BEER 🍺");

        if (this.isSunk(beer)) {
          view.displayMessage("Hat-trick! CHEERS 🍻");
          this.beersDrink++;
        }
        return true;
      }
    }
    view.displayMiss(guess);
    view.displayMessage("You MISSED ❌");
    return false;
  },

  isSunk: function (beer) {
    for (var i = 0; i < this.beerLength; i++) {
      if (beer.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateBeerLocations: function () {
    let locations;
    for (var i = 0; i < this.numBeers; i++) {
      do {
        locations = this.generateBeer();
      } while (this.collision(locations));
      this.beers[i].locations = locations;
    }
    console.log("Beers array: ");
    console.log(this.beers);
  },

  generateBeer: function () {
    let direction = Math.floor(Math.random() * 2);
    let row, col;

    if (direction === 1) {
      // horizontal
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.beerLength + 1));
    } else {
      // vertical
      row = Math.floor(Math.random() * (this.boardSize - this.beerLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    let newBeerLocations = [];
    for (let i = 0; i < this.beerLength; i++) {
      if (direction === 1) {
        newBeerLocations.push(row + "" + (col + i));
      } else {
        newBeerLocations.push(row + i + "" + col);
      }
    }
    return newBeerLocations;
  },

  // Collision - try to avoid bugs with beers in same position

  collision: function (locations) {
    for (let i = 0; i < this.numBeers; i++) {
      let beer = this.beers[i];
      for (let j = 0; j < locations.length; j++) {
        if (beer.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },
};

// VIEW - Objective is to keep the display updated with hits, errors and addition messages

const view = {
  displayMessage: function (msg) {
    const messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },

  displayHit: function (location) {
    const cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
    cell.innerHTML = "";
  },

  displayMiss: function (location) {
    const cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
    cell.innerHTML = "";
  },
};

// CONTROLLER - Connects everything including getting user input and game logic

const controller = {
  guesses: 0,

  processGuess: function (guess) {
    let location = parseGuess(guess);
    if (location) {
      this.guesses++;
      let hit = model.drink(location);
      if (hit && model.beersDrink === model.numBeers) {
        view.displayMessage(
          "Now, you drink all BEERS🍺 in " + this.guesses + " guesses"
        );
      }
    }
  },
};

// helper function to parse a guess from the user

function parseGuess(guess) {
  const alphabet = ["A", "B", "C", "D", "E", "F", "G"];

  if (guess === null || guess.length !== 2) {
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    let firstChar = guess.charAt(0);
    let row = alphabet.indexOf(firstChar);
    let column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.boardSize
    ) {
      alert("Oops, that's off the board!");
    } else {
      return row + column;
    }
  }
  return null;
}

// event handlers

function handledrinkButton() {
  const guessInput = document.getElementById("guessInput");
  let guess = guessInput.value.toUpperCase();

  controller.processGuess(guess);

  guessInput.value = "";
}

function handleKeyPress(e) {
  const drinkButton = document.getElementById("drinkButton");

  // in IE9 and earlier, the event object doesn't get passed
  // to the event handler correctly, so we use window.event instead.
  e = e || window.event;

  if (e.keyCode === 13) {
    drinkButton.click();
    return false;
  }
}

// init - called when the page has completed loading

window.onload = init;

function init() {
  // drink! button onclick handler
  const drinkButton = document.getElementById("drinkButton");
  drinkButton.onclick = handledrinkButton;

  // handle "return" key press
  const guessInput = document.getElementById("guessInput");
  guessInput.onkeypress = handleKeyPress;

  // place the ships on the game board
  model.generateBeerLocations();
}
