const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');

function GetLongestStream(streams)
{
	let max = 1;
	let interval = 0;

	for(let i = 0; i < streams.length; i++) {
		interval = streams[i];
	
		max = 1;
	
		streams[i+1].forEach((j) => {
			let length = j.size() + 1;
			if (length > max)
				max = j.size() + 1;
		});
		
		if (max > 1) {break;}	
	}

	return[interval, max];
}

function CalculateTenacity(beatmap)
{
	let longestStream = GetLongestStream(beatmap.streams);

	let intervalScaled = 1.0 / Math.pow(longestStream.interval, Math.pow(longestStream.interval, GetVar("Tenacity", "IntervalPow")) * GetVar("Tenacity", "IntervalMult")) * GetVar("Tenacity", "IntervalMult2");
	let lengthScaled = Math.pow(GetVar("Tenacity", "LengthDivisor") / longestStream.length, GetVar("Tenacity", "LengthDivisor") / longestStream.length * GetVar("Tenacity", "LengthMult"));
	let tenacity = intervalScaled * lengthScaled;
	beatmap.skills.tenacity = tenacity;
	beatmap.skills.tenacity = GetVar("Tenacity", "TotalMult") * Math.pow(beatmap.skills.tenacity, GetVar("Tenacity", "TotalPow"));
	return beatmap.skills.tenacity;
}