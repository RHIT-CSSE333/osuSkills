const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
// #include <algorithm>

function CalculateStamina(beatmap)
{
	let max = Math.max(beatmap.tapStrains);
	console.log(`max: ${max}`)
	let index = beatmap.tapStrains.indexOf(max);
	console.log(`beatmap.hitObjects[index]: ${beatmap.hitObjects[index]}`)
	let time = beatmap.hitObjects[index].time;
	beatmap.skills.stamina = max;
	beatmap.skills.stamina = GetVar("Stamina", "TotalMult") * Math.pow(beatmap.skills.stamina, GetVar("Stamina", "TotalPow"));
	return beatmap.skills.stamina;
}

module.exports = { 
	CalculateStamina
}