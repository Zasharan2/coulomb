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
    constructor(x, y, charge, locked) {
        this.x = x;
        this.y = y;
        this.charge = charge;
        this.displayCharge = charge;
        this.locked = locked;
        this.forceR = 0;
        this.forceTheta = 0;
    }

    render() {
        ctx.beginPath();
        if (Math.sign(this.charge) == 1) {
            ctx.fillStyle = "#ff0000";
            ctx.arc(this.x, this.y, particleSize, 0, 2 * Math.PI, false);
        } else if (Math.sign(this.charge) == -1) {
            ctx.fillStyle = "#0000ff";
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
        if (Math.sign(particles[i].charge) == 1) {
            positiveChargeSum += particles[i].charge;
        } else if (Math.sign(particles[i].charge) == -1) {
            negativeChargeSum += Math.abs(particles[i].charge);
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
            setupTimer = delay;
            chargeChangeTimer = chargeChangeDelay;

            hoverParticle = new Particle(mouseX, mouseY, placeMode, 0);
            overParticleBool = false;
            overParticle = -1;

            positiveChargeLimit = "infinity";
            negativeChargeLimit = "infinity";
            positiveChargeSum = 0;
            negativeChargeSum = 0;
            positiveChargeLeftDisplayParticle = new Particle(30, 20, 1, 0);
            negativeChargeLeftDisplayParticle = new Particle(70, 20, -1, 0);

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
                        particles.push(new Particle(mouseX, mouseY, placeMode, 0));
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
                if (overParticleBool && chargeChangeTimer > chargeChangeDelay) {
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
                if (overParticleBool && keys["Backspace"]) {
                    particles.splice(overParticle, 1);
                    overParticleBool = false;
                }

                calculateChargeSums();

                // switch setup mode
                if (keys["Enter"] && setupTimer > delay) {
                    setupTimer = 0;

                    prevParticles = [];
                    for (var i = 0; i < particles.length; i++) {
                        prevParticles.push(new Particle(particles[i].x, particles[i].y, particles[i].charge, particles[i].locked));
                    }
                    gameParticle = new Particle(spawnpoint.x + (spawnpoint.w / 2), spawnpoint.y + (spawnpoint.h / 2), -1, 0);
                    particles.push(gameParticle);
                    resetArrows();
                    arrowUpdateByParticles();
                    setup = false;
                }
            } else {
                resetArrows();
                arrowUpdateByParticles();

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

                if (AABB(gameParticle.x - particleSize, gameParticle.y - particleSize, particleSize * 2, particleSize * 2, goalpoint.x, goalpoint.y, goalpoint.w, goalpoint.h)) {
                    setupTimer = 0;

                    level++;
                    delete gameParticle;
                    particles = [];
                    for (var i = 0; i < prevParticles.length; i++) {
                        particles.push(new Particle(prevParticles[i].x, prevParticles[i].y, prevParticles[i].charge, prevParticles[i].locked));
                    }
                    setup = true;
                }

                if (keys["Enter"] && setupTimer > delay) {
                    setupTimer = 0;

                    delete gameParticle;
                    particles = [];
                    for (var i = 0; i < prevParticles.length; i++) {
                        particles.push(new Particle(prevParticles[i].x, prevParticles[i].y, prevParticles[i].charge, prevParticles[i].locked));
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