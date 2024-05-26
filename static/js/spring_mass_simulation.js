import { Slider } from '/js/range_slider.js';

function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


class DrawableOject {

    constructor(imageSrc, initialX = 0, initialY = 0) {
        this.x = initialX;
        this.y = initialY;

        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(ctx, widthScaling = 1, heightScaling = 1) {
        ctx.drawImage(this.image, this.x, this.y, widthScaling * this.image.width, heightScaling * this.image.height);
    }

    inBoundingBox(x, y, padding = 40) {
        return (
            x > this.x - padding &&
            x < this.x + this.image.width + padding && 
            y > this.y - padding &&
            y < this.y + this.image.height + padding
        );
    }
}


class Spring {

    constructor(initialX, initialY, canvasHeight, lengthToPixels, isThumbnail) {
        this.x = initialX;
        this.y = initialY;

        this.lengthToPixels = lengthToPixels;
        
        this.minLength = 0.35;
        this.maxLength = 0.65 * canvasHeight / lengthToPixels;

        this.topLimit = this.y + this.maxLength * lengthToPixels;
        this.bottomLimit = this.y + this.minLength * lengthToPixels;


        this.naturalLength = isThumbnail ? 1.4 : 1.2;
        this.length = this.naturalLength;

        this.stiffness = 120;
        this.minSpringStiffness = 40;
        this.maxSpringStiffness = 200;

        this.minSpringWidthPercentage = 0.4;

        if (!isThumbnail) {
            const stiffnessSliderId = 'stiffness_slider';
            new Slider(stiffnessSliderId, this.updateStiffness.bind(this), this.stiffness, this.minSpringStiffness, this.maxSpringStiffness);    
        }

        this.coils = new Coils(this.minLength * lengthToPixels, this.maxLength * lengthToPixels);
    }

    updateStiffness(newStiffness) {
        this.stiffness = newStiffness;
    }

    getScaledWidthFromStiffness() {
        const percentageMaxStiffness = (this.stiffness - this.minSpringStiffness) / (this.maxSpringStiffness - this.minSpringStiffness);
        return this.minSpringWidthPercentage + (1 - this.minSpringWidthPercentage) * percentageMaxStiffness;
    }

    setBottomPositionWithinBounds(bottomPosition) {
        const length = (bottomPosition - this.y) / this.lengthToPixels
        this.setLengthWithinBounds(length);
    }

    setLengthWithinBounds(newLength) {
        if (newLength < this.minLength) {
            this.length = this.minLength;
        } else if (newLength > this.maxLength) {
            this.length = this.maxLength;
        } else {
            this.length = newLength;
        }
    }

    isAtMaxOrMin() {
        return this.length === this.minLength || this.length === this.maxLength;
    }

    getPixelLength() {
        return this.length * this.lengthToPixels;
    }

    getBottomPosition() {
        return this.y + this.length * this.lengthToPixels;
    }

    draw(ctx) {
        this.coils.draw(ctx, this.x, this.y, this.getScaledWidthFromStiffness(), this.getPixelLength());
    }
}


class Coils {
    
    constructor(minHeight, maxHeight) {

        this.coils = [
            new DrawableOject('/images/springmass/coil1.png'),
            new DrawableOject('/images/springmass/coil2.png'),
            new DrawableOject('/images/springmass/coil3.png'),
            new DrawableOject('/images/springmass/coil2.png'),
            new DrawableOject('/images/springmass/coil3.png'),
            new DrawableOject('/images/springmass/coil4.png'),
            new DrawableOject('/images/springmass/coil5.png'),
        ];

        window.onload = () => {
            this.allButLastCoilHeight = this.coils.slice(0, -1).reduce((sum, coil) => sum + coil.image.height, 0);
            this.lastCoilHeight = this.coils[this.coils.length - 1].image.height;
            this.coilWidth = this.coils[0].image.width;
        }

        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
    }

