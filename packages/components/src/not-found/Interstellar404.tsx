'use client';
import React, { useEffect, useRef } from 'react';

const Interstellar404: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    let canvasWidth = canvas.width = window.innerWidth;
    let canvasHeight = canvas.height = window.innerHeight;

    // Draw something on the canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '48px sans-serif';
    context.fillText('404: Not Found', canvas.width / 2 - 150, canvas.height / 2);

    let _x = canvasWidth / 2;
    let _y = canvasHeight / 2;

    let sc = 150;
    let num = 35;

    let midX = new Array(num);
    let midY = new Array(num);
    let rad = new Array(num);

    let msX = 0.0;
    let msY = 0.0;
    let _msX = 0.0;
    let _msY = 0.0;

    let invX = 0.0;
    let invY = 0.0;
    let _invX = 0.0;
    let _invY = 0.0;

    let spr = 0.95;
    let fric = 0.95;
    let flag = 1;
    let arr: any = [];
    let rint = 60;

    let draw = function () {
      window.requestAnimationFrame(draw);
      inv();
      fill();
      ring();
      for (let j = 0; j < arr.length; j++) {
        arr[j].fade();
        arr[j].anim();
        arr[j]._draw();
      }
    }
    let inv = function () {
      invX = msX;
      invY = msY;
      _msX += (_invX - invX) * spr;
      _msY += (_invY - invY) * spr;
      _msX *= fric;
      _msY *= fric;
      _invX = invX;
      _invY = invY;
      invX += _msX;
      invY += _msY;
    }

    let txt = function () {
      let t0 = "404".split("").join(String.fromCharCode(0x2004));
      let t1 = "Page Not Found".split("").join(String.fromCharCode(0x2004));
      context.font = "4em Arial";
      context.fillStyle = 'hsla(220, 95%, 75%, .55)';
      context.fillText(t0, (canvas.width - context.measureText(t0).width) * 0.5, canvas.height * 0.45);

      context.font = "1em Arial";
      context.fillText(t1, (canvas.width - context.measureText(t1).width) * 0.5, canvas.height * 0.55);
      return t1;
    }

    let fill = function () {
      context.globalCompositeOperation = 'source-over';
      let g_ = context.createLinearGradient(canvas.width + canvas.width, canvas.height + canvas.height * 1.5, canvas.width + canvas.width, 1);
      g_.addColorStop(0, ' hsla(220, 95%, 10%, .55)');
      g_.addColorStop(0.5, 'hsla(220, 95%, 30%, .55)');
      g_.addColorStop(1, 'hsla(0, 0%, 5%, 1)');
      context.fillStyle = g_;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.globalCompositeOperation = 'lighter';
      txt();
    }

    let ring = function () {
      for (let i = 0; i < num; i++) {
        let currX = midX[i];
        let currY = midY[i];
        let currRad = rad[i];
        let dx = currX + invX;
        let dy = currY + invY;
        let s = 1 / (dx * dx + dy * dy - currRad * currRad);
        let ix = dx * s + (currX * flag);
        let iy = -dy * s + (currY * flag);
        let irad = currRad * s;
        let g = context.createRadialGradient(ix * sc + _x,
          iy * sc + _y,
          irad,
          ix * sc + _x,
          iy * sc + _y,
          irad * sc)
        g.addColorStop(0, 'hsla(176, 95%, 95%, 1)');
        g.addColorStop(0.5, 'hsla(201, 95%, 45%, .5)');
        g.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        context.fillStyle = g;
        context.beginPath();
        context.arc(ix * sc + _x, iy * sc + _y, irad * sc, 0, Math.PI * 2.0, true);
        context.fill();
      }
    };

    class Stars {
      s: any;
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      tw: number;
      rt: number;
      cs: number;

      constructor() {
        this.s = { tlap: 8000, maxx: 5, maxy: 2, rmax: 5, rt: 1, dx: 960, dy: 540, mvx: 4, mvy: 4, rnd: true, twinkle: true };
        this.reset();
      }

      reset() {
        this.x = (this.s.rnd ? canvasWidth * Math.random() : this.s.dx);
        this.y = (this.s.rnd ? canvasHeight * Math.random() : this.s.dy);
        this.r = ((this.s.rmax - 1) * Math.random()) + .5;
        this.dx = (Math.random() * this.s.maxx) * (Math.random() < .5 ? -1 : 1);
        this.dy = (Math.random() * this.s.maxy) * (Math.random() < .5 ? -1 : 1);
        this.tw = (this.s.tlap / rint) * (this.r / this.s.rmax);
        this.rt = Math.random() * this.tw;
        this.s.rt = Math.random() + 1;
        this.cs = Math.random() * .2 + .4;
        this.s.mvx *= Math.random() * (Math.random() < .5 ? -1 : 1);
        this.s.mvy *= Math.random() * (Math.random() < .5 ? -1 : 1);
      }

      fade() {
        this.rt += this.s.rt;
      }

      _draw() {
        if (this.s.twinkle && (this.rt <= 0 || this.rt >= this.tw)) this.s.rt = this.s.rt * -1;
        else if (this.rt >= this.tw) this.reset();
        let o = 1 - (this.rt / this.tw);
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        context.closePath();
        let rad = this.r * o;
        let g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, (rad <= 0 ? 1 : rad));
        g.addColorStop(0.0, 'hsla(255,255%,255%,' + o + ')');
        g.addColorStop(this.cs, 'hsla(201, 95%, 25%,' + (o * .6) + ')');
        g.addColorStop(1.0, 'hsla(201, 95%, 45%,0)');
        context.fillStyle = g;
        context.fill();
      }

      anim() {
        this.x += (this.rt / this.tw) * this.dx;
        this.y += (this.rt / this.tw) * this.dy;
        if (this.x > canvasWidth || this.x < 0) this.dx *= -1;
        if (this.y > canvasHeight || this.y < 0) this.dy *= -1;
      }
    }

    for (let j = 0; j < 150; j++) {
      arr[j] = new Stars();
      arr[j].reset();
    }

    let set = function () {
      let radi = Math.PI * 2.0 / num;
      for (let i = 0; i < num; i++) {
        midX[i] = Math.cos(radi * i);
        midY[i] = Math.sin(radi * i);
        rad[i] = 0.1;
      }
      draw();
    }

    window.addEventListener('mousemove', function (e) {
      msX = (e.clientX - _x) / sc;
      msY = (e.clientY - _y) / sc;
    }, false);

    window.addEventListener('touchmove', function (e) {
      e.preventDefault();
      msX = (e.touches[0].clientX - _x) / sc;
      msY = (e.touches[0].clientY - _y) / sc;
    }, false);

    window.addEventListener('resize', function () {
      canvas.width = canvasWidth = window.innerWidth;
      canvas.height = canvasHeight = window.innerHeight;
      draw();
    }, true);

    set();

    // Cleanup on component unmount
    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Interstellar404;