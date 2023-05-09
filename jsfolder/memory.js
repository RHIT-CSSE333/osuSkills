const globals = require('./globals.js');
const utils = require('./utils.js');
const mods = require('./mods.js');
const tweakvars = require('./tweakvars.js');

function GetApproachRelativeSize(time, hitTime, ar)
{
	if (hitTime < time) return 1;
	else if (hitTime - AR2ms(ar) > time) return 0;
	else
	{
		let diff = hitTime - time;
		let interval = AR2ms(ar);
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
	
	for (let i = 1; i < (int)(beatmap.hitObjects.length); i++)
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
			sliderBonusFactor = mods.GetVar("Memory", "SliderBuff");
		
		let observable = false;
		let helpPixels = 0; // it's easier to navigate when you see approaches / circle border (HD)
		for (let j = i - 1; j > 0; j--)
		{
			let prev = beatmap.hitObjects[j];
			if (cur.time - prev.time > AR2ms(beatmap.ar))
				break;
			if (!mods.hasMod(beatmap, globals.MODS.HD))
			{
				let size = GetApproachRelativeSize(prev.endTime, cur.time, beatmap.ar);
				helpPixels = Math.floor(size * CS2px(beatmap.cs));
			}
			else
			{
				let observableTime = cur.time;
				observableTime = cur.time - Math.floor(static_cast<double>(AR2ms(beatmap.ar)) * 0.3); // hd dissapear interval
				if (prev.time > observableTime)
					continue; // dissapeared already
				helpPixels = CS2px(beatmap.cs); // we can see more of a circle than just it's center point
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
				helpPixels = Math.floor(size * CS2px(beatmap.cs));
			}
			else
			{
				helpPixels = CS2px(beatmap.cs); // we can see more of a circle than just it's center point
			}
			if (IsHitObjectType(cur.type, HITOBJECTTYPE.NewCombo) || IsHitObjectType(cur.type, HITOBJECTTYPE.ColorHax)) // only new combo changes
			{
				let dist = cur.pos.getDistanceFrom(old.endPoint);
				// saving (distance/time) for spaced apart parts without followpoints
				if (dist > observableDist + helpPixels)
					memPoints = sliderBonusFactor * (dist / (double)(cur.time - old.time));
			}
			else
			{
				let dist = cur.pos.getDistanceFrom(old.endPoint);
				// saving (distance/time) for spaced apart parts with followpoints
				// treat parts with followpoints as easier ones
				if (dist > observableDist + helpPixels)
					memPoints = sliderBonusFactor * GetVar("Memory", "FollowpointsNerf") * (dist / (double)(cur.time - old.time));
			}
		}

		// count combo
		if (IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Normal) || IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Spinner))
			combo++;
		else if (IsHitObjectType(cur.type, globals.HITOBJECTTYPE.Slider))
			combo += cur.ticks.size() + 2;

		old = cur; // save previous object
		totalMemPoints += memPoints;
	}
	beatmap.skills.memory = totalMemPoints;
	beatmap.skills.memory = GetVar("Memory", "TotalMult") * pow(beatmap.skills.memory, GetVar("Memory", "TotalPow"));
	return beatmap.skills.memory;
}