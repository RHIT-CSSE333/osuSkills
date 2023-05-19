const globals = require('./globals.js');
const utils = require('./utils.js');
const mods = require('./mods.js');
const tweakvars = require('./tweakvars.js');

function GetApproachRelativeSize(time, hitTime, ar)
{
	if (hitTime < time) return 1;
	else if (hitTime - utils.AR2ms(ar) > time) return 0;
	else
	{
		let diff = hitTime - time;
		let interval = utils.AR2ms(ar);
		return 1 + 3 * ( diff / interval);
	}
}

function IsObservableFrom(obj, distance, fromPos)
{
	let dist = obj.pos.getDistanceFrom(fromPos);
	// saving (distance/time) for spaced apart parts without followpoints
	if (dist < distance)
		return true;
	return false;
}

function CalculateMemory(beatmap)
{
	let totalMemPoints = 0;
	let old = beatmap.hitObjects[0];
	let combo = 0; // combo counter
	
	for (let i = 1; i < Math.floor(beatmap.hitObjects.length); i++)
	{
		let cur = beatmap.hitObjects[i];
		let memPoints = 0;
		let observableDist = 160;
		if (combo < 100)
			observableDist = 160;
		else if (combo < 200)
			observableDist = 120;
		else
			observableDist = 100;
		//observableDist += CS2px(beatmap.cs);
		
		let sliderBonusFactor = 1;
		if (utils.IsHitObjectType(old.type, globals.HITOBJECTTYPE.Slider))
			sliderBonusFactor = tweakvars.GetVar("Memory", "SliderBuff");
		
		let observable = false;
		let helpPixels = 0; // it's easier to navigate when you see approaches / circle border (HD)
		for (let j = i - 1; j > 0; j--)
		{
			let prev = beatmap.hitObjects[j];
			if (cur.time - prev.time > utils.AR2ms(beatmap.ar))
				break;
			if (!mods.hasMod(beatmap, globals.MODS.HD))
			{
				let size = GetApproachRelativeSize(prev.endTime, cur.time, beatmap.ar);
				helpPixels = Math.floor(size * utils.CS2px(beatmap.cs));
			}
			else
			{
				let observableTime = cur.time;
				observableTime = cur.time - Math.floor((utils.AR2ms(beatmap.ar)) * 0.3); // hd dissapear interval
				if (prev.time > observableTime)
					continue; // dissapeared already
				helpPixels = utils.CS2px(beatmap.cs); // we can see more of a circle than just it's center point
			}
			if (IsObservableFrom(cur, observableDist + helpPixels, prev.pos))
			{
				observable = true;
				break;
			}
		}

		if (!observable)
		{
			if (!mods.hasMod(beatmap, globals.MODS.HD))
			{
				let size = GetApproachRelativeSize(old.endTime, cur.time, beatmap.ar);
				helpPixels = Math.floor(size * utils.CS2px(beatmap.cs));
			}
			else
			{
				helpPixels = utils.CS2px(beatmap.cs); // we can see more of a circle than just it's center point
			}
			if (utils.IsHitObjectType(cur.type, globals.HITOBJECTTYPE.NewCombo) || utils.IsHitObjectType(cur.type, globals.HITOBJECTTYPE.ColorHax)) // only new combo changes
			{
				let dist = cur.pos.getDistanceFrom(old.endPoint);
				// saving (distance/time) for spaced apart parts without followpoints
				if (dist > observableDist + helpPixels)
					memPoints = sliderBonusFactor * (dist / (cur.time - old.time));
			}
			else
			{
				let dist = cur.pos.getDistanceFrom(old.endPoint);
				// saving (distance/time) for spaced apart parts with followpoints
				// treat parts with followpoints as easier ones
				if (dist > observableDist + helpPixels)
					memPoints = sliderBonusFactor * tweakvars.GetVar("Memory", "FollowpointsNerf") * (dist / (cur.time - old.time));
			}
		}

		// count combo
		if (utils.IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Normal) || utils.IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Spinner))
			combo++;
		else if (utils.IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Slider))
			combo += cur.ticks.length + 2;

		old = cur; // save previous object
		totalMemPoints += memPoints;
	}
	beatmap.skills.memory = totalMemPoints;
	beatmap.skills.memory = tweakvars.GetVar("Memory", "TotalMult") * Math.pow(beatmap.skills.memory, tweakvars.GetVar("Memory", "TotalPow"));
	return beatmap.skills.memory;
}

module.exports = { CalculateMemory }