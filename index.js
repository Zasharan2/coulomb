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
    TITLE_TO_TUTORIAL: 1.2,
    TITLE_TO_GAME: 1.3,
    TUTORIAL: 2,
    TUTORIAL_TO_TITLE: 2.1,
    TUTORIAL_TO_GAME: 2.3,
    GAME: 3
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
var tutorialButton;
var titleButtonClickTimer;

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
    constructor(x, y, charge, locked, modifiable) {
        this.x = x;
        this.y = y;
        this.charge = charge;
        this.displayCharge = charge;
        this.locked = locked;
        this.modifiable = modifiable;
        this.forceR = 0;
        this.forceTheta = 0;
    }

    render() {
        ctx.beginPath();
        if (Math.sign(this.charge) == 1) {
            if (this.modifiable == 1) {
                ctx.fillStyle = "#ff0000";
            } else if (this.modifiable == 0) {
                ctx.fillStyle = "#ff8800";
            }
            ctx.arc(this.x, this.y, particleSize, 0, 2 * Math.PI, false);
        } else if (Math.sign(this.charge) == -1) {
            if (this.modifiable == 1) {
                ctx.fillStyle = "#0000ff";
            } else if (this.modifiable == 0) {
                ctx.fillStyle = "#0088ff";
            }
            ctx.arc(this.x, this.y, (particleSize * (2 / 3)), 0, 2 * Math.PI, false);
        } else if (Math.sign(this.charge) == 0) {
            ctx.fillStyle = "#ffffff";
            ctx.arc(this.x, this.y, particleSize, 0, 2 * Math.PI, false);
        }
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        if (Math.sign(this.charge) == 1) {
            ctx.font = "30px Comic Sans MS";
            ctx.fillText("+", this.x - 7, this.y + 8);
        } else if (Math.sign(this.charge) == -1) {
            ctx.font = "20px Comic Sans MS";
            ctx.fillText("-", this.x - 4, this.y + 6);
        }

        if (this.locked) {
            ctx.beginPath();
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(this.x + (particleSize / 2), this.y - (particleSize * (3 / 2)), particleSize, particleSize);
            ctx.arc(this.x + particleSize, this.y - (particleSize * (3 / 2)), (particleSize / 4), 0, Math.PI * 2);
            ctx.strokeStyle = "#aaaaaa";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

var hoverParticle;
var overParticleBool;
var overParticle;

var particles = [];
var prevParticles = [];

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
var chargeChangeDelay = 10;
var placeModeTimer = delay;
var particleAddTimer = 0;
var maxParticleForce = 5;
var setup;
var setupTimer = delay;
var chargeChangeTimer = chargeChangeDelay;

var protonWeightCorrection = 15;

var positiveChargeLimit;
var negativeChargeLimit;
var positiveChargeSum;
var negativeChargeSum;

var gameParticle;

var level;

function resetArrows() {
    for (var i = 0; i < gridLength; i++) {
        for (var j = 0; j < gridLength; j++) {
            arrows[i][j].r = 0;
            arrows[i][j].theta = 0;
        }
    }
}

function arrowUpdateByParticleDisplay() {
    // update arrows based on particles' display charges
    for (var i = 0; i < particles.length; i++) {
        for (var k = 0; k < gridLength; k++) {
            for (var j = 0; j < gridLength; j++) {
                var tempR = (correction * Math.abs(particles[i].displayCharge)) / ((Math.pow((arrows[k][j].x - particles[i].x), 2) + Math.pow((particles[i].y - arrows[k][j].y), 2)));
                var tempTheta = Math.atan2((Math.sign(particles[i].displayCharge)) * (particles[i].y - arrows[k][j].y), (Math.sign(particles[i].displayCharge)) * (arrows[k][j].x - particles[i].x));
                var xComp = (tempR * Math.cos(tempTheta)) + (arrows[k][j].r * Math.cos(arrows[k][j].theta));
                var yComp = (tempR * Math.sin(tempTheta)) + (arrows[k][j].r * Math.sin(arrows[k][j].theta));
                arrows[k][j].r = Math.sqrt(Math.pow((xComp), 2) + Math.pow((yComp), 2));
                arrows[k][j].theta = Math.atan2((yComp), (xComp));
            }
        }
    }
}

function arrowUpdateByParticles() {
    // update arrows based on particles
    for (var i = 0; i < particles.length; i++) {
        for (var k = 0; k < gridLength; k++) {
            for (var j = 0; j < gridLength; j++) {
                var tempR = (correction * Math.abs(particles[i].charge)) / ((Math.pow((arrows[k][j].x - particles[i].x), 2) + Math.pow((particles[i].y - arrows[k][j].y), 2)));
                var tempTheta = Math.atan2((Math.sign(particles[i].charge)) * (particles[i].y - arrows[k][j].y), (Math.sign(particles[i].charge)) * (arrows[k][j].x - particles[i].x));
                var xComp = (tempR * Math.cos(tempTheta)) + (arrows[k][j].r * Math.cos(arrows[k][j].theta));
                var yComp = (tempR * Math.sin(tempTheta)) + (arrows[k][j].r * Math.sin(arrows[k][j].theta));
                arrows[k][j].r = Math.sqrt(Math.pow((xComp), 2) + Math.pow((yComp), 2));
                arrows[k][j].theta = Math.atan2((yComp), (xComp));
            }
        }
    }
}

function calculateChargeSums() {
    positiveChargeSum = 0;
    negativeChargeSum = 0;
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].modifiable == 1) {
            if (Math.sign(particles[i].charge) == 1) {
                positiveChargeSum += particles[i].charge;
            } else if (Math.sign(particles[i].charge) == -1) {
                negativeChargeSum += Math.abs(particles[i].charge);
            }
        }
    }
}

