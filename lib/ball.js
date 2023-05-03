import Vector from "./vector.js";
function map(real_min, real_max, target_min, target_max, value) {
  return (
    target_min +
    ((value - real_min) * (target_max - target_min)) / (real_max - real_min)
  );
}
export default class Ball {
  goto = NaN;
  static target = NaN;
  isBound=true;
  static resist = 1;
  static count = 0;
  static randomBall(ctx, c) {
    const W = ctx.canvas.clientWidth / 2;
    const H = ctx.canvas.clientHeight / 2;
    return new Ball(
      5,
      Vector.randomVector(W, H),
      Vector.randomVector(W / 20, H / 20),
      Vector.randomVector(1, 1),
      c
    );
  }
  constructor(
    r = 5,
    pos = new Vector(),
    vel = new Vector(),
    acc = new Vector(),
    c = "blue"
  ) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
    // this.pos.mode = "arrow";
    this.vel.mode = "arrow";
    // this.vel.MagOptions.is=true
    this.acc.mode = "arrow";
    this.r = r;
    this.color = c;
    this.name = Ball.count++;
  }
  show(ctx) {
    let a = ctx.canvas.clientWidth / 2;
    let b = ctx.canvas.clientHeight / 2;
    ctx.beginPath();
    this.pos.draw(ctx, [a, b]);
    this.vel.draw(ctx, this.pos.tip(), 4);
    // console.log(this.vel);
    this.acc.draw(ctx, this.pos.tip(), 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x + a, this.pos.y + b, this.r, 0, Math.PI * 2, true);
    ctx.fill();
  }
  draw(ctx) {
    const W = ctx.canvas.clientWidth;
    const H = ctx.canvas.clientHeight;
    let a = W / 2;
    let b = H / 2;
    if (Ball.resist > 1) {
      if (this.pos.x > a * 1.01 || this.goto[1] < -a * 1.01) {
        this.pos.x = this.pos.x > 0 ? a : -a;
      }
      if (this.pos.y > b * 1.01 || this.pos.y < -b * 1.01) {
        this.pos.y = this.pos.y > 0 ? b : -b;
      }
    }

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x + a, this.pos.y + b, this.r, 0, Math.PI * 2, true);
    ctx.fill();
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if(this.isBound){
      let sidex = this.pos.x + a;
      // let sidex = this.pos.x + a + this.r;
      let sidey = this.pos.y + b;
      // let sidey = this.pos.y + b + this.r;
      if (sidex <= 0 || sidex > W) this.vel.x = -this.vel.x - this.acc.x;
      if (sidey <= 0 || sidey > H) this.vel.y = -this.vel.y - this.acc.y;
      // if (sidex - 2 * this.r <= 0 || sidex > W)
      //   this.vel.x = -this.vel.x - this.acc.x;
      // if (sidey - 2 * this.r <= 0 || sidey > H)
      //   this.vel.y = -this.vel.y - this.acc.y;
    }

    if (Ball.target) {
      let r = Vector.subtract(Ball.target, this.pos);
      this.acc = r;
      this.acc.setMag(1);
      // let l = r.mag()
      // this.acc.setMag(1000/(l*l))
      // console.log(l);
      // console.log(this.target);
    }
    if (Ball.resist > 1) {
      if (this.vel.mag() > 10) {
        this.vel.mult(1 / Ball.resist);
      }
    }
    if (this.goto) {
      let r = Vector.subtract(this.goto, this.pos);
      this.acc = r;
      this.acc.setMag(1);
    }
    if (this.controle) {
      this.update(false, ctx);
    }
  }
  drawDetail(ctx) {
    this.show(ctx);
    this.draw(ctx);
  }
  controles(ctx) {
    this.controle = true;
    let all = ["pos", "vel", "acc"].map((v) => {
      let factor = 2;
      if (v == "vel") factor = 20;
      if (v == "acc") factor = 80;
      const W = ctx.canvas.clientWidth;
      const H = ctx.canvas.clientHeight;
      let div = document.createElement("div");
      let lable = document.createElement("label");
      let slider = document.createElement("input");
      slider.id = v + "x";
      lable.htmlFor = v + "x";
      slider.type = "range";
      slider.value = map(-W / factor, W / factor, 0, 100, this[v].x);
      lable.innerHTML += v + "x = " + this[v].x.toFixed(1);
      slider.addEventListener("input", () => {
        this.update(slider, ctx, lable);
      });
      div.appendChild(lable);
      div.appendChild(slider);
      let lable2 = document.createElement("label");
      let slider2 = document.createElement("input");
      slider2.id = v + "y";
      lable2.htmlFor = v + "y";
      slider2.type = "range";
      slider2.value = map(-H / factor, H / factor, 0, 100, -this[v].y);
      lable2.innerHTML += v + "y = " + (-this[v].y).toFixed(1);
      slider2.addEventListener("input", () => {
        this.update(slider2, ctx, lable2);
      });
      div.appendChild(lable2);
      div.appendChild(slider2);
      return div;
    });
    return all;
  }
  update(e, ctx, lable) {
    const W = ctx.canvas.clientWidth;
    const H = ctx.canvas.clientHeight;
    if (e) {
      let X = e.id.slice(-1) == "x" ? W : -H;
      let [a, b] = [e.id.slice(0, 3), e.id.slice(-1)];
      let factor = 2;
      if (a == "vel") factor = 20;
      if (a == "acc") factor = 80;
      this[a][b] = map(0, 100, -X / factor, X / factor, e.value);
      lable.innerHTML =
        e.id + " = " + (X == W ? 1 : -1) * this[a][b].toFixed(1);
    }
    ["pos", "vel", "acc"].forEach((v) => {
      let factor = 2;
      if (v == "vel") factor = 20;
      if (v == "acc") factor = 80;
      if (e || v + "x" != e.id) {
        let a = map(-W / factor, W / factor, 0, 100, this[v].x);
        document.getElementById(v + "x").value = a;
        document.querySelector(`label[for=${v + "x"}]`).innerHTML =
          v + "x = " + this[v].x.toFixed(1);
      }
      if (e || v + "y" != e.id) {
        let a = map(-H / factor, H / factor, 0, 100, -this[v].y);
        document.getElementById(v + "y").value = a;
        document.querySelector(`label[for=${v + "y"}]`).innerHTML =
          v + "y = " + -this[v].y.toFixed(1);
      }
    });
  }
}
