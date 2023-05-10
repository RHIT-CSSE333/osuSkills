const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');

function GetLongestStream(streams)
{
	let max = 1;
	let interval = 0;

	for(let key of Object.keys(streams)) {
		let stream = streams[key]
		interval = key

		max = 1;
		for(j of stream) {
			let length = j.length + 1;
			if(length > max)
				max = j.length + 1;
		}

		if(max > 1) break;
	}

	return [interval, max]
}

function CalculateTenacity(beatmap)
{
	// console.log('jere: ')
	let longestStream = GetLongestStream(beatmap.streams);

	console.log(longestStream)
	
	let intervalScaled = 1.0 / Math.pow(longestStream[0], Math.pow(longestStream[0], tweakvars.GetVar("Tenacity", "IntervalPow")) * tweakvars.GetVar("Tenacity", "IntervalMult")) * tweakvars.GetVar("Tenacity", "IntervalMult2");
	let lengthScaled = Math.pow(tweakvars.GetVar("Tenacity", "LengthDivisor") / longestStream[1], tweakvars.GetVar("Tenacity", "LengthDivisor") / longestStream[1] * tweakvars.GetVar("Tenacity", "LengthMult"));
	let tenacity = intervalScaled * lengthScaled;

	console.log(`intervalScaled: ${intervalScaled}\nlengthScaled: ${lengthScaled}`)
	
	beatmap.skills.tenacity = tenacity;
	console.log(`tenacity: ${tenacity}`)
	beatmap.skills.tenacity = tweakvars.GetVar("Tenacity", "TotalMult") * Math.pow(beatmap.skills.tenacity, tweakvars.GetVar("Tenacity", "TotalPow"));
	return beatmap.skills.tenacity;
}

module.exports = {
    CalculateTenacity, GetLongestStream
}