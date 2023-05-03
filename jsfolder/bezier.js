const vector2d = require("./vector2d.js");
const globals = require("./globals.js");
const utils = require("./utils.js");

class Bezier {

    constructor(_points){
        this._points = _points;

        this.approxlength = 0.0;
        for (let i = 0; i < _points.length - 1; i++){
            this.approxlength += _points[i].getDistanceFrom(_points[i + 1]);
        }

        init(approxlength);
    
    }

    init(approxlength) {
	// subdivide the curve
	let ncurve = Math.floor((int)(approxlength / 4.0) + 2);
	for (let i = 0; i < ncurve; i++)
		curvePoints.push(pointAt(i / (double)(ncurve - 1)));

	// find the distance of each point from the previous point
	//curveDis = [];
	let totalDistance = 0;
	for (let i = 0; i < ncurve; i++) 
	{
		curveDis.push((i == 0) ? 0 : curvePoints[i].getDistanceFrom(curvePoints[i - 1]));
		totalDistance += curveDis[i];
	}
}

pointAt(t)
{
    let c = new vector2d.Vector2d();
	let n = points.length - 1;
	for (let i = 0; i <= n; i++) 
	{
		let b = bernstein(i, n, t);
		c.X += points[i].X * b;
		c.Y += points[i].Y * b;
	}
	return c;
}

get curvePoints() {
   return this.curvePoints;
}

get curveDistance(){
    return this.curveDis;
}

get curvesCount(){
    return this.ncurve;
}

get totalDistance(){
    return this.totalDistance;
}

}
module.exports = {Bezier};






