const utils = require("./utils.js");
const vector2d = require("./vector2d.js");
const bezier = require("./bezier.js")
const globals = require('./globals.js')
const mathjs = require('math.js')

const CURVE_POINTS_SEPERATION = 5;

class Slider {

	constructor(hitObject, line) {
		this.hitObject = hitObject;
		this.sliderX = [];
		this.sliderY = [];
		this.curve = [];
		this.ncurve = 0;

		let beziers = [];
		let controlPoints = hitObject.curves.length + 1;
		let points = [];

		let lastPoi = new vector2d.Vector2d(-1, -1);

		for (let i = 0; i < hitObject.curves.length; i++) {
			this.sliderX.push(hitObject.curves[i].X);
			this.sliderY.push(hitObject.curves[i].Y);
		}

		this.x = hitObject.pos.X;
		this.y = hitObject.pos.Y;

		for (let i = 0; i < controlPoints; i++) {
			let tpoi = new vector2d.Vector2d(this.getX(i), this.getY(i));
			if (line) {
				if (lastPoi != new vector2d.Vector2d(-1, -1)) {
					points.push(tpoi);
					beziers.push(new bezier.Bezier(points));
					points = [];
				}
			}
			else if ((lastPoi != new vector2d.Vector2d(-1, -1)) && (tpoi == lastPoi)) {
				if (points.size() >= 2)
					beziers.push(new bezier.Bezier(points));
				points = [];
			}
			points.push(tpoi);
			lastPoi = tpoi;
		}

		if (line || points.length < 2) {
			// trying to continue Bezier with less than 2 points
			// probably ending on a red point, just ignore it
		}
		else {
			beziers.push(new bezier.Bezier(points));
			points = [];
		}

		this.init(beziers, hitObject);

	}

	getPointAt(obj, time) {
		let pos = obj.pos;
		let timeSinceStart = 0;

		if (IsHitObjectType(obj.type, SLIDER)) {
			pos = GetSliderPos(obj, time);
			timeSinceStart = time - obj.time;
		}

		return [pos.X, pos.Y, obj.time + timeSinceStart, timeSinceStart];
	}

	init(curvesList, hitObject) {
		// console.log(hitObject);

		// now try to creates points the are equidistant to each other
		this.ncurve = Math.floor(hitObject.pixelLength / CURVE_POINTS_SEPERATION);
		// console.log(this.ncurve)

		// console.log('first')
		// console.log(curvesList)

		// if the slider has no curve points, force one in 
		// a hitobject that the player holds must have at least one point
		if (curvesList.length == 0) {
			curvesList.push(new bezier.Bezier([hitObject.pos]));
			hitObject.endPoint = hitObject.pos;
		}

		// console.log('second')
		// console.log(curvesList)

		let distanceAt = 0;
		let curveCounter = 0;
		let curPoint = 0;
		let curCurve = new bezier.Bezier(curvesList[curveCounter++]);
		// console.log(curCurve)
		let lastCurve = curCurve.curvePoints[0];
		let lastDistanceAt = 0;

		// length of Curve should equal pixel length (in 640x480)
		let pixelLength = hitObject.pixelLength;

		// for each distance, try to get in between the two points that are between it
		for (let i = 0; i < this.ncurve + 1; i++) {
			let prefDistance = Math.floor(i * pixelLength / this.ncurve);
			while (distanceAt < prefDistance) {
				lastDistanceAt = distanceAt;
				lastCurve = curCurve.curvePoints[curPoint];
				curPoint++;

				if (curPoint >= curCurve.curvePoints.length) {
					if (curveCounter < curvesList.length) {
						curCurve = curvesList[curveCounter++];
						curPoint = 0;
					}
					else {
						curPoint = curCurve.curvePoints.length - 1;

						// out of points even though the preferred distance hasn't been reached
						if (lastDistanceAt == distanceAt) {
							// console.log('at break')
							break;
						} 
					}
				}
				distanceAt += curCurve.curveDis[curPoint];
			}
			let thisCurve = curCurve.curvePoints[curPoint];

			// interpolate the point between the two closest distances
			if (distanceAt - lastDistanceAt > 1) {
				let t = (prefDistance - lastDistanceAt) / (distanceAt - lastDistanceAt);
				// console.log('im fucking leeeeerpiiiing')
				this.curve.push(new vector2d.Vector2d(utils.lerp(lastCurve.X, thisCurve.X, t), utils.lerp(lastCurve.Y, thisCurve.Y, t)));
			}
			else {
				this.curve.push(thisCurve);
			}
		}
	}

	getX(i) {
		return (i == 0) ? this.x : this.sliderX[i - 1];
	}

