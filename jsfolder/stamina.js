const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
// #include <algorithm>

function CalculateStamina(beatmap)
{
	let max = Math.max.apply(Math, beatmap.tapStrains);
	let index = beatmap.tapStrains.indexOf(max);
	let time = beatmap.hitObjects[index].time;
	beatmap.skills.stamina = max;
	beatmap.skills.stamina = tweakvars.GetVar("Stamina", "TotalMult") * Math.pow(beatmap.skills.stamina, tweakvars.GetVar("Stamina", "TotalPow"));
	return beatmap.skills.stamina;
}

module.exports = { 
	CalculateStamina
}