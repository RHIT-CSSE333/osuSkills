const slider = require("./slider.js")
const vector2d = require("./vector2d.js")

class CircumscribedCircle extends slider.Slider {

    constructor(hitObject){
        for (let i = 0; i < hitObject.curves.length; i++)
        {
            sliderX.push(hitObject.curves[i].X);
            sliderY.push(hitObject.curves[i].Y);
        }
        x = hitObject.pos.X;
        y = hitObject.pos.Y;
    
        // construct the three points
        this.start = new vector2d.Vector2d(getX(0), getY(0));
        this.mid = new vector2d.Vector2d(getX(1), getY(1));
        this.end = new vector2d.Vector2d(getX(2), getY(2));
    
        // find the circle center
        mida = start.midPoint(mid);
        midb = end.midPoint(mid);
        nora = (mid - start).nor();
        norb = (mid - end).nor();
    
        //TODO: intersect?
        this.circleCenter = intersect(mida, nora, midb, norb);
        if (circleCenter == new vector2d.Vector2d(-1, -1))
        {
            // Temporary fallback to bezier slider
            slidera = new slider.Slider(hitObject, true);
            curve.resize(slidera.curve.size());
            curve = slidera.curve;
            ncurve = slidera.ncurve;
            return;
        }
    
        // find the angles relative to the circle center
        let startAngPoint = start - circleCenter;
        let midAngPoint = mid - circleCenter;
        let endAngPoint = end - circleCenter;
    
        this.startAng = Math.atan2(startAngPoint.Y, startAngPoint.X);
        this.midAng = Math.atan2(midAngPoint.Y, midAngPoint.X);
        this.endAng = Math.atan2(endAngPoint.Y, endAngPoint.X);
    
        // find the angles that pass through midAng
        if (!isIn(startAng, midAng, endAng))
        {
            if (Math.abs(startAng + TWO_PI - endAng) < TWO_PI && isIn(startAng + (TWO_PI), midAng, endAng))
                startAng += TWO_PI;
            else if (Math.abs(startAng - (endAng + TWO_PI)) < TWO_PI && isIn(startAng, midAng, endAng + (TWO_PI)))
                endAng += TWO_PI;
            else if (Math.abs(startAng - TWO_PI - endAng) < TWO_PI && isIn(startAng - (TWO_PI), midAng, endAng))
                startAng -= TWO_PI;
            else if (Math.abs(startAng - (endAng - TWO_PI)) < TWO_PI && isIn(startAng, midAng, endAng - (TWO_PI)))
                endAng -= TWO_PI;
            else
            {
                console.log("Cannot find angles between midAng "+ end1);
                    //startAng, midAng, endAng), null, true
                return;
            }
        }
    
        // find an angle with an arc length of pixelLength along this circle
        this.radius = startAngPoint.getLength();
        let pixelLength = hitObject.pixelLength;
        let arcAng = pixelLength / radius;  // len = theta * r / theta = len / r
    
        // now use it for our new end angle
        this.endAng = (endAng > startAng) ? startAng + arcAng : startAng - arcAng;
    
        // calculate points
        let step = hitObject.pixelLength / CURVE_POINTS_SEPERATION;
        ncurve = Math.floor(step);
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