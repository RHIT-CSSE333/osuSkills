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
		// subdivide the curve
		let ncurve = Math.floor((approxlength / 4.0) + 2);
		for (let i = 0; i < ncurve; i++)
			this.curvePoints.push(this.pointAt(i / (ncurve - 1)));

		// find the distance of each point from the previous point
		//curveDis = [];
		let totalDistance = 0;
		for (let i = 0; i < ncurve; i++) {
			this.curveDis.push((i == 0) ? 0 : this.curvePoints[i].getDistanceFrom(this.curvePoints[i - 1]));
			totalDistance += this.curveDis[i];
		}
	}

	pointAt(t) {
		let c = new vector2d.Vector2d();
		let n = this._points.length - 1;
		for (let i = 0; i <= n; i++) {
			let b = utils.bernstein(i, n, t);
			c.X += this._points[i].X * b;
			c.Y += this._points[i].Y * b;
		}
		return c;
	}

}
module.exports = { Bezier };






