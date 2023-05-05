const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');

function GetLongestStream(streams)
{
	let max = 1;
	let interval = 0;

	for(let stream of streams) {
		interval = stream.first;
	
		max = 1;
	
		function innerFunc(j) {
			let length = j.size() + 1;
			if (length > max)
				max = j.size() + 1;
		}
		stream.second.forEach(innerFunc);
		
		if (max > 1) {break;}	
	}

	return{ interval, max };
}

function CalculateTenacity(beatmap)
{
	let longestStream = GetLongestStream(beatmap.streams);

	let intervalScaled = 1.0 / pow(longestStream.interval, pow(longestStream.interval, GetVar("Tenacity", "IntervalPow")) * GetVar("Tenacity", "IntervalMult")) * GetVar("Tenacity", "IntervalMult2");
	let lengthScaled = pow(GetVar("Tenacity", "LengthDivisor") / longestStream.length, GetVar("Tenacity", "LengthDivisor") / longestStream.length * GetVar("Tenacity", "LengthMult"));
	let tenacity = intervalScaled * lengthScaled;
	beatmap.skills.tenacity = tenacity;
	beatmap.skills.tenacity = GetVar("Tenacity", "TotalMult") * pow(beatmap.skills.tenacity, GetVar("Tenacity", "TotalPow"));
	return beatmap.skills.tenacity;
}