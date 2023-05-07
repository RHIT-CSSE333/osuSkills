const utils = require('./utils.js');
const patterns = require('./patterns.js');
const tweakvars = require('./tweakvars.js');
const { HITOBJECTTYPE } = require('./globals.js');
// #include <algorithm>

function PatternReq(p1, p2, p3, CSpx)
{
	const XPOS = 0;
	const YPOS = 1;
	const TIME = 2;

	let point1 = new Vector2d(p1.pos.X, p1.pos.Y);
	let point2 = new Vector2d(p2.pos.X, p2.pos.Y);
	let point3 = new Vector2d(p3.pos.X, p3.pos.Y);

	let dist_12 = point1.getDistanceFrom(point2);
	let dist_23 = point2.getDistanceFrom(point3);
	let dist = dist_12 + dist_23;

	let angle = GetAngle(point1,point2,point3);

	let time = Math.abs(p3.time - p1.time);
	time = (time < 16) ? 16 : time; // 16ms @ 60 FPS

	// 2 * _CSpx = 1 diameter od CS since CS here is being calculated in terms of radius
	return time / ((dist / (2 * CSpx))*((M_PI - angle) / M_PI));  
}

function isHitobjectAt(_hitobjects, _prevTime, _currTime)
{
	let i = utils.FindHitobjectAt(_hitobjects, _currTime);
	if (BTWN(_prevTime, _hitobjects[i].time, _currTime)) return true;				  // a normal note
	if (BTWN(_hitobjects[i].time, _currTime, _hitobjects[i].endTime)) return true;  // a hold note

	return false;
}


function getNextTickPoint(_hitobjects, _time)
{
	let tickPoint;
	let i = utils.FindHitobjectAt(_hitobjects, _time, true);
	
	// if we reached the end, make timing.data = -1
	if (i >= _hitobjects.size() - 1) return {time: 0, data: -1,
											key: 0, press: false}; 
 
	// if the time is between 2 hitobjects, return the start of the next hitobject
	if (!isHitobjectAt(_hitobjects, _time - 1, _time))
	{
		_time = _hitobjects[i + 1].time;
		let pos = _hitobjects[i + 1].pos;

		tickPoint.pos = new Vector2d(pos.X, pos.Y);
		tickPoint.time = _time;
		tickPoint.data = 0;
		tickPoint.press = false;
		return tickPoint;
	}
	else
	{
		// if it is a slider, return the next closest tick
		if (utils.IsHitObjectType(_hitobjects[i].type, HITOBJECTTYPE.Slider))
		{
			let ticks = _hitobjects[i].ticks;
			for (let tick = 1; tick < ticks.size(); tick++)
			{
				if (utils.BTWN(ticks[tick - 1], _time, ticks[tick]))
				{
					_time = ticks[tick];
					let pos = GetSliderPos(_hitobjects[i], ticks[tick]);

					tickPoint.pos = new Vector2d(pos.X, pos.Y);
					tickPoint.time = _time;
					tickPoint.data = 0;
					tickPoint.press = true;
					return tickPoint;
				}
			}

			// else slider had no second tick
			_time = _hitobjects[i + 1].time;
			let pos = _hitobjects[i + 1].pos;

			tickPoint.pos = new Vector2d(pos.X, pos.Y);
			tickPoint.time = _time;
			tickPoint.data = 0;
			tickPoint.press = false;
			return tickPoint;
		}
		else // if it is a regular hitobject, return the start of the next hitobject
		{
			_time = _hitobjects[i + 1].time;
			let pos = _hitobjects[i + 1].pos;

			tickPoint.pos = new Vector2d(pos.X, pos.Y);
			tickPoint.time = _time;
			tickPoint.data = 0;
			tickPoint.press = false;
			return tickPoint;
		}
	}
}

// Original model can be found at https://www.desmos.com/calculator/k9r2uipjfq
function Pattern2Reaction(p1, p2, p3, ARms, CSpx)
{
	let damping = mods.GetVar("Reaction", "PatternDamping");		// opposite of sensitivity; how much the patterns' influence is damped
	let curveSteepness = /*(300.0 / (ARms + 250.)) **/ damping;
	let patReq = PatternReq(p1, p2, p3, CSpx);

	return ARms - ARms*exp(-curveSteepness*patReq) /*+ curveSteepness*sqrt(curveSteepness*patReq)*/;
}

function react2Skill(_timeToReact)
{
	// Original model can be found at https://www.desmos.com/calculator/lg2jqyesnu
	let a = Math.pow(2.0, Math.log(78608.0 / 15625.0) / Math.log(34.0 / 25.0))*Math.pow(125.0, Math.log(68.0 / 25.0) / log(34.0 / 25.0));
	let b = Math.log(2.0) / (Math.log(2.0) - 2.0*Math.log(5.0) + Math.log(17.0));
	return a / Math.pow(_timeToReact, b);
}

function getReactionSkillAt(targetpoints, targetpoint, hitobjects, CS, AR, hidden)
{
	let timeToReact = 0.0;
	let FadeInReactReq = mods.GetVar("Reaction", "FadeinPercent"); // players can react once the note is 10% faded in
	let index = utils.FindTimingAt(targetpoints, targetpoint.time);

	if (index >= targetpoints.size() - 2)
	{
		timeToReact = AR2ms(AR);
	}
	else if (index < 3)
	{
		let visibilityTimes = getVisiblityTimes(hitobjects[0], AR, hidden, FadeInReactReq, 1.0);
		timeToReact = hitobjects[0].time - visibilityTimes.first;
	}
	else
	{
		let t1 = targetpoints[index];
		let t2 = targetpoints[index + 1];
		let t3 = targetpoints[index + 2];

		let timeSinceStart = 0;

		if (targetpoint.press == true)
			timeSinceStart = Math.abs(targetpoint.time - hitobjects[targetpoint.key].time);  // Time since started holding slider

		let visibilityTimes = getVisiblityTimes(hitobjects[0], AR, hidden, FadeInReactReq, 1.0);
		let actualARTime = (hitobjects[0].time - visibilityTimes.first) + timeSinceStart;

		let result = Pattern2Reaction(t1, t2, t3, actualARTime, CS2px(CS));
		timeToReact = Math.sqrt(timeToReact*timeToReact + result*result);
	}

	//return 28.0*pow(react2Skill(timeToReact), 0.524); // to fit it on scale compared to other skills (v1)
	return GetVar("Reaction", "VerScale")*Math.pow(react2Skill(timeToReact), GetVar("Reaction", "CurveExp")); // to fit it on scale compared to other skills (v2)
}

function CalculateReaction(beatmap, hidden)
{
	let max = 0;
	let avg = 0;
	let weight = GetVar("Reaction", "AvgWeighting");

    beatmap.targetPoints.forEach((ticks) => {
        let val = getReactionSkillAt(beatmap.targetPoints, tick, beatmap.hitObjects, beatmap.cs, beatmap.ar, hidden);

		if (val > max)			max = val;
		if (val > max / 2.0)	avg = weight*val + (1 - weight)*avg;
    });

	beatmap.skills.reaction = (max + avg) / 2.0;
}