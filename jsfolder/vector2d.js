function clamp (value, low, high) {
    return Math.min(math.max(value, low), high)
}

function reciprocal_sqareroot(x) {
    return 1.0 / Math.sqrt(x)
}

class Vector2d {
    constructor() {
        if(arguments.length == 0) { this.X = 0, this.Y = 0; return; }
        else if(arguments.length == 1){ this.X = arguments[0]; this.Y = arguments[0]; return; }
        else { this.X = arguments[0]; this.Y = arguments[1];}
    }

    minus() { return new Vector2d(-this.X, -this.Y) }
    override(other) { this.X = other.X; this.Y = other.Y; return this; }

    plus(other) { return new Vector2d(this.X + other.X, this.Y + other.Y) }
    plusequals(other) { this.X += other.X; this.Y += other.Y; return this }
    plussingle(v) { return new Vector2d(this.X + v, this.Y + v) }
    plusequalssingle(v) { this.X += v; this.Y += v; return this }

    minus(other) { return new Vector2d(this.X - other.X, this.Y - other.Y) }
    minusequals(other) { this.X -= other.X; this.Y -= other.Y; return this }
    minussingle(v) { return new Vector2d(this.X - v, this.Y - v) }
    minusequalssingle(v) { this.X -= v; this.Y -= v; return this }

    times(other) { return new Vector2d(this.X * other.X, this.Y * other.Y) }
    timesequals(other) { this.X *= other.X; this.Y *= other.Y; return this }
    timessingle(v) { return new Vector2d(this.X * v, this.Y * v) }
    timesequalssingle(v) { this.X *= v; this.Y *= v; return this }

    div(other) { return new Vector2d(this.X / other.X, this.Y / other.Y) }
    divequals(other) { this.X /= other.X; this.Y /= other.Y; return this }
    divsingle(v) { return new Vector2d(this.X / v, this.Y / v) }
    divequalssingle(v) { this.X /= v; this.Y /= v; return this }

    equals(other) { return ((Math.abs(this.X - other.X) < 0.000001) && Math.abs(this.Y - other.Y) < 0.000001) }
    notequals(other) { return ((Math.abs(this.X-other.X) > 0.000001) || Math.abs(this.Y-other.Y) > 0.000001) }

    get length() { return Math.sqrt(this.X*this.X + this.Y*this.Y) }
    getDistanceFrom(other) { return this.minus(other).length; }

    normalize() {
        length = this.length;
        if(length == 0) return this;
        length = reciprocal_sqareroot(length)
        this.X = this.X * length
        this.Y = this.Y * length
        return this;
    }

    set(nX, nY) { this.X = nX; this.Y = nY; return this }

    rotateBy(degrees, center = new Vector2d()) {
        rad *= Math.PI / 180;
        const cs = cos(rad);
        const sn = sin(rad)

        this.X -= center.X
        this.Y -= center.Y

        this.set(this.X*cs - this.Y*sn, this.X*sn + this.Y*cs)

        this.X += center.X
        this.Y += center.Y
        return this;
    }

    get angle() {
        if(this.Y == 0) return this.X < 0 ? 180 : 0;
        else if(this.X == 0) return this.Y < 0 ? 90 : 270;

        tmp = clamp(this.Y / Math.sqrt(this.X*this.X + this.Y*this.Y), -1, 1)
        angle = atan(Math.sqrt(1 - tmp*tmp) / tmp) * (180 / Math.PI)

        if(this.X>0 && this.Y>0) return angle+270
        else if(this.X>0 && this.Y<0) return angle+90;
        else if(this.X<0 && this.Y<0) return 90-angle;
        else if(this.X<0 && this.Y>0) return 270-angle;

        return angle;
    }

    get lengthSQ() { return this.X*this.X + this.Y*this.Y }

    midPoint(other) { return new Vector2d((this.X + other.X) / 2, (this.Y + other.Y) / 2) }

    get nor() { return new Vector2d(-this.Y, this.X) }

    get toString() {
        return (`Vector2D[X: ${this.X}, Y: ${this.Y}]`)
    }
}

module.exports = {
    Vector2d, clamp, reciprocal_sqareroot
}