    draw(ctx, x, y, widthScaling, height) {
        // Overlap coils by up to 60% of their height
        const overlapPercent = 0.6 * (this.maxHeight - height) / (this.maxHeight - this.minHeight);

        // Scale height of each coil taking into account overlap
        const heightScaling = height / (this.allButLastCoilHeight * (1 - overlapPercent) + this.lastCoilHeight);
        
        this.coils.forEach((coil, i) => {
            coil.x = x - (widthScaling * coil.image.width) / 2;

            if (i === 0) {
                // First coil has no overlap
                coil.y = y;
            } else {
                const previousCoil = this.coils[i - 1];
                coil.y = previousCoil.y + (1 - overlapPercent) * previousCoil.image.height * heightScaling;
            }
        });

        // Draw coils in reverse order to avoid overlap
        for (let i = this.coils.length - 1; i >= 0; i--) {
            // Clear previous coil overlap
            ctx.clearRect(this.coils[i].x, this.coils[i].y + 5, this.coils[i].image.width * widthScaling, this.coils[i].image.height * heightScaling * 0.6);
            
            this.coils[i].draw(ctx, widthScaling, heightScaling);
        }
    }
}


class WeightBlock extends DrawableOject {

    constructor(initialX, initialY) {

        const weightBlockImage = '/images/springmass/mass.png';
        super(weightBlockImage, initialX, initialY);

        this.mass = 1;
        this.velocity = 0;
        this.acceleration = 0;

        this.maxVelocity = 20;

        this.isSelected = false;
        this.mouseSelectOffsetY = 0;

        this.currentMouseMoveY = 0;
        this.previousMouseMoveY = 0;

        this.baseYOffset = -6;

        this.releaseVelocityMultiplier = 10;
    }

    setY(newY) {
        this.y = newY + this.baseYOffset;
    }

    setAcceleration(newAcceleration) {
        this.acceleration = newAcceleration;
    }

    setVelocity(newVelocity) {
        this.velocity = newVelocity;
    }

    select(mouseY) {
        this.isSelected = true;

        this.mouseSelectOffsetY = mouseY - this.y;

        this.currentMouseMoveY = mouseY;
        this.previousMouseMoveY = mouseY;
    }

    getSelectedPosition(mouseY) {
        return mouseY - this.mouseSelectOffsetY;
    }

    dragToNewPosition(newPosition, mouseY) {
        this.setY(newPosition);
        this.previousMouseMoveY = this.currentMouseMoveY;
        this.currentMouseMoveY = mouseY;
    }

    unselect() {
        this.isSelected = false;

        const releaseVelocity = (this.currentMouseMoveY - this.previousMouseMoveY) / lengthToPixels / (1/60);
        weightBlock.velocity = this.releaseVelocityMultiplier * releaseVelocity;
        if (weightBlock.velocity > this.maxVelocity) weightBlock.velocity = this.maxVelocity;
        if (weightBlock.velocity < -this.maxVelocity) weightBlock.velocity = -this.maxVelocity;

        weightBlock.acceleration = 0;
    }
}


class Damping {

    constructor(isThumbnail) {

        this.coefficient = 1;
        const minCoefficient = 0;
        const maxCoefficient = 5;
        
        if (!isThumbnail) {
            new Slider('damping_slider', this.updateDamping.bind(this), this.coefficient, minCoefficient, maxCoefficient);
        }
    }

    updateDamping(newCoefficient) {
        this.coefficient = newCoefficient;
    }
}


class Brush {

    constructor(brushStartX) {

        this.maxPathLength = 150;
        this.pathValues = [];

        const numBristles = 50;
        const brushWidth = 15;
        const brushHeight = 20;
        this.bristles = new Array(numBristles).fill().map(
            () => new Bristle(brushWidth, brushHeight)
        );

        this.baseVerticalOffset = 0.8 * springBaseHeight;

        this.minX = 0;
        this.maxX = brushStartX + brushWidth / 2;
    }

    addPathPoint(val) {
        this.pathValues.push(val);
        if (this.pathValues.length > this.maxPathLength) {
            this.pathValues.shift();
        }
    }

    draw(ctx) {
        this.bristles.forEach(bristle => this.drawPath(ctx, bristle));
    }

