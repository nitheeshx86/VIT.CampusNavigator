const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let waves = [];

// Configuration for Waves
const config = {
    waveCount: 3,
    startColor: 'rgba(255, 255, 255, 0.03)', // Very subtle white
    endColor: 'rgba(255, 255, 255, 0.0)',
    speed: 0.005,
    amplitude: 50,
    frequency: 0.01
};

class Wave {
    constructor(index, totalWaves) {
        this.index = index;
        this.totalWaves = totalWaves;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw(ctx, time) {
        ctx.beginPath();
        const yOffset = height / 2 + (this.index - this.totalWaves / 2) * 40; // Spread waves vertically

        ctx.moveTo(0, height / 2);

        for (let x = 0; x <= width; x += 10) { // Step size 10 for performance
            // Sine wave formula
            const y = Math.sin(x * config.frequency + time + this.phase + (x * 0.002)) * config.amplitude * Math.sin(time * 0.5)
                + yOffset
                + Math.cos(x * 0.005 + time * 0.8) * 20;

            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 - (this.index * 0.01)})`; // Fade out back waves
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function initWaves() {
    resize();
    createWaves();
    animateWaves();
    window.addEventListener('resize', resize);
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function createWaves() {
    waves = [];
    for (let i = 0; i < config.waveCount; i++) {
        waves.push(new Wave(i, config.waveCount));
    }
}

let time = 0;
function animateWaves() {
    ctx.clearRect(0, 0, width, height);

    time += config.speed;

    waves.forEach(wave => {
        wave.draw(ctx, time);
    });

    requestAnimationFrame(animateWaves);
}

// Multilingual Greeting Animation
const greetings = [
    "வணக்கம்", // Tamil
    "Hello", // English
    "Bonjour", // French
    "Ciao", // Italian
    "Hola", // Spanish
    "नमस्ते", // Hindi
    "こんにちは", // Japanese
    "السلام عليكم" // Arabic
];

const greetingElement = document.getElementById('greeting-text');
let greetingIndex = 0;

function startGreetingLoop() {
    // Initial State is set in HTML (Hello), but let's sync with array if needed.
    // Actually, user wants "வணக்கம்" first. HTML has "Hello".
    // Let's set the first one immediately or let it flow.
    // The request said "Greetings... in this order". 
    // HTML currently has "Hello". Let's update it to the first item immediately.
    greetingElement.textContent = greetings[0];

    setInterval(() => {
        // Fade Out
        greetingElement.classList.add('hidden');

        // Wait for fade out to complete (400ms matching CSS transition)
        setTimeout(() => {
            // Change Text
            greetingIndex = (greetingIndex + 1) % greetings.length;
            greetingElement.textContent = greetings[greetingIndex];

            // Fade In
            greetingElement.classList.remove('hidden');
        }, 400);

    }, 1000); // 2 seconds total interval
}

// Initialize
initWaves();
// Start greetings after a slight delay to match page load animations
setTimeout(startGreetingLoop, 100); 
