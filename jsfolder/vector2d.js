function clamp (value, low, high) {
    return Math.min(math.max(value, low), high)
}

function reciprocal_sqareroot(x) {
    return 1.0 / Math.sqrt(x)
}

class Vector2d {
    constructor() { this.X = 0; this.Y = 0; }

    constructor(nx, ny) { this.X = nx; this.Y = ny; }

    minus() { return new Vector2d(-X, -Y) }
    override(other) { X = other.X; Y = other.Y; return this; }

    plus(other) { return new Vector2d(X + other.X, Y + other.Y) }
    plusequals(other) { X += other.X; Y += other.Y; return this }
    plussingle(v) { return new Vector2d(X + v, Y + v) }
    plusequalssingle(v) { X += v; Y += v; return this }

    minus(other) { return new Vector2d(X - other.X, Y - other.Y) }
    minusequals(other) { X -= other.X; Y -= other.Y; return this }
    minussingle(v) { return new Vector2d(X - v, Y - v) }
    minusequalssingle(v) { X -= v; Y -= v; return this }

    times(other) { return new Vector2d(X * other.X, Y * other.Y) }
    timesequals(other) { X *= other.X; Y *= other.Y; return this }
    timessingle(v) { return new Vector2d(X * v, Y * v) }
    timesequalssingle(v) { X *= v; Y *= v; return this }

    div(other) { return new Vector2d(X / other.X, Y / other.Y) }
    divequals(other) { X /= other.X; Y /= other.Y; return this }
    divsingle(v) { return new Vector2d(X / v, Y / v) }
    divequalssingle(v) { X /= v; Y /= v; return this }

    equals(other) { return ((Math.abs(X - other.X) < 0.000001) && Math.abs(Y - other.Y) < 0.000001) }
    notequals(other) { return ((Math.abs(X-other.X) > 0.000001) || Math.abs(Y-other.Y) > 0.000001) }

    get length() { return Math.sqrt(X*X + Y*Y) }
    getDistanceFrom(other) { return this.minus(other).length; }

    normalize() {
        length = this.length;
        if(length == 0) return this;
        length = reciprocal_sqareroot(length)
        X = X * length
        Y = Y * length
        return this;
    }

    set(nX, nY) { X = nX; Y = nY; return this }

    rotateBy(degrees, center = new Vector2d()) {
        rad *= Math.PI / 180;
        const cs = cos(rad);
        const sn = sin(rad)

        X -= center.X
        Y -= center.Y

        this.set(X*cs - Y*sn, X*sn + Y*cs)

        X += center.X
        Y += center.Y
        return this;
    }

    get angle() {
        if(Y == 0) return X < 0 ? 180 : 0;
        else if(X == 0) return Y < 0 ? 90 : 270;

        tmp = clamp(Y / Math.sqrt(X*X + Y*Y), -1, 1)
        angle = atan(Math.sqrt(1 - tmp*tmp) / tmp) * (180 / Math.PI)

        if(X>0 && Y>0) return angle+270
        else if(X>0 && Y<0) return angle+90;
        else if(X<0 && Y<0) return 90-angle;
        else if(X<0 && Y>0) return 270-angle;

        return angle;
    }

    get lengthSQ() { return X*X + Y*Y }

    midPoint(other) { return new Vector2d((X + other.X) / 2, (Y + other.Y) / 2) }

    get nor() { return new Vector2d(-this.Y, this.X) }
}