    drawPath(ctx, bristle) {
        const pathWidth = this.maxX - this.minX;
        const firstX = this.minX + pathWidth * (this.maxPathLength - this.pathValues.length) / this.maxPathLength;

        ctx.lineWidth = bristle.bristleWidth;

        ctx.strokeStyle = ctx.createLinearGradient(40, 0, 200, 0);
        ctx.strokeStyle.addColorStop(0, 'rgb(50, 50, 50, 0)');
        ctx.strokeStyle.addColorStop(1, 'rgb(50, 50, 50, 0.3)');

        ctx.beginPath();

        for (let i = 0; i < this.pathValues.length; i++) {
            let x = firstX + bristle.xOffset + pathWidth * (i / this.maxPathLength);
            let y = this.baseVerticalOffset + bristle.yOffset + this.pathValues[i];
            ctx.lineTo(x, y);
        }

        ctx.stroke();
    }
}


class Bristle {

    constructor(brushWidth, brushHeight) {

        this.xOffset = getRandInteger(-brushWidth / 2, brushWidth / 2);
        this.yOffset = getRandInteger(-brushHeight / 2, brushHeight / 2);

        this.bristleWidth = Math.random() > 0.5 ? 1 : 2;
    }
}


class ScrollPhysics {
     
    constructor() {
        this.previousScrollPosition = 0;
        this.previousScrollSpeed = 0;
        this.scrollAcceleration = 0;
        this.previousScrollTimeMs = 0;
        this.maxScrollAcceleration = 100;
    }

    updateScrollAcceleration(lengthToPixels) {
        const currentScrollPosition = window.scrollY / lengthToPixels;

        let scrollDeltaTimeS = (Date.now() - this.previousScrollTimeMs) / 1000;
        if (scrollDeltaTimeS > 4/60) {
            scrollDeltaTimeS = 1/60;
            this.previousScrollSpeed = 0;
        }

        const scrollSpeed = - (currentScrollPosition - this.previousScrollPosition) / scrollDeltaTimeS;
        this.scrollAcceleration = (scrollSpeed - this.previousScrollSpeed) / scrollDeltaTimeS;

        if (this.scrollAcceleration < 0) {
            this.scrollAcceleration = Math.max(this.scrollAcceleration, -this.maxScrollAcceleration);
        } else {
            this.scrollAcceleration = Math.min(this.scrollAcceleration, this.maxScrollAcceleration);
        }

        this.previousScrollPosition = currentScrollPosition;
        this.previousScrollSpeed = scrollSpeed;
        this.previousScrollTimeMs = Date.now();
    }