function chargeSumsOverLimits() {
    calculateChargeSums();
    if (positiveChargeLimit != "infinity") {
        if (positiveChargeSum > positiveChargeLimit) {
            return true;
        }
    }
    if (negativeChargeLimit != "infinity") {
        if (negativeChargeSum > negativeChargeLimit) {
            return true;
        }
    }
    return false;
}

var positiveChargeLeftDisplayParticle;
var negativeChargeLeftDisplayParticle;

function drawChargeLeftDisplay() {
    ctx.beginPath();
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, 100, 50);
    positiveChargeLeftDisplayParticle.render();
    negativeChargeLeftDisplayParticle.render();
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Comic Sans MS";
    if (positiveChargeLimit == "infinity") {
        ctx.fillText("∞", 25, 45);
    } else {
        ctx.fillText((positiveChargeLimit - positiveChargeSum), 25, 45);
    }
    if (negativeChargeLimit == "infinity") {
        ctx.fillText("∞", 65, 45);
    } else {
        ctx.fillText((negativeChargeLimit - negativeChargeSum), 65, 45);
    }
}

function playParticles() {
    // calculate forces on particles due to other particles
    for (var i = 0; i < particles.length; i++) {
        particles[i].forceR = 0;
        particles[i].forceTheta = 0;
        for (var j = 0; j < particles.length; j++) {
            if (!(i == j)) {
                var tempR = (correction * Math.abs(particles[i].charge * particles[j].charge)) / (Math.pow((particles[i].x - particles[j].x), 2) + Math.pow((particles[j].y - particles[i].y), 2));
                var tempTheta = Math.atan2((Math.sign(particles[i].charge * particles[j].charge)) * (particles[j].y - particles[i].y), (Math.sign(particles[i].charge * particles[j].charge)) * (particles[i].x - particles[j].x));
                var xComp = (tempR * Math.cos(tempTheta)) + (particles[i].forceR * Math.cos(particles[i].forceTheta));
                var yComp = (tempR * Math.sin(tempTheta)) + (particles[i].forceR * Math.sin(particles[i].forceTheta));
                particles[i].forceR = Math.sqrt(Math.pow((xComp), 2) + Math.pow((yComp), 2));
                particles[i].forceTheta = Math.atan2((yComp), (xComp));
            }
        }
    }

    // move particles
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].locked == 0) {
            if (Math.sign(particles[i].charge) == 1) {
                // bound speeds (so that particles don't move too fast)
                if (particles[i].forceR > maxParticleForce) {
                    particles[i].x += (maxParticleForce * Math.cos(particles[i].forceTheta)) / protonWeightCorrection;
                    particles[i].y -= (maxParticleForce * Math.sin(particles[i].forceTheta)) / protonWeightCorrection;
                } else if (particles[i].forceR < (-1 * maxParticleForce)) {
                    particles[i].x += ((-1 * maxParticleForce) * Math.cos(particles[i].forceTheta)) / protonWeightCorrection;
                    particles[i].y -= ((-1 * maxParticleForce) * Math.sin(particles[i].forceTheta)) / protonWeightCorrection;
                } else {
                    particles[i].x += (particles[i].forceR * Math.cos(particles[i].forceTheta)) / protonWeightCorrection;
                    particles[i].y -= (particles[i].forceR * Math.sin(particles[i].forceTheta)) / protonWeightCorrection;
                }
            } else if (Math.sign(particles[i].charge) == -1) {
                // bound speeds (so that particles don't move too fast)
                if (particles[i].forceR > maxParticleForce) {
                    particles[i].x += (maxParticleForce * Math.cos(particles[i].forceTheta));
                    particles[i].y -= (maxParticleForce * Math.sin(particles[i].forceTheta));
                } else if (particles[i].forceR < (-1 * maxParticleForce)) {
                    particles[i].x += ((-1 * maxParticleForce) * Math.cos(particles[i].forceTheta));
                    particles[i].y -= ((-1 * maxParticleForce) * Math.sin(particles[i].forceTheta));
                } else {
                    particles[i].x += (particles[i].forceR * Math.cos(particles[i].forceTheta));
                    particles[i].y -= (particles[i].forceR * Math.sin(particles[i].forceTheta));
                }
            }
        }
    }

    // detect collision
    for (var i = 0; i < particles.length; i++) {
        for (var j = 0; j < particles.length; j++) {
            if (i != j) {
                if ((Math.sign(particles[i].charge) == 1 && Math.sign(particles[j].charge) == -1) || (Math.sign(particles[i].charge) == -1 && Math.sign(particles[j].charge) == 1)) {
                    if (AABB(particles[i].x - particleSize, particles[i].y - particleSize, particleSize * 2, particleSize * 2, particles[j].x - particleSize, particles[j].y - particleSize, particleSize * 2, particleSize * 2)) {
                        particles[i].x = (particles[i].x + particles[j].x) / 2;
                        particles[i].y = (particles[i].y + particles[j].y) / 2;
                        particles[i].charge = particles[i].charge + particles[j].charge;
                        particles[i].locked = particles[i].locked | particles[j].locked;
                        particles.splice(j, 1);
                    }
                }
            }
        }
    }
}