	getY(i) {
		return (i == 0) ? this.y : this.sliderY[i - 1];
	}

}

function ApproximateSliderPoints(beatmap) {
	let timingPointOffsets = [];
	let beatLengths = [];
	let base = 0.0;
	for (let i = 0; i < beatmap.timingPoints.length; i++) {
		timingPointOffsets.push(beatmap.timingPoints[i].offset);

		if (beatmap.timingPoints[i].inherited) {
			beatLengths.push(base);
		}
		else {
			beatLengths.push(beatmap.timingPoints[i].beatInterval);
			base = beatmap.timingPoints[i].beatInterval;
		}
	}

	let i = 0;
	for (hitObject of beatmap.hitObjects) {
		i++;
		if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Slider)) {
			let timingPointIndex = utils.getValuePos(timingPointOffsets, hitObject.time, true);

			hitObject.toRepeatTime = (Math.round((((-600.0 / beatmap.timingPoints[timingPointIndex].bpm) * hitObject.pixelLength * beatmap.timingPoints[timingPointIndex].sm) / (100.0 * beatmap.sm))));
			hitObject.endTime = hitObject.time + hitObject.toRepeatTime * hitObject.repeat;

			// Saving the time of repeats
			if (hitObject.repeat > 1) {
				for (let i = hitObject.time; i < hitObject.endTime; i += hitObject.toRepeatTime) {
					if (i > hitObject.endTime)
						break;
					hitObject.repeatTimes.push(i);
				}
			}

			let tickInterval = (beatLengths[timingPointIndex] / beatmap.st);
			const errInterval = 10;
			let j = 1;

			for (let i = hitObject.time + tickInterval; i < (hitObject.endTime - errInterval); i += tickInterval) {
				if (i > hitObject.endTime) break;

				let tickTime = hitObject.time + Math.floor(tickInterval * j);
				if (tickTime < 0) break;

				hitObject.ticks.push(tickTime);
				j++;
			}

			// If the slider starts and ends in less than 100ms and has no ticks to allow a sliderbreak, then make it a short generic slider
			if ((Math.abs(hitObject.endTime - hitObject.time) < 100) && (hitObject.ticks.length == 0)) {
				let hitObjectNew = {};

				hitObjectNew.curves = [new vector2d.Vector2d(hitObject.pos.X, hitObject.pos.Y), new vector2d.Vector2d(hitObject.pos.X + tickInterval / beatmap.st, hitObject.pos.Y + tickInterval / beatmap.st)];
				hitObjectNew.pos = hitObject.pos;
				hitObjectNew.type = hitObject.type;
				hitObjectNew.time = hitObject.time;
				hitObjectNew.endTime = hitObject.time + 101;
				hitObjectNew.toRepeatTime = hitObject.time + 101;
				hitObjectNew.repeat = 1;
				hitObjectNew.pixelLength = 100;
				hitObjectNew.curveType = 'L';

				//TODO: wtf is this
				new Slider(hitObjectNew, true);
				hitObject = hitObjectNew;
				continue;
			}
		}
		else {
			hitObject.endTime = hitObject.time;
		}
	}
}

function GetSliderPos(hitObject, time) {
	if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Slider)) {
		// convert time to percent
		let percent = 0.0;
		if (time <= hitObject.time)
			percent = 0.0;
		else if (time > hitObject.endTime)
			percent = 1.0;
		else {
			let timeLength = (time - hitObject.time);
			let repeatsDone = Math.floor(timeLength / hitObject.toRepeatTime);
			percent = (timeLength - hitObject.toRepeatTime * repeatsDone) / hitObject.toRepeatTime;
			if (repeatsDone % 2)
				percent = 1 - percent; // it's going back
		}

		console.log(`percent: ${percent}`)

		// get the points
		let ncurve = hitObject.ncurve;
		let indexF = percent * ncurve;
		let index = Math.floor(indexF);

		console.log(`indexF: ${indexF}`)

		console.log(`hitObject: `)
		console.log(hitObject)

		if (index >= hitObject.ncurve) {
			let poi = hitObject.lerpPoints[ncurve];
			return new vector2d.Vector2d(poi.X, poi.Y);
		}
		else {
			console.log(index)
			let poi = hitObject.lerpPoints[index];
			console.log(poi)
			let poi2 = hitObject.lerpPoints[index + 1];
			let t2 = indexF - index;
			return new vector2d.Vector2d(utils.lerp(poi.X, poi2.X, t2), utils.lerp(poi.Y, poi2.Y, t2));
		}
	}
	else
		return new vector2d.Vector2d(-1, -1);
}

module.exports = {
	Slider, ApproximateSliderPoints, GetSliderPos
}