    reset() {
        this.scrollAcceleration = 0;
    }
}


// Setup
const canvas = document.getElementById('springMassCanvas');
const isCanvasThumbnail = !!canvas.dataset.isthumbnail && canvas.dataset.isthumbnail === 'true';


// Simulation variables
let previousLoopTimeMs;
let pauseSimulation = false;
const gravity = 9.81;


// Dimensions
const springBaseWidth = 700;
const springBaseHeight = 115;
const weightBlockWidth = 196;
const lengthToPixels = 300; 

canvas.width = 1.2 * springBaseWidth;
canvas.height = 8/7 * canvas.width;  // 8:7 is aspect ratio of card image container

const ctx = canvas.getContext('2d');

function convertPageToCanvasPos(pageX, pageY, pageCanvas) {
    const rect = pageCanvas.getBoundingClientRect();
    const pageToCanvasXPixelScale = pageCanvas.width / rect.width;
    const pageToCanvasYPixelScale = pageCanvas.height / rect.height;
    return {
        canvasX: (pageX - rect.left) * pageToCanvasXPixelScale,
        canvasY: (pageY - rect.top) * pageToCanvasYPixelScale
    };
}


// Instantiate objects
const baseX = 0.1 * springBaseWidth;
const baseY = 0.1 * springBaseWidth;
const base = new DrawableOject('/images/springmass/springbase.png', baseX, baseY);

const springX = baseX + springBaseWidth / 2;
const springY = baseY + springBaseHeight + 5;
const spring = new Spring(springX, springY, canvas.height, lengthToPixels, isCanvasThumbnail);

const weightBlockX = springX - weightBlockWidth/2;
const weightBlockY = 0;
const weightBlock = new WeightBlock(weightBlockX, weightBlockY);

const damping = new Damping(isCanvasThumbnail);

const brushX = springX - weightBlockWidth / 2;
const brush = new Brush(brushX);

const scrollPhysics = new ScrollPhysics();


// Event listeners
window.addEventListener('scroll', () => scrollPhysics.updateScrollAcceleration(lengthToPixels));

// Don't allow interaction other than scrolling if canvas is a card thumbnail
if (!isCanvasThumbnail) {
    const handleSelectMass = (e) => {

        const { clientX, clientY } = e.touches ? e.touches[0] : e;
        const { canvasX, canvasY } = convertPageToCanvasPos(clientX, clientY, canvas);

        if (weightBlock.inBoundingBox(canvasX, canvasY)) {
            e.preventDefault(); // prevent text highlighting on drag

            pauseSimulation = true;
            weightBlock.select(canvasY);
        }
    };

    canvas.addEventListener('mousedown', handleSelectMass);
    canvas.addEventListener('touchstart', handleSelectMass);


    const handleMoveMass = (e) => {
        const { clientX, clientY } = e.touches ? e.touches[0] : e;
        const { canvasX, canvasY } = convertPageToCanvasPos(clientX, clientY, canvas);

        if (!e.touches) { // Mouse hover cursor
            canvas.style.cursor = weightBlock.inBoundingBox(canvasX, canvasY) ? 'pointer' : 'default';
        }
        
        if (weightBlock.isSelected) {
            if (e.touches) e.preventDefault(); // prevent scrolling on mobile

            const newPosition = weightBlock.getSelectedPosition(canvasY);
            spring.setBottomPositionWithinBounds(newPosition);
            weightBlock.dragToNewPosition(spring.getBottomPosition(), canvasY);
        }
    };

    document.addEventListener('mousemove', handleMoveMass);
    document.addEventListener('touchmove', handleMoveMass, { passive: false });


    const handleUnselectMass = () => {
        if (weightBlock.isSelected) {        
            weightBlock.unselect();
            pauseSimulation = false;
        }
    };

    document.addEventListener('mouseup', handleUnselectMass);
    document.addEventListener('touchend', handleUnselectMass);
}


// Simulation loop

function springMassCalculateAcceleration(baseAcceleration, springStiffness, mass, springLength, naturalLength, dampingCoefficient, velocity) {
    return baseAcceleration + (springStiffness / mass) * (naturalLength - springLength) - dampingCoefficient * velocity;
}

function springMassCalculateVelocity(initialVelocity, acceleration, timestep) {
    return initialVelocity + acceleration * timestep;
}

function springMassCalculatePosition(initialPosition, velocity, timestep) {
    return initialPosition + 0.5 * velocity * timestep;
}

function draw(currentTimeMs) {
    
    let timeElapsedS;
    if (previousLoopTimeMs) {
        // If previous time is too far in the past, assume 0.1 seconds elapsed to avoid large time steps
        timeElapsedS = Math.min((currentTimeMs - previousLoopTimeMs) / 1000, 0.1);
    } else {
        // If previous time not defined, initialize to current time minus one frame (assumes 60 FPS)
        timeElapsedS = 1 / 60;
    }
    previousLoopTimeMs = currentTimeMs;


    // Update state
    if (!pauseSimulation) {

        // Update acceleration
        const baseAcceleration = gravity + scrollPhysics.scrollAcceleration;
        const acceleration = springMassCalculateAcceleration(
            baseAcceleration,
            spring.stiffness,
            weightBlock.mass,
            spring.length,
            spring.naturalLength,
            damping.coefficient,
            weightBlock.velocity
        );
        weightBlock.setAcceleration(acceleration);
        
        // Update velocity
        const velocity = springMassCalculateVelocity(weightBlock.velocity, weightBlock.acceleration, timeElapsedS);
        weightBlock.setVelocity(velocity);
        
        // Update position
        const length = springMassCalculatePosition(spring.length, weightBlock.velocity, timeElapsedS);
        spring.setLengthWithinBounds(length);
        weightBlock.setY(spring.getBottomPosition());

        // Set velocity to 0 if spring is at its limit
        if (spring.isAtMaxOrMin()) {
            weightBlock.setVelocity(0);
        }

        // Reseting to zero after each frame to avoid persisting when scrolling ends
        scrollPhysics.reset();
    }


    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    
    if (!isCanvasThumbnail) {
        brush.addPathPoint(weightBlock.y);
        brush.draw(ctx);
    }

    base.draw(ctx);
    weightBlock.draw(ctx)
    spring.draw(ctx);

    // Request next frame
    window.requestAnimationFrame(draw);
}

// Start simulation
window.requestAnimationFrame(draw);