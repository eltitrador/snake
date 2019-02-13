const WIDTH = 600;
const HEIGHT = 600;

const CELL_SIZE = 25;

const AREA_WIDTH = WIDTH / CELL_SIZE;
const AREA_HEIGHT = HEIGHT / CELL_SIZE;

const BACKGROUND_COLOR = "#EEE";
const SNAKE_COLOR = "#323232";
const FOOD_COLOR = "#323232";

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

const SPEEDUP = 10; // duration in ms to speed up each frame

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.next = null;
    this.segmentsToAdd = 0;
}

Node.prototype.advance = function(x, y) {
    if (this.segmentsToAdd > 0) {
        let newNode = new Node(this.x, this.y);
        newNode.next = this.next;
        this.next = newNode;
        this.segmentsToAdd--;
    } else {
        if (this.next != null) {
            this.next.advance(this.x, this.y);
        }
    }

    this.x = x;
    this.y = y;
};

Node.prototype.addSegments = function(count) {
    this.segmentsToAdd = count;
};

Node.prototype.advanceHead = function(direction) {
    let nextPosition = this.getNextPosition(direction);
    let x = nextPosition[0];
    let y = nextPosition[1];
    this.advance(x, y);
};

Node.prototype.getNextPosition = function(direction) {
    let x = this.x;
    let y = this.y;
    switch (direction) {
        case UP:
            y--;
            break;
        case RIGHT:
            x++;
            break;
        case DOWN:
            y++;
            break;
        case LEFT:
            x--;
            break;
    }
    x = (x + AREA_WIDTH) % AREA_WIDTH;
    y = (y + AREA_HEIGHT) % AREA_HEIGHT;

    return [x, y];
}

Node.prototype.occupies = function(x, y) {
    let current = this.next;
    while (current != null) {
        if (x == current.x && y == current.y) {
            return true;
        }
        current = current.next;
    }
    return false;
};


Node.prototype.doesIntersect = function() {
    return this.occupies(this.x, this.y);
};

function Game() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;

    document.addEventListener("keydown", this.onKeyPress.bind(this), false);

    this.length = 2;
    this.head = new Node(5, 5);
    this.head.addSegments(this.length - 1);
    this.direction = RIGHT;

    this.alive = true;

    this.food = {
        x: 10,
        y: 10
    };
    this.spawnFood();

    this.speed = 100;
    this.step();
}

Game.prototype.step = function() {
    this.advance();
    this.draw();
    if (this.alive)
        setTimeout(this.step.bind(this), this.speed);
};

Game.prototype.spawnFood = function() {
    let x, y;
    do {
        x = Math.floor(Math.random() * AREA_WIDTH);
        y = Math.floor(Math.random() * AREA_HEIGHT);
    } while (this.head.occupies(x, y));

    this.food.x = x;
    this.food.y = y;
};

Game.prototype.onKeyPress = function(e) {
    if (e.code == "ArrowRight" && this.direction != LEFT) {
        this.direction = RIGHT;
    }
    else if (e.code == "ArrowDown" && this.direction != UP) {
        this.direction = DOWN;
    }
    else if (e.code == "ArrowLeft" && this.direction != RIGHT) {
        this.direction = LEFT;
    }
    else if (e.code == "ArrowUp" && this.direction != DOWN) {
        this.direction = UP;
    }
}

Game.prototype.draw = function() {
    let ctx = this.ctx;

    if (this.alive) {
        this.clearCanvas();
        let current = this.head;
        this.ctx.fillStyle = SNAKE_COLOR;
        while (current != null) {
            this.ctx.fillRect(
                current.x * CELL_SIZE, current.y * CELL_SIZE,
                CELL_SIZE, CELL_SIZE
            );

            current = current.next;
        }

        ctx.fillStyle = FOOD_COLOR;
        ctx.beginPath();
        ctx.arc(
            (this.food.x + 0.5) * CELL_SIZE,
            (this.food.y + 0.5) * CELL_SIZE,
            CELL_SIZE / 2,
            0, 2 * Math.PI
        );
        ctx.fill();
    }
};

Game.prototype.clearCanvas = function() {
    let ctx = this.ctx;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

Game.prototype.displayGameOver = function() {
    this.clearCanvas();

    let ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2);
    ctx.font = "48px sans-serif";
    ctx.fillText("Maximum Length: " + this.length, WIDTH / 2, HEIGHT / 2 + 64);
}

Game.prototype.advance = function() {
    if (this.alive) {
        this.head.advanceHead(this.direction);
        if (this.head.x == this.food.x && this.head.y == this.food.y) {
            this.head.addSegments(1);
            this.length++;
            this.spawnFood();

            if (this.length % 4 == 0) {
                this.speed -= SPEEDUP;
            }
        }
        if (this.head.doesIntersect()) {
            this.alive = false;
            this.displayGameOver();
        }
    }
};

let game = new Game();

