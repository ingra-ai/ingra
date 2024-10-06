'use client';
import React, { useEffect, useRef } from 'react';

const Interstellar404: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Get canvas and context
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    let canvasWidth = canvas.width = window.innerWidth;
    let canvasHeight = canvas.height = window.innerHeight;

    // Fill canvas with black background
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw initial '404: Not Found' text
    context.fillStyle = 'white';
    context.font = '48px sans-serif';
    context.fillText('404: Not Found', canvas.width / 2 - 150, canvas.height / 2);

    // Center coordinates
    let centerX = canvasWidth / 2;
    let centerY = canvasHeight / 2;

    // Scaling factor
    let scale = 150;
    // Number of rings
    let numberOfRings = 35;

    // Arrays for ring positions and radii
    let ringPosX = new Array(numberOfRings);
    let ringPosY = new Array(numberOfRings);
    let ringRadius = new Array(numberOfRings);

    // Mouse coordinates
    let mouseX = 0.0;
    let mouseY = 0.0;
    let prevMouseX = 0.0;
    let prevMouseY = 0.0;

    // Inertia variables
    let inertiaX = 0.0;
    let inertiaY = 0.0;
    let prevInertiaX = 0.0;
    let prevInertiaY = 0.0;

    // Spring and friction constants
    let spring = 0.95;
    let friction = 0.95;
    let flag = 1;
    // Array to hold stars
    let starsArray: Stars[] = [];
    // Refresh interval
    let refreshInterval = 60;

    // Main draw function
    const draw = function () {
      window.requestAnimationFrame(draw);
      updateInertia();
      fillBackground();
      drawRings();
      for (let j = 0; j < starsArray.length; j++) {
        starsArray[j].fade();
        starsArray[j].animate();
        starsArray[j].drawStar();
      }
    };

    // Function to update inertia based on mouse movement
    const updateInertia = function () {
      inertiaX = mouseX;
      inertiaY = mouseY;
      prevMouseX += (prevInertiaX - inertiaX) * spring;
      prevMouseY += (prevInertiaY - inertiaY) * spring;
      prevMouseX *= friction;
      prevMouseY *= friction;
      prevInertiaX = inertiaX;
      prevInertiaY = inertiaY;
      inertiaX += prevMouseX;
      inertiaY += prevMouseY;
    };

    // Function to draw text
    const drawText = function () {
      if ( !context ) return;

      let text404 = '404'.split('').join(String.fromCharCode(0x2004));
      let textNotFound = 'Page Not Found'.split('').join(String.fromCharCode(0x2004));
      context.font = '4em Arial';
      context.fillStyle = 'hsla(220, 95%, 75%, .55)';
      context.fillText(text404, (canvas.width - context.measureText(text404).width) * 0.5, canvas.height * 0.45);

      context.font = '1em Arial';
      context.fillText(textNotFound, (canvas.width - context.measureText(textNotFound).width) * 0.5, canvas.height * 0.55);
    };

    // Function to fill the background with gradient and draw text
    const fillBackground = function () {
      if ( !context ) return;

      context.globalCompositeOperation = 'source-over';
      let gradient = context.createLinearGradient(
        canvas.width * 2,
        canvas.height * 2.5,
        canvas.width * 2,
        1
      );
      gradient.addColorStop(0, 'hsla(220, 95%, 10%, .55)');
      gradient.addColorStop(0.5, 'hsla(220, 95%, 30%, .55)');
      gradient.addColorStop(1, 'hsla(0, 0%, 5%, 1)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.globalCompositeOperation = 'lighter';
      drawText();
    };

    // Function to draw the rings
    const drawRings = function () {
      if ( !context ) return;

      for (let i = 0; i < numberOfRings; i++) {
        let currX = ringPosX[i];
        let currY = ringPosY[i];
        let currRadius = ringRadius[i];
        let dx = currX + inertiaX;
        let dy = currY + inertiaY;
        let s = 1 / (dx * dx + dy * dy - currRadius * currRadius);
        let ix = dx * s + currX * flag;
        let iy = -dy * s + currY * flag;
        let irad = currRadius * s;
        let gradient = context.createRadialGradient(
          ix * scale + centerX,
          iy * scale + centerY,
          irad,
          ix * scale + centerX,
          iy * scale + centerY,
          irad * scale
        );
        gradient.addColorStop(0, 'hsla(176, 95%, 95%, 1)');
        gradient.addColorStop(0.5, 'hsla(201, 95%, 45%, .5)');
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(ix * scale + centerX, iy * scale + centerY, irad * scale, 0, Math.PI * 2.0, true);
        context.fill();
      }
    };

    // Class representing stars
    class Stars {
      settings: any;
      x: number = 0;
      y: number = 0;
      radius: number = 0;
      dx: number = 0;
      dy: number = 0;
      twinkleDuration: number = 0;
      rotation: number = 0;
      colorShift: number = 0;

      constructor() {
        this.settings = {
          tlap: 8000,
          maxx: 5,
          maxy: 2,
          rmax: 5,
          rt: 1,
          dx: 960,
          dy: 540,
          mvx: 4,
          mvy: 4,
          rnd: true,
          twinkle: true,
        };
        this.reset();
      }

      // Reset star properties
      reset() {
        this.x = this.settings.rnd ? canvasWidth * Math.random() : this.settings.dx;
        this.y = this.settings.rnd ? canvasHeight * Math.random() : this.settings.dy;
        this.radius = (this.settings.rmax - 1) * Math.random() + 0.5;
        this.dx = Math.random() * this.settings.maxx * (Math.random() < 0.5 ? -1 : 1);
        this.dy = Math.random() * this.settings.maxy * (Math.random() < 0.5 ? -1 : 1);
        this.twinkleDuration = (this.settings.tlap / refreshInterval) * (this.radius / this.settings.rmax);
        this.rotation = Math.random() * this.twinkleDuration;
        this.settings.rt = Math.random() + 1;
        this.colorShift = Math.random() * 0.2 + 0.4;
        this.settings.mvx *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
        this.settings.mvy *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
      }

      // Update star rotation
      fade() {
        this.rotation += this.settings.rt;
      }

      // Draw the star
      drawStar() {
        if ( !context ) return;
      
        if (this.settings.twinkle && (this.rotation <= 0 || this.rotation >= this.twinkleDuration)) {
          this.settings.rt = this.settings.rt * -1;
        } else if (this.rotation >= this.twinkleDuration) {
          this.reset();
        }
        let opacity = 1 - this.rotation / this.twinkleDuration;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        let rad = this.radius * opacity;
        let gradient = context.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          rad <= 0 ? 1 : rad
        );
        gradient.addColorStop(0.0, `hsla(255,255%,255%,${opacity})`);
        gradient.addColorStop(this.colorShift, `hsla(201, 95%, 25%,${opacity * 0.6})`);
        gradient.addColorStop(1.0, 'hsla(201, 95%, 45%,0)');
        context.fillStyle = gradient;
        context.fill();
      }

      // Animate star position
      animate() {
        this.x += (this.rotation / this.twinkleDuration) * this.dx;
        this.y += (this.rotation / this.twinkleDuration) * this.dy;
        if (this.x > canvasWidth || this.x < 0) this.dx *= -1;
        if (this.y > canvasHeight || this.y < 0) this.dy *= -1;
      }
    }

    // Initialize stars
    for (let j = 0; j < 150; j++) {
      let star = new Stars();
      star.reset();
      starsArray[j] = star;
    }

    // Set up ring positions
    const setupRings = function () {
      let angleIncrement = (Math.PI * 2.0) / numberOfRings;
      for (let i = 0; i < numberOfRings; i++) {
        ringPosX[i] = Math.cos(angleIncrement * i);
        ringPosY[i] = Math.sin(angleIncrement * i);
        ringRadius[i] = 0.1;
      }
      draw();
    };

    // Event listener for mouse movement
    window.addEventListener(
      'mousemove',
      function (e) {
        mouseX = (e.clientX - centerX) / scale;
        mouseY = (e.clientY - centerY) / scale;
      },
      false
    );

    // Event listener for touch movement
    window.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault();
        mouseX = (e.touches[0].clientX - centerX) / scale;
        mouseY = (e.touches[0].clientY - centerY) / scale;
      },
      false
    );

    // Event listener for window resize
    window.addEventListener(
      'resize',
      function () {
        canvas.width = canvasWidth = window.innerWidth;
        canvas.height = canvasHeight = window.innerHeight;
        draw();
      },
      true
    );

    // Initialize and start animation
    setupRings();

    // Cleanup on component unmount
    return () => {
      if ( !context ) return;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Interstellar404;