var tutorialTextOpacity;
var tutorialProgress;
var tutorialClickTimer;
var tutorialParticle;
var tutorialLocation;
var tutorialChargeChanged;
var tutorialParticleDeleted;

function main() {
    switch (gameScreen) {
        case SCREEN.NULL_TO_TITLE: {
            playButton = new Button("PLAY", 185, 120, 115, 60, "#ff0000", "#880000", "#ffffff", "#ffffff", "#888888", "#ffffff");
            tutorialButton = new Button("TUTORIAL", 125, 200, 240, 60, "#0000ff", "#000088", "#ffffff", "#ffffff", "#888888", "#ffffff");
            titleButtonClickTimer = 0;

            gameScreen = SCREEN.TITLE;
            break;
        }
        case SCREEN.TITLE: {
            titleButtonClickTimer++;

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

            if (playButton.clicked && titleButtonClickTimer > delay) {
                titleButtonClickTimer = 0;
                gameScreen = SCREEN.TITLE_TO_GAME;
            }

            // tutorial button
            tutorialButton.update();
            tutorialButton.render();

            if (tutorialButton.clicked && titleButtonClickTimer > delay) {
                titleButtonClickTimer = 0;
                gameScreen = SCREEN.TITLE_TO_TUTORIAL;
            }
            break;
        }
        case SCREEN.TITLE_TO_TUTORIAL: {
            tutorialProgress = 0;
            tutorialTextOpacity = 0;
            tutorialClickTimer = 0;

            gameScreen = SCREEN.TUTORIAL;
            break;
        }
        case SCREEN.TUTORIAL: {
            tutorialClickTimer++;

            // background
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            switch (tutorialProgress) {
                case 0: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Welcome to Coulomb, a game about electric charges!", 10, 40);
                    ctx.fillText("Click to continue →", 320, 500);
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialParticle = new Particle(256, 256, -1, 0, 1);
                        tutorialProgress = 1;
                    }
                    break;
                }
                case 1: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("The goal is to guide an electron to its destination.", 20, 40);
                    tutorialParticle.render();
                    ctx.font = "15px Comic Sans MS";
                    ctx.fillText("(Electron)", 220, 300);
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialLocation = new Location(240, 240, 32, 32, "SPAWN");
                        tutorialProgress = 2;
                    }
                    break;
                }
                case 2: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("This square signifies where the electron will start.", 15, 40);
                    ctx.globalAlpha = 0.3 * tutorialTextOpacity;
                    tutorialLocation.render();
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialLocation.type = "GOAL";
                        tutorialProgress = 3;
                    }
                    break;
                }
                case 3: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("This square signifies the electron's goal.", 60, 40);
                    ctx.globalAlpha = 0.3 * tutorialTextOpacity;
                    tutorialLocation.render();
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        for (var i = 0; i < gridLength; i++) {
                            for (var j = 0; j < gridLength; j++) {
                                arrows[i][j] = new Arrow(10 + (i * ((canvasWidth - 20) / (gridLength - 1))), 10 + (j * ((canvasHeight - 20) / (gridLength - 1))), 0, 0);
                            }
                        }
                        particles = [new Particle(240, 240, -1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 4;
                    }
                    break;
                }
                case 4: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("The screen will be filled with arrows.", 70, 40);
                    ctx.fillText("These are electric field lines emitted by particles.", 15, 80);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialProgress = 5;
                    }
                    break;
                }
                case 5: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("The brightnesses of the arrows indicate strength.", 15, 40);
                    ctx.fillText("Brighter lines are stronger than faint ones.", 45, 80);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialProgress = 6;
                    }
                    break;
                }
                case 6: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("With particles, these lines are stronger near them.", 15, 40);
                    ctx.fillText("Further away, the lines are fainter and weaker.", 30, 80);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        tutorialProgress = 7;
                    }
                    break;
                }
                case 7: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Arrows point towards negative charge.", 60, 40);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        particles = [new Particle(240, 240, 1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 8;
                    }
                    break;
                }
                case 8: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Arrows point away from positive charge.", 50, 40);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        particles = [new Particle(210, 210, 1, 0, 1), new Particle(270, 270, -1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 9;
                    }
                    break;
                }
                case 9: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Thus, they go away from positive into negative.", 30, 40);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        particles = [new Particle(210, 280, 1, 0, 1), new Particle(270, 280, -1, 0, 1), new Particle(210, 380, 1, 0, 1), new Particle(270, 380, 1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 10;
                    }
                    break;
                }
                case 10: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Positive charges follow arrows.", 105, 40);
                    ctx.fillText("Negative charges go opposite the arrow.", 65, 80);
                    ctx.fillText("So, like charges repel, and opposite charges attract.", 10, 120);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialProgress = 10.5;
                    }
                    break;
                }
                case 10.5: {
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Positive charges follow arrows.", 105, 40);
                    ctx.fillText("Negative charges go opposite the arrow.", 65, 80);
                    ctx.fillText("So, like charges repel, and opposite charges attract.", 10, 120);

                    resetArrows();
                    arrowUpdateByParticles();

                    playParticles();

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        particles = [new Particle(210, 180, -1, 0, 1), new Particle(370, 180, 1, 0, 1), new Particle(210, 220, -1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 11;
                    }
                    break;
                }
                case 11: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Be careful, every charge affects every other charge.", 10, 40);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialProgress = 11.5;
                    }
                    break;
                }
                case 11.5: {
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Be careful, every charge affects every other charge.", 10, 40);

                    resetArrows();
                    arrowUpdateByParticles();

                    playParticles();

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        hoverParticle = new Particle(mouseX, mouseY, placeMode, 0, 1);
                        positiveChargeLimit = 1;
                        negativeChargeLimit = 0;
                        positiveChargeSum = 0;
                        negativeChargeSum = 0;
                        overParticleBool = 0;
                        particleAddTimer = 0;
                        particles = [];
                        resetArrows();
                        tutorialProgress = 12;
                    }
                    break;
                }
                case 12: {
                    particleAddTimer++;

                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("To place a particle, click anywhere on the screen.", 20, 40);

                    if (particles.length == 0) {
                        // hover particle movement
                        hoverParticle.x = mouseX;
                        hoverParticle.y = mouseY;
                        hoverParticle.charge = placeMode;
            
                        // hover particle rendering
                        ctx.globalAlpha = 0.5;
                        hoverParticle.render();
                        ctx.globalAlpha = 1;

                        // arrow handling
                        for (var i = 0; i < gridLength; i++) {
                            for (var j = 0; j < gridLength; j++) {
                                if (placeMode == 1) {
                                    arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                    arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                                } else if (placeMode == -1) {
                                    arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                    arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                                }
                            }
                        }

                        // add particles
                        if ((!overParticleBool) && mouseDown && particleAddTimer > delay) {
                            if (mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512) {
                                particleAddTimer = 0;
                                tutorialClickTimer = 0;
                                particles.push(new Particle(mouseX, mouseY, placeMode, 0, 1));
                                if (chargeSumsOverLimits()) {
                                    particles.pop();
                                }
                            }
                        }
                    }

                    if (particles.length != 0) {
                        resetArrows();
                    }
                    arrowUpdateByParticleDisplay();
                    
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
                    ctx.globalAlpha = 1;

                    if (mouseDown && particles.length > 0 && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialTextOpacity = 0;
                        particles = [];
                        placeMode = 1;
                        placeModeTimer = 0;
                        positiveChargeLimit = 0;
                        negativeChargeLimit = 1;
                        positiveChargeSum = 0;
                        negativeChargeSum = 0;
                        tutorialProgress = 13;
                    }
                    break;
                }
                case 13: {
                    particleAddTimer++;
                    placeModeTimer++;

                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Space to switch placing a proton vs. an electron.", 25, 40);

                    // mode switching
                    if (keys[" "] && placeModeTimer > delay) {
                        placeModeTimer = 0;
                        placeMode *= -1;
                    }

                    if (particles.length == 0) {
                        // hover particle movement
                        hoverParticle.x = mouseX;
                        hoverParticle.y = mouseY;
                        hoverParticle.charge = placeMode;
            
                        // hover particle rendering
                        ctx.globalAlpha = 0.5;
                        hoverParticle.render();
                        ctx.globalAlpha = 1;

                        // arrow handling
                        for (var i = 0; i < gridLength; i++) {
                            for (var j = 0; j < gridLength; j++) {
                                if (placeMode == 1) {
                                    arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                    arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                                } else if (placeMode == -1) {
                                    arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                    arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                                }
                            }
                        }

                        if (placeMode == -1) {
                            // add particles
                            if ((!overParticleBool) && mouseDown && particleAddTimer > delay) {
                                if (mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512) {
                                    particleAddTimer = 0;
                                    tutorialClickTimer = 0;
                                    particles.push(new Particle(mouseX, mouseY, placeMode, 0, 1));
                                    if (chargeSumsOverLimits()) {
                                        particles.pop();
                                    }
                                }
                            }
                        }
                    }

                    if (particles.length != 0) {
                        resetArrows();
                    }
                    arrowUpdateByParticleDisplay();
                    
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
                    ctx.globalAlpha = 1;

                    if (mouseDown && particles.length > 0 && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialTextOpacity = 0;
                        placeMode = 1;
                        placeModeTimer = 0;
                        particleAddTimer = 0;
                        positiveChargeLimit = "infinity";
                        negativeChargeLimit = "infinity";
                        positiveChargeSum = 0;
                        negativeChargeSum = 0;
                        chargeChangeTimer = 0;
                        overParticleBool = false;
                        tutorialChargeChanged = false;
                        tutorialProgress = 14;
                    }
                    break;
                }
                case 14: {
                    particleAddTimer++;
                    placeModeTimer++;
                    chargeChangeTimer++;

                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Use the up and down arrow keys to change the charge.", 5, 40);

                    if (!overParticleBool) {
                        // hover particle movement
                        hoverParticle.x = mouseX;
                        hoverParticle.y = mouseY;
                        hoverParticle.charge = placeMode;
            
                        // hover particle rendering
                        ctx.globalAlpha = 0.5;
                        hoverParticle.render();
                        ctx.globalAlpha = 1;
                    }
    
                    // mode switching
                    if (keys[" "] && placeModeTimer > delay) {
                        placeModeTimer = 0;
                        placeMode *= -1;
                    }
    
                    // arrow handling
                    for (var i = 0; i < gridLength; i++) {
                        for (var j = 0; j < gridLength; j++) {
                            if (placeMode == 1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                            } else if (placeMode == -1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                            }
                        }
                    }
    
                    // add particles
                    if ((!overParticleBool) && (!tutorialChargeChanged) && mouseDown && particleAddTimer > delay) {
                        if (mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512) {
                            particleAddTimer = 0;
                            tutorialClickTimer = 0;
                            particles.push(new Particle(mouseX, mouseY, placeMode, 0, 1));
                            if (chargeSumsOverLimits()) {
                                particles.pop();
                            }
                        }
                    }
    
                    // detect overParticle
                    overParticleBool = false;
                    for (var i = 0; i < particles.length; i++) {
                        if (AABB(mouseX - particleSize, mouseY - particleSize, particleSize * 2, particleSize * 2, particles[i].x - particleSize, particles[i].y - particleSize, particleSize * 2, particleSize * 2)) {
                            overParticleBool = true;
                            overParticle = i;
                        }
                    }
    
                    arrowUpdateByParticleDisplay();
    
                    // change charge
                    if (overParticleBool && chargeChangeTimer > chargeChangeDelay && (particles[overParticle].modifiable == 1)) {
                        chargeChangeTimer = 0;
                        if (keys["ArrowUp"] || keys["w"]) {
                            particles[overParticle].charge++;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge--;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                        if (keys["ArrowDown"] || keys["s"]) {
                            particles[overParticle].charge--;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge++;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                    }
    
                    for (var i = 0; i < particles.length; i++) {
                        particles[i].displayCharge += (particles[i].charge - particles[i].displayCharge) / 5;
                    }
    
                    // remove particles
                    if (overParticleBool && keys["Backspace"] && (particles[overParticle].modifiable == 1)) {
                        particles.splice(overParticle, 1);
                        overParticleBool = false;
                    }
    
                    calculateChargeSums();
    
                    arrowUpdateByParticleDisplay();
                    
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

                    // write particle charge
                    if (overParticleBool) {
                        ctx.beginPath();
                        ctx.font = "20px Comic Sans MS";
                        ctx.fillStyle = "#ffffff";
                        if (Math.sign(particles[overParticle].charge) == 1) {
                            ctx.fillText("+" + particles[overParticle].charge, mouseX, mouseY);
                        } else {
                            ctx.fillText(particles[overParticle].charge, mouseX, mouseY);
                        }
                    }

                    ctx.globalAlpha = 1;

                    if (mouseDown && particles.length > 0 && tutorialChargeChanged && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialTextOpacity = 0;
                        placeMode = 1;
                        placeModeTimer = 0;
                        particleAddTimer = 0;
                        positiveChargeLimit = "infinity";
                        negativeChargeLimit = "infinity";
                        positiveChargeSum = 0;
                        negativeChargeSum = 0;
                        chargeChangeTimer = 0;
                        overParticleBool = false;
                        tutorialParticleDeleted = false;
                        tutorialProgress = 15;
                    }
                    break;
                }
                case 15: {
                    particleAddTimer++;
                    placeModeTimer++;
                    chargeChangeTimer++;

                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Press backspace to delete a particle.", 65, 40);

                    if (!overParticleBool) {
                        // hover particle movement
                        hoverParticle.x = mouseX;
                        hoverParticle.y = mouseY;
                        hoverParticle.charge = placeMode;
            
                        // hover particle rendering
                        ctx.globalAlpha = 0.5;
                        hoverParticle.render();
                        ctx.globalAlpha = 1;
                    }
    
                    // mode switching
                    if (keys[" "] && placeModeTimer > delay) {
                        placeModeTimer = 0;
                        placeMode *= -1;
                    }
    
                    // arrow handling
                    for (var i = 0; i < gridLength; i++) {
                        for (var j = 0; j < gridLength; j++) {
                            if (placeMode == 1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                            } else if (placeMode == -1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                            }
                        }
                    }
    
                    // add particles
                    if ((!overParticleBool) && (!tutorialParticleDeleted) && mouseDown && particleAddTimer > delay) {
                        if (mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512) {
                            particleAddTimer = 0;
                            tutorialClickTimer = 0;
                            particles.push(new Particle(mouseX, mouseY, placeMode, 0, 1));
                            if (chargeSumsOverLimits()) {
                                particles.pop();
                            }
                        }
                    }
    
                    // detect overParticle
                    overParticleBool = false;
                    for (var i = 0; i < particles.length; i++) {
                        if (AABB(mouseX - particleSize, mouseY - particleSize, particleSize * 2, particleSize * 2, particles[i].x - particleSize, particles[i].y - particleSize, particleSize * 2, particleSize * 2)) {
                            overParticleBool = true;
                            overParticle = i;
                        }
                    }
    
                    arrowUpdateByParticleDisplay();
    
                    // change charge
                    if (overParticleBool && chargeChangeTimer > chargeChangeDelay && (particles[overParticle].modifiable == 1)) {
                        chargeChangeTimer = 0;
                        if (keys["ArrowUp"] || keys["w"]) {
                            particles[overParticle].charge++;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge--;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                        if (keys["ArrowDown"] || keys["s"]) {
                            particles[overParticle].charge--;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge++;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                    }
    
                    for (var i = 0; i < particles.length; i++) {
                        particles[i].displayCharge += (particles[i].charge - particles[i].displayCharge) / 5;
                    }
    
                    // remove particles
                    if (overParticleBool && keys["Backspace"] && (particles[overParticle].modifiable == 1)) {
                        particles.splice(overParticle, 1);
                        tutorialParticleDeleted = true;
                        overParticleBool = false;
                    }

                    calculateChargeSums();
    
                    arrowUpdateByParticleDisplay();
                    
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

                    // write particle charge
                    if (overParticleBool) {
                        ctx.beginPath();
                        ctx.font = "20px Comic Sans MS";
                        ctx.fillStyle = "#ffffff";
                        if (Math.sign(particles[overParticle].charge) == 1) {
                            ctx.fillText("+" + particles[overParticle].charge, mouseX, mouseY);
                        } else {
                            ctx.fillText(particles[overParticle].charge, mouseX, mouseY);
                        }
                    }

                    ctx.globalAlpha = 1;

                    if (mouseDown && tutorialParticleDeleted && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        particles = [new Particle(240, 240, -1, 1, 1), new Particle(380, 240, 1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 16;
                    }
                    break;
                }
                case 16: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Particles with a lock symbol on them cannot move.", 15, 40);

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
                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialProgress = 16.5;
                    }
                    break;
                }
                case 16.5: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Particles with a lock symbol on them cannot move.", 15, 40);

                    resetArrows();
                    arrowUpdateByParticles();

                    playParticles();

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        particles = [new Particle(240, 240, 1, 0, 0), new Particle(240, 340, -1, 0, 0)];
                        placeMode = 1;
                        placeModeTimer = 0;
                        particleAddTimer = 0;
                        positiveChargeLimit = "infinity";
                        negativeChargeLimit = "infinity";
                        positiveChargeSum = 0;
                        negativeChargeSum = 0;
                        chargeChangeTimer = 0;
                        overParticleBool = false;
                        tutorialProgress = 17;
                    }
                    break;
                }
                case 17: {
                    particleAddTimer++;
                    placeModeTimer++;
                    chargeChangeTimer++;

                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("You cannot change or delete level particles.", 45, 40);
    
                    // mode switching
                    if (keys[" "] && placeModeTimer > delay) {
                        placeModeTimer = 0;
                        placeMode *= -1;
                    }
    
                    // arrow handling
                    for (var i = 0; i < gridLength; i++) {
                        for (var j = 0; j < gridLength; j++) {
                            if (placeMode == 1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                            } else if (placeMode == -1) {
                                arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                                arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                            }
                        }
                    }
    
                    // detect overParticle
                    overParticleBool = false;
                    for (var i = 0; i < particles.length; i++) {
                        if (AABB(mouseX - particleSize, mouseY - particleSize, particleSize * 2, particleSize * 2, particles[i].x - particleSize, particles[i].y - particleSize, particleSize * 2, particleSize * 2)) {
                            overParticleBool = true;
                            overParticle = i;
                        }
                    }
    
                    arrowUpdateByParticleDisplay();
    
                    // change charge
                    if (overParticleBool && chargeChangeTimer > chargeChangeDelay && (particles[overParticle].modifiable == 1)) {
                        chargeChangeTimer = 0;
                        if (keys["ArrowUp"] || keys["w"]) {
                            particles[overParticle].charge++;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge--;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                        if (keys["ArrowDown"] || keys["s"]) {
                            particles[overParticle].charge--;
                            if (chargeSumsOverLimits()) {
                                particles[overParticle].charge++;
                            } else {
                                tutorialChargeChanged = true;
                            }
                        }
                    }
    
                    for (var i = 0; i < particles.length; i++) {
                        particles[i].displayCharge += (particles[i].charge - particles[i].displayCharge) / 5;
                    }
    
                    // remove particles
                    if (overParticleBool && keys["Backspace"] && (particles[overParticle].modifiable == 1)) {
                        particles.splice(overParticle, 1);
                        overParticleBool = false;
                    }

                    calculateChargeSums();
    
                    arrowUpdateByParticleDisplay();
                    
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

                    // write particle charge
                    if (overParticleBool) {
                        ctx.beginPath();
                        ctx.font = "20px Comic Sans MS";
                        ctx.fillStyle = "#ffffff";
                        if (Math.sign(particles[overParticle].charge) == 1) {
                            ctx.fillText("+" + particles[overParticle].charge, mouseX, mouseY);
                        } else {
                            ctx.fillText(particles[overParticle].charge, mouseX, mouseY);
                        }
                    }

                    ctx.globalAlpha = 1;

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        // particles = [];
                        // resetArrows();
                        // arrowUpdateByParticles();
                        tutorialProgress = 18;
                    }
                    break;
                }
                case 18: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Lastly, use enter to test out your layout.", 50, 40);

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
                    ctx.globalAlpha = 1;

                    if (keys["Enter"] && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialProgress = 18.5;
                    }
                    break;
                }
                case 18.5: {
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("Lastly, use enter to test out your layout.", 50, 40);

                    resetArrows();
                    arrowUpdateByParticles();

                    playParticles();

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialTextOpacity = 0;
                        particles = [new Particle(368, 64, -1, 0, 1), new Particle(409, 64, -1, 0, 1), new Particle(345, 110, -1, 0, 1), new Particle(370, 133, -1, 0, 1), new Particle(406, 137, -1, 0, 1), new Particle(430, 110, -1, 0, 1), new Particle(391, 100, 1, 0, 1)];
                        resetArrows();
                        arrowUpdateByParticles();
                        tutorialProgress = 19;
                    }
                    break;
                }
                case 19: {
                    tutorialTextOpacity += (1 - tutorialTextOpacity) / 15;
                    ctx.globalAlpha = tutorialTextOpacity;
                    ctx.beginPath();
                    ctx.font = "50px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.save();
                    ctx.rotate(0.3);
                    ctx.fillText("Have fun!", 180, 180);
                    ctx.restore();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ff0000";
                    ctx.fillText("-Zasharan2", 380, 480);
                    ctx.globalAlpha = 1;

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialClickTimer = 0;
                        tutorialProgress = 19.5;
                    }
                    break;
                }
                case 19.5: {
                    ctx.beginPath();
                    ctx.font = "50px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    ctx.save();
                    ctx.rotate(0.3);
                    ctx.fillText("Have fun!", 180, 180);
                    ctx.restore();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ff0000";
                    ctx.fillText("-Zasharan2", 380, 480);

                    resetArrows();
                    arrowUpdateByParticles();

                    playParticles();

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

                    if (mouseDown && mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512 && tutorialClickTimer > delay) {
                        tutorialTextOpacity = 0;
                        tutorialClickTimer = 0;
                        titleButtonClickTimer = 0;
                        gameScreen = SCREEN.TUTORIAL_TO_TITLE;
                    }
                    break;
                }
                default: {
                    break;
                }
            }
            break;
        }
        case SCREEN.TUTORIAL_TO_TITLE: {
            gameScreen = SCREEN.TITLE;
            break;
        }
        case SCREEN.TUTORIAL_TO_GAME: {
            for (var i = 0; i < gridLength; i++) {
                for (var j = 0; j < gridLength; j++) {
                    arrows[i][j] = new Arrow(10 + (i * ((canvasWidth - 20) / (gridLength - 1))), 10 + (j * ((canvasHeight - 20) / (gridLength - 1))), 0, 0);
                }
            }
            placeModeTimer = delay;
            particleAddTimer = 0;
            setupTimer = delay;
            chargeChangeTimer = chargeChangeDelay;

            hoverParticle = new Particle(mouseX, mouseY, placeMode, 0, 1);
            overParticleBool = false;
            overParticle = -1;

            positiveChargeLimit = "infinity";
            negativeChargeLimit = "infinity";
            positiveChargeSum = 0;
            negativeChargeSum = 0;
            positiveChargeLeftDisplayParticle = new Particle(30, 20, 1, 0, 1);
            negativeChargeLeftDisplayParticle = new Particle(70, 20, -1, 0, 1);

            spawnpoint = new Location(0, 240, 32, 32, "SPAWN");
            goalpoint = new Location(240, 240, 32, 32, "GOAL");

            setup = true;

            level = 1;

            gameScreen = SCREEN.GAME;
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
            setupTimer = delay;
            chargeChangeTimer = chargeChangeDelay;

            hoverParticle = new Particle(mouseX, mouseY, placeMode, 0, 1);
            overParticleBool = false;
            overParticle = -1;

            positiveChargeLimit = "infinity";
            negativeChargeLimit = "infinity";
            positiveChargeSum = 0;
            negativeChargeSum = 0;
            positiveChargeLeftDisplayParticle = new Particle(30, 20, 1, 0, 1);
            negativeChargeLeftDisplayParticle = new Particle(70, 20, -1, 0, 1);

            spawnpoint = new Location(0, 240, 32, 32, "SPAWN");
            goalpoint = new Location(240, 240, 32, 32, "GOAL");

            setup = true;

            level = 1;

            gameScreen = SCREEN.GAME;
            break;
        }
        case SCREEN.GAME: {
            placeModeTimer++;
            particleAddTimer++;
            setupTimer++;
            chargeChangeTimer++;

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
                if (!overParticleBool) {
                    // hover particle movement
                    hoverParticle.x = mouseX;
                    hoverParticle.y = mouseY;
                    hoverParticle.charge = placeMode;
        
                    // hover particle rendering
                    ctx.globalAlpha = 0.5;
                    hoverParticle.render();
                    ctx.globalAlpha = 1;
                }

                // mode switching
                if (keys[" "] && placeModeTimer > delay) {
                    placeModeTimer = 0;
                    placeMode *= -1;
                }

                // arrow handling
                for (var i = 0; i < gridLength; i++) {
                    for (var j = 0; j < gridLength; j++) {
                        if (placeMode == 1) {
                            arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                            arrows[i][j].theta = Math.atan2((mouseY - arrows[i][j].y), (arrows[i][j].x - mouseX));
                        } else if (placeMode == -1) {
                            arrows[i][j].r = correction / ((Math.pow((arrows[i][j].x - mouseX), 2) + Math.pow((arrows[i][j].y - mouseY), 2)));
                            arrows[i][j].theta = Math.atan2((-1 * (mouseY - arrows[i][j].y)), (-1 * (arrows[i][j].x - mouseX)));
                        }
                    }
                }

                // add particles
                if ((!overParticleBool) && mouseDown && particleAddTimer > delay) {
                    if (mouseX > 0 && mouseX < 512 && mouseY > 0 && mouseY < 512) {
                        particleAddTimer = 0;
                        particles.push(new Particle(mouseX, mouseY, placeMode, 0, 1));
                        if (chargeSumsOverLimits()) {
                            particles.pop();
                        }
                    }
                }

                // detect overParticle
                overParticleBool = false;
                for (var i = 0; i < particles.length; i++) {
                    if (AABB(mouseX - particleSize, mouseY - particleSize, particleSize * 2, particleSize * 2, particles[i].x - particleSize, particles[i].y - particleSize, particleSize * 2, particleSize * 2)) {
                        overParticleBool = true;
                        overParticle = i;
                    }
                }

                arrowUpdateByParticleDisplay();

                // change charge
                if (overParticleBool && chargeChangeTimer > chargeChangeDelay && (particles[overParticle].modifiable == 1)) {
                    chargeChangeTimer = 0;
                    if (keys["ArrowUp"] || keys["w"]) {
                        particles[overParticle].charge++;
                        if (chargeSumsOverLimits()) {
                            particles[overParticle].charge--;
                        }
                    }
                    if (keys["ArrowDown"] || keys["s"]) {
                        particles[overParticle].charge--;
                        if (chargeSumsOverLimits()) {
                            particles[overParticle].charge++;
                        }
                    }
                }

                for (var i = 0; i < particles.length; i++) {
                    particles[i].displayCharge += (particles[i].charge - particles[i].displayCharge) / 5;
                }

                // remove particles
                if (overParticleBool && keys["Backspace"] && (particles[overParticle].modifiable == 1)) {
                    particles.splice(overParticle, 1);
                    overParticleBool = false;
                }

                calculateChargeSums();

                // switch setup mode
                if (keys["Enter"] && setupTimer > delay) {
                    setupTimer = 0;

                    prevParticles = [];
                    for (var i = 0; i < particles.length; i++) {
                        prevParticles.push(new Particle(particles[i].x, particles[i].y, particles[i].charge, particles[i].locked, particles[i].modifiable));
                    }
                    gameParticle = new Particle(spawnpoint.x + (spawnpoint.w / 2), spawnpoint.y + (spawnpoint.h / 2), -1, 0, 0);
                    particles.push(gameParticle);
                    resetArrows();
                    arrowUpdateByParticles();
                    setup = false;
                }
            } else {
                resetArrows();
                arrowUpdateByParticles();

                playParticles();

                if (AABB(gameParticle.x - particleSize, gameParticle.y - particleSize, particleSize * 2, particleSize * 2, goalpoint.x, goalpoint.y, goalpoint.w, goalpoint.h)) {
                    setupTimer = 0;

                    level++;
                    delete gameParticle;
                    particles = [];
                    for (var i = 0; i < prevParticles.length; i++) {
                        particles.push(new Particle(prevParticles[i].x, prevParticles[i].y, prevParticles[i].charge, prevParticles[i].locked, prevParticles[i].modifiable));
                    }
                    setup = true;
                }

                if (keys["Enter"] && setupTimer > delay) {
                    setupTimer = 0;

                    delete gameParticle;
                    particles = [];
                    for (var i = 0; i < prevParticles.length; i++) {
                        particles.push(new Particle(prevParticles[i].x, prevParticles[i].y, prevParticles[i].charge, prevParticles[i].locked, prevParticles[i].modifiable));
                    }
                    setup = true;
                }
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

            if (setup) {
                // write particle charge
                if (overParticleBool) {
                    ctx.beginPath();
                    ctx.font = "20px Comic Sans MS";
                    ctx.fillStyle = "#ffffff";
                    if (Math.sign(particles[overParticle].charge) == 1) {
                        ctx.fillText("+" + particles[overParticle].charge, mouseX, mouseY);
                    } else {
                        ctx.fillText(particles[overParticle].charge, mouseX, mouseY);
                    }
                }

                if (!AABB(mouseX, mouseY, 1, 1, 0, 0, 100, 50)) {
                    drawChargeLeftDisplay();
                }
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