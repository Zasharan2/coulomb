var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var canvasWidth = 512;
var canvasHeight = 512;

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

const SCREEN = {
    NULL_TO_TITLE: 0.1,
    TITLE: 1,
    TITLE_TO_GAME: 1.2,
    GAME: 2
};

var gameScreen = SCREEN.NULL_TO_TITLE;

function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 >= x2 && x1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2 ||
        x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2 ||
        x1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2 ||
        x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2) {
            return true;
    }
    return false;
}

class Button {
    constructor(text, x, y, w, h, colour, highlightColour, clickColour, textColour, textHighlightColour, textClickColour) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colour = colour;
        this.highlightColour = highlightColour;
        this.clickColour = clickColour;
        this.textColour = textColour;
        this.textHighlightColour = textHighlightColour;
        this.textClickColour = textClickColour;
        this.hovering = false;
        this.clicked = false;
    }

    update() {
        if (AABB(mouseX, mouseY, 1, 1, this.x, this.y, this.w, this.h)) {
            this.hovering = true;
            if (mouseDown) {
                this.clicked = true;
            } else {
                this.clicked = false;
            }
        } else {
            this.hovering = false;
            this.clicked = false;
        }
    }

    render() {
        ctx.beginPath();
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.clickColour;
            } else {
                ctx.fillStyle = this.highlightColour;
            }
        } else {
            ctx.fillStyle = this.colour;
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.beginPath();
        if (this.hovering) {
            if (this.clicked) {
                ctx.fillStyle = this.textClickColour;
            } else {
                ctx.fillStyle = this.textHighlightColour;
            }
        } else {
            ctx.fillStyle = this.textColour;
        }
        ctx.font = (0.7 * this.h) + "px Comic Sans MS";
        ctx.fillText(this.text, this.x + (0.1 * this.h), this.y + (0.72 * this.h));
    }
};

var playButton;

var maxArrowLength = 17;
var correction = 50000;

class Arrow {
    constructor(x, y, r, theta) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.theta = theta;
        this.xComp = r * Math.cos(theta);
        this.yComp = r * Math.sin(theta);
    }

    rectToPolar() {
        this.r = correction / (Math.pow(this.xComp, 2) + Math.pow(this.yComp, 2));
        this.theta = Math.atan2(this.yComp, this.xComp);
    }

    render() {
        ctx.beginPath();
        ctx.globalAlpha = this.r / maxArrowLength;
        ctx.strokeStyle = `rgba(255, 255, 0)`;
        // var tempCol = 1 - (this.r / maxArrowLength)
        // if (tempCol >= 0 && tempCol <= 0.25) {
        //     ctx.strokeStyle = `rgba(255, ${4 * 255 * tempCol}, 0)`;
        // }
        // if (tempCol >= 0.25 && tempCol <= 0.5) {
        //     ctx.strokeStyle = `rgba(${255 - (4 * 255 * (tempCol - 0.25))}, 255, 0)`;
        // }
        // if (tempCol >= 0.5 && tempCol <= 0.75) {
        //     ctx.strokeStyle = `rgba(0, 255, ${4 * 255 * (tempCol - 0.5)})`;
        // }
        // if (tempCol >= 0.75 && tempCol <= 1) {
        //     ctx.strokeStyle = `rgba(0, ${255 - (4 * 255 * (tempCol - 0.75))}, 255)`;
        // }
        ctx.lineWidth = 3;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (maxArrowLength * Math.cos(this.theta)), this.y - (maxArrowLength * Math.sin(this.theta)));
        ctx.moveTo(this.x + (maxArrowLength * Math.cos(this.theta)), this.y - (maxArrowLength * Math.sin(this.theta)));
        ctx.lineTo(this.x + (maxArrowLength * Math.cos(this.theta)) + ((maxArrowLength / 2) * Math.cos((1.25 * Math.PI) + this.theta)), this.y - (maxArrowLength * Math.sin(this.theta)) - ((maxArrowLength / 2) * Math.sin((1.25 * Math.PI) + this.theta)));
        ctx.moveTo(this.x + (maxArrowLength * Math.cos(this.theta)), this.y - (maxArrowLength * Math.sin(this.theta)));
        ctx.lineTo(this.x + (maxArrowLength * Math.cos(this.theta)) + ((maxArrowLength / 2) * Math.cos((0.75 * Math.PI) + this.theta)), this.y - (maxArrowLength * Math.sin(this.theta)) - ((maxArrowLength / 2) * Math.sin((0.75 * Math.PI) + this.theta)));
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
};

