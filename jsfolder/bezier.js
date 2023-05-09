const vector2d = require("./vector2d.js");
const globals = require("./globals.js");
const utils = require("./utils.js");
const slider = require("./slider.js")

class Bezier {

	constructor(_points) {
		this._points = _points;
		this.curvePoints = []; 
		this.curveDis = [];

		this.approxlength = 0.0;
		for (let i = 0; i < _points.length - 1; i++) {
			this.approxlength += _points[i].getDistanceFrom(_points[i + 1]);
		}

		this.init(this.approxlength);

	}

	init(approxlength) {
		// console.log('begin init')
		// subdivide the curve
		// console.log('\n\n\n')
		// console.log(this._points);

		let ncurve = Math.floor((approxlength / 4.0) + 2);
		if(ncurve == 0) console.log('ncurve == 0')
		for (let i = 0; i < ncurve; i++) {
			let point = this.pointAt(i/ (ncurve - 1));
			this.curvePoints.push(point);
			// console.log(`pushing: ${point.ToString}`)
		}

		// find the distance of each point from the previous point
		//curveDis = [];
		let totalDistance = 0;
		for (let i = 0; i < ncurve; i++) {
			this.curveDis.push((i == 0) ? 0 : this.curvePoints[i].getDistanceFrom(this.curvePoints[i - 1]));
			totalDistance += this.curveDis[i];
		}
		// console.log('end init')
	}

	pointAt(t) {
		let c = new vector2d.Vector2d();
		let n = this._points.length - 1;
		for (let i = 0; i <= n; i++) {
			let b = utils.bernstein(i, n, t);
			// console.log(`og, i = ${i}: X:${this._points[i].X}, Y: ${this._points[i].Y}`)
			c.X += this._points[i].X * b;
			c.Y += this._points[i].Y * b;
		}
		return c;
	}

}
module.exports = { Bezier };






