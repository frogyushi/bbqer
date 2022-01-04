class Handler {
    static collision(player, object) {
        if (
            player.x > object.x - 2 &&
            player.x < object.x + object.width + 2 &&
            player.y > object.y - 1 &&
            player.y < object.y + object.height + 3
        ) {
            switch (player.recent_key) {
                case "w":
                    player.y = object.height + 3;
                    break;
                case "a":
                    player.x = object.x + object.width + 2;
                    break;
                case "s":
                    player.y = object.y - 1;
                    break;
                case "d":
                    player.x = object.x - 2;
                    break;
            }
        }
    }

    static interaction(player, object) {
        if (
            player.x > object.x - 3 &&
            player.x < object.x + object.width + 3 &&
            player.y > object.y - 2 &&
            player.y < object.y + object.height + 6
        ) {
            if (player.recent_key !== " ") return;
            if (object.event) object.event(player);
        }
    }
}

class Game {
    static PIXEL_SIZE = 6;
    static TILE_SIZE = 16;

    constructor() {
        this.objects = new Set();
        this.score = 0;
    }

    addObject(...objects) {
        objects.forEach(obj => this.objects.add(obj));
    }

    objectHandler(player) {
        for (const object of this.objects) {
            Handler.collision(player, object);
            Handler.interaction(player, object);
        }
    }

    gameTimer() {
        let time = 60;
        document.getElementById("timer").innerHTML = "TIMER: " + time;

        function ye() {
            if (time === 0) {
                clearInterval(timer);
                document.getElementById("game-map").style.display = "none";
                document.getElementById("score1").innerHTML = "SCORE: " + game.score;
                document.getElementById("end").style.display = "unset";
            }

            document.getElementById("timer").innerHTML = "TIMER: " + time;
            time--;
        }

        ye();

        const timer = setInterval(() => {
            ye();
        }, 1000);
    }
}

class GameObject {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

class MapObject extends GameObject {
    constructor({ image = null, x, y, width, height }) {
        x *= Game.TILE_SIZE;
        y *= Game.TILE_SIZE;
        super({ x, y });

        this.image = image;
        this.width = width * Game.TILE_SIZE;
        this.height = height * Game.TILE_SIZE;
    }
}

class Stove extends MapObject {
    static PREP_TIME_MEAT = 5;

    constructor({ id, image, height, width, x, y }) {
        super({ image, x, y, width, height });
        this.id = id;
        this.isStoveActive = false;
        this.meatHasCooked = false;
    }

    event(player) {
        if (this.meatHasCooked && !player.inventory) {
            this.meatHasCooked = false;
            player.inventory = "cooked";
            document.getElementById(`cook-timer-${this.id}`).innerHTML = "<p></p>";
            document.getElementById("inventory").innerHTML = "INVENTORY: COOKED MEAT";
            console.log("grabbed meat");
            return;
        }

        if (
            player.inventory === "raw" &&
            this.isStoveActive === false &&
            this.meatHasCooked === false
        ) {
            player.inventory = null;
            document.getElementById("inventory").innerHTML = "INVENTORY: NONE";
            this.isStoveActive = true;

            let timer = Stove.PREP_TIME_MEAT;
            const cooking = setInterval(() => {
                if (timer === 0) {
                    this.meatHasCooked = true;
                    this.isStoveActive = false;
                    document.getElementById(`cook-timer-${this.id}`).innerHTML = `<p>DONE</p>`;
                    clearInterval(timer);
                    clearInterval(cooking);
                } else {
                    document.getElementById(`cook-timer-${this.id}`).innerHTML = `<p>${timer}</p>`;
                };

                timer--;
            }, 1000);
        };
    }
}

class Dispenser extends MapObject {
    constructor({ image, height, width, x, y }) {
        super({ image, x, y, width, height });
    }

    event(player) {
        if (!player.inventory) {
            player.inventory = "raw";
            document.getElementById("inventory").innerHTML = "INVENTORY: RAW MEAT";
            console.log("equipped");
        }
    }
}

class Collector extends MapObject {
    constructor({ image, height, width, x, y }) {
        super({ image, x, y, width, height });
    }

    event(player) {
        if (player.inventory === "cooked") {
            player.inventory = null;
            console.log("collected");
            game.score += 100;
            document.getElementById("score").innerHTML = "SCORE: " + game.score;
            document.getElementById("inventory").innerHTML = "INVENTORY: NONE";
        }
    }
}

class Barrier extends MapObject {
    constructor({ height, width, x, y }) {
        super({ x, y, width, height });
    }
}

class Player {
    constructor({ x, y }) {
        this.x = x * Game.TILE_SIZE;
        this.y = y * Game.TILE_SIZE;
        this.facing_direction = null;
        this.inventory = null;
        this.key_presses = new Set();
        this.is_moving = false;
    }

    get recent_key() {
        let key;
        for (key of this.key_presses);
        return key;
    }

    initController() {
        switch (this.recent_key) {
            case "w":
                this.facing_direction = "UP";
                this.y--;
                break;
            case "a":
                this.facing_direction = "LEFT";
                this.x--;
                break;
            case "s":
                this.facing_direction = "DOWN";
                this.y++;
                break;
            case "d":
                this.facing_direction = "RIGHT";
                this.x++;
                break;
            case "e":
                this.inventory = "";
                document.getElementById("inventory").innerHTML = "INVENTORY: NONE";
                break;
            case "f":
                console.log(game.score);
                break;
        }

        if (player.recent_key === " ") return;

        this.is_moving = this.recent_key ? true : false;
    }
}

const game = new Game();

const player = new Player({ x: 1.5, y: 2 });

const stove1 = new Stove({
    id: 1,
    image: "./images/stove.png",
    height: 1,
    width: 1,
    x: 1,
    y: 0,
});

const stove2 = new Stove({
    id: 2,
    image: "./images/stove.png",
    height: 1,
    width: 1,
    x: 2,
    y: 2,
});

const dispenser = new Dispenser({
    image: "./images/dispenser.png",
    height: 1,
    width: 1,
    x: 2,
    y: 0
});

const collector = new Collector({
    image: "./images/collector.png",
    height: 1,
    width: 1,
    x: 0,
    y: 0
});

const barrier_left = new Barrier({
    height: 3,
    width: 1,
    x: -1,
    y: 0
});

const barrier_right = new Barrier({
    height: 3,
    width: 1,
    x: 3,
    y: 0
});

const barrier_bottom = new Barrier({
    height: 1,
    width: 3,
    x: 0,
    y: 3
});

game.addObject(collector, dispenser, stove1, stove2, barrier_left, barrier_right, barrier_bottom);

function update() {
    player.initController();
    game.objectHandler(player);

    const playerhtm = document.getElementById("player");
    playerhtm.setAttribute("facing_direction", player.facing_direction);
    playerhtm.setAttribute("is_moving", player.is_moving);
    playerhtm.style.transform = `translate3d(${player.x * Game.PIXEL_SIZE}px, ${player.y * Game.PIXEL_SIZE}px, 0)`;

    requestAnimationFrame(update);
}

function start() {
    document.getElementById("game-map").style.display = "unset";
    document.getElementById("begin").style.display = "none";
    game.gameTimer();
    update();
}

window.addEventListener("keydown", event => player.key_presses.add(event.key));
window.addEventListener("keyup", event => player.key_presses.delete(event.key));