var gridLength = 15;
var arrows = Array(gridLength).fill().map(() => Array(gridLength).fill(0));;

var particleSize = 10;

class Particle {
    constructor(x, y, charge) {
        this.x = x;
        this.y = y;
        this.charge = charge;
    }

    render() {
        ctx.beginPath();
        if (this.charge == 1) {
            ctx.fillStyle = "#ff0000";
        } else if (this.charge == -1) {
            ctx.fillStyle = "#0000ff";
        }
        ctx.arc(this.x, this.y, particleSize, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "#ffffff";
        if (this.charge == 1) {
            ctx.fillText("+", this.x - 7, this.y + 8);
        } else if (this.charge == -1) {
            ctx.fillText("-", this.x - 6, this.y + 9);
        }

    }
}

var particles = [];

class Location {
    constructor(x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
    }

    render() {
        ctx.beginPath();
        if (this.type == "SPAWN") {
            ctx.fillStyle = "#00ff00";
        } else if (this.type == "GOAL") {
            ctx.fillStyle = "#ff00ff";
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
};

var spawnpoint;
var goalpoint;

var placeMode = 1;

var delay = 20;
var placeModeTimer = delay;
var particleAddTimer = 0;
var setup;

var gameParticle;

function resetArrows() {
    for (var i = 0; i < gridLength; i++) {
        for (var j = 0; j < gridLength; j++) {
            arrows[i][j].r = 0;
            arrows[i][j].theta = 0;
        }
    }
}

function arrowUpdateByParticles() {
    // update arrows based on particles
    for (var i = 0; i < particles.length; i++) {
        for (var k = 0; k < gridLength; k++) {
            for (var j = 0; j < gridLength; j++) {
                if (particles[i].charge == 1) {
                    var tempR = correction / ((Math.pow((arrows[k][j].x - particles[i].x), 2) + Math.pow((particles[i].y - arrows[k][j].y), 2)));
                    var tempTheta = Math.atan2((particles[i].y - arrows[k][j].y), (arrows[k][j].x - particles[i].x));
                    var xComp = (tempR * Math.cos(tempTheta)) + (arrows[k][j].r * Math.cos(arrows[k][j].theta));
                    var yComp = (tempR * Math.sin(tempTheta)) + (arrows[k][j].r * Math.sin(arrows[k][j].theta));
                    arrows[k][j].r = Math.sqrt(Math.pow((xComp), 2) + Math.pow((yComp), 2));
                    arrows[k][j].theta = Math.atan2((yComp), (xComp));
                } else if (particles[i].charge == -1) {
                    var tempR = correction / ((Math.pow((particles[i].x - arrows[k][j].x), 2) + Math.pow((arrows[k][j].y - particles[i].y), 2)));
                    var tempTheta = Math.atan2((arrows[k][j].y - particles[i].y), (particles[i].x - arrows[k][j].x));
                    var xComp = (tempR * Math.cos(tempTheta)) + (arrows[k][j].r * Math.cos(arrows[k][j].theta));
                    var yComp = (tempR * Math.sin(tempTheta)) + (arrows[k][j].r * Math.sin(arrows[k][j].theta));
                    arrows[k][j].r = Math.sqrt(Math.pow((xComp), 2) + Math.pow((yComp), 2));
                    arrows[k][j].theta = Math.atan2((yComp), (xComp));
                }

                if (arrows[k][j].r > maxArrowLength) {
                    arrows[k][j].r = maxArrowLength
                } else if (arrows[k][j].r < (-1 * maxArrowLength)) {
                    arrows[k][j].r = (-1 * maxArrowLength);
                }
            }
        }
    }    
}

function main() {
    switch (gameScreen) {
        case SCREEN.NULL_TO_TITLE: {
            playButton = new Button("PLAY", 185, 120, 115, 60, "#ff0000", "#880000", "#ffffff", "#ffffff", "#888888", "#ffffff");

            gameScreen = SCREEN.TITLE;
            break;
        }
        case SCREEN.TITLE: {
            // background
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // title
            ctx.font = "75px Comic Sans MS";
            ctx.fillStyle = "#888800";
            ctx.fillText("Coulomb", 100, 85);
            ctx.fillStyle = "#ffff00";
            ctx.fillText("Coulomb", 95, 80);

            // play button
            playButton.update();
            playButton.render();

            if (playButton.clicked) {
                gameScreen = SCREEN.TITLE_TO_GAME;
            }
            break;
        }
        case SCREEN.TITLE_TO_GAME: {
            for (var i = 0; i < gridLength; i++) {
                for (var j = 0; j < gridLength; j++) {
                    arrows[i][j] = new Arrow(10 + (i * ((canvasWidth - 20) / (gridLength - 1))), 10 + (j * ((canvasHeight - 20) / (gridLength - 1))), 0, 0);
                }
            }
            placeModeTimer = delay;
            particleAddTimer = 0;

            spawnpoint = new Location(0, 240, 32, 32, "SPAWN");
            goalpoint = new Location(480, 240, 32, 32, "GOAL");

            setup = true;

            gameScreen = SCREEN.GAME;
            break;
        }
        case SCREEN.GAME: {
            placeModeTimer++;
            particleAddTimer++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // location rendering
            ctx.globalAlpha = 0.3;
            spawnpoint.render();
            goalpoint.render();
            ctx.globalAlpha = 1;

            if (setup) {
                // mode switching
                if (keys[" "] && placeModeTimer > delay) {
                    placeModeTimer = 0;
                    placeMode *= -1;
                }

                // arrow handling
                for (var i = 0; i < gridLength; i++) {
                    for (var j = 0; j < gridLength; j++) {
                        if (placeMode == 1) {
                            // arrows[i][j].xComp = arrows[i][j].x - mouseX;
                            // arrows[i][j].yComp = mouseY - arrows[i][j].y;
                            arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                            arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                            // arrows[i][j].rectToPolar();
                        } else if (placeMode == -1) {
                            // arrows[i][j].xComp = mouseX - arrows[i][j].x;
                            // arrows[i][j].yComp = arrows[i][j].y - mouseY;
                            // arrows[i][j].rectToPolar();
                            arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                            arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                        }

                        if (arrows[i][j].r > maxArrowLength) {
                            arrows[i][j].r = maxArrowLength
                        } else if (arrows[i][j].r < (-1 * maxArrowLength)) {
                            arrows[i][j].r = (-1 * maxArrowLength);
                        }
                    }
                }

                // add particles
                if (mouseDown && particleAddTimer > delay) {
                    particleAddTimer = 0;
                    particles.push(new Particle(mouseX, mouseY, placeMode));
                }

                arrowUpdateByParticles();

                if (keys["Enter"]) {
                    gameParticle = new Particle(spawnpoint.x + (spawnpoint.w / 2), spawnpoint.y + (spawnpoint.h / 2), -1);
                    particles.push(gameParticle);
                    resetArrows();
                    arrowUpdateByParticles();
                    setup = false;
                }
            } else {
                
            }

            // render arrows
            for (var i = 0; i < gridLength; i++) {
                for (var j = 0; j < gridLength; j++) {
                    arrows[i][j].render();
                }
            }

            // render particles
            for (var i = 0; i < particles.length; i++) {
                particles[i].render();
            }

            break;
        }
        default: {
            break;
        }

        
    }

    window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);