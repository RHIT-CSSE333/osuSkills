const slider = require("./slider.js")
const vector2d = require("./vector2d.js")

class CircumscribedCircle extends slider.Slider {

    constructor(hitObject){
        super(hitObject, false)

        for (let i = 0; i < hitObject.curves.length; i++)
        {
            this.sliderX.push(hitObject.curves[i].X);
            this.sliderY.push(hitObject.curves[i].Y);
        }
        this.x = hitObject.pos.X;
        this.y = hitObject.pos.Y;
    
        // construct the three points
        this.start = new vector2d.Vector2d(super.getX(0), super.getY(0));
        this.mid = new vector2d.Vector2d(super.getX(1), super.getY(1));
        this.end = new vector2d.Vector2d(super.getX(2), super.getY(2));
    
        // find the circle center
        let mida = this.start.midPoint(this.mid);
        let midb = this.end.midPoint(this.mid);
        let nora = (this.mid.minus(this.start)).nor;
        let norb = (this.mid.minus(this.end)).nor;
    
        //TODO: intersect?
        this.circleCenter = this.intersect(mida, nora, midb, norb);
        if (this.circleCenter == new vector2d.Vector2d(-1, -1))
        {
            // Temporary fallback to bezier slider
            let slidera = new slider.Slider(hitObject, true);
            curve.resize(slidera.curve.size());
            curve = slidera.curve;
            ncurve = slidera.ncurve;
            return;
        }
    
        // find the angles relative to the circle center
        let startAngPoint = this.start.minus(this.circleCenter);
        let midAngPoint = this.mid.minus(this.circleCenter);
        let endAngPoint = this.end.minus(this.circleCenter);
    
        this.startAng = Math.atan2(startAngPoint.Y, startAngPoint.X);
        this.midAng = Math.atan2(midAngPoint.Y, midAngPoint.X);
        this.endAng = Math.atan2(endAngPoint.Y, endAngPoint.X);
    
        // find the angles that pass through midAng
        if (!this.isIn(this.startAng, this.midAng, this.endAng))
        {
            if (Math.abs(this.startAng + 2*Math.PI - this.endAng) < 2*Math.PI && this.isIn(this.startAng + (2*Math.PI), this.midAng, this.endAng))
                this.startAng += 2*Math.PI;
            else if (Math.abs(this.startAng - (this.endAng + 2*Math.PI)) < 2*Math.PI && this.isIn(this.startAng, this.midAng, this.endAng + (2*Math.PI)))
                this.endAng += 2*Math.PI;
            else if (Math.abs(this.startAng - 2*Math.PI - this.endAng) < 2*Math.PI && this.isIn(this.startAng - (2*Math.PI), this.midAng, this.endAng))
                this.startAng -= 2*Math.PI;
            else if (Math.abs(this.startAng - (this.endAng - 2*Math.PI)) < 2*Math.PI && this.isIn(this.startAng, this.midAng, this.endAng - (2*Math.PI)))
                this.endAng -= 2*Math.PI;
            else
            {
                console.log(`Cannot find angles between midAng ${this.startAng, this.midAng, this.endAng}`);
                    //startAng, midAng, endAng), null, true
                return;
            }
        }
    
        // find an angle with an arc length of pixelLength along this circle
        this.radius = startAngPoint.length;
        let pixelLength = hitObject.pixelLength;
        let arcAng = pixelLength / this.radius;  // len = theta * r / theta = len / r
    
        // now use it for our new end angle
        this.endAng = (this.endAng > this.startAng) ? this.startAng + this.arcAng : this.startAng - this.arcAng;
    
        // calculate points
        let step = hitObject.pixelLength / slider.CURVE_POINTS_SEPERATION;
        this.ncurve = Math.floor(step);
        let len = Math.floor(step) + 1;
        for (let i = 0; i < len; i++)
        {
            let xy = pointAt(i / step);
            curve.push(Vector2d(xy.X, xy.Y));
        }
    }

    isIn(a, b, c)
{
	return (b > a && b < c) || (b < a && b > c);
}

intersect( a,  ta,  b,  tb)
{
	let des = tb.X * ta.Y - tb.Y * ta.X;
	if (Math.abs(des) < 0.00001)
	{
		console.log("Vectors are parallel.");
		return new vector2d.Vector2d(-1, -1);
	}
	let u = ((b.Y - a.Y) * ta.X + (a.X - b.X) * ta.Y) / des;
	b.X += tb.X * u;
	b.Y += tb.Y * u;
	return b;
}

pointAt(t)
{
	let ang = lerp(startAng, endAng, t);
	return new vector2d.Vector2d((cos(ang) * radius + circleCenter.X),
					(sin(ang) * radius + circleCenter.Y));
}

}

module.exports = { CircumscribedCircle }