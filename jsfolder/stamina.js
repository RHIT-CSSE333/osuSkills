const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
// #include <algorithm>

function CalculateStamina(beatmap)
{
	let max = max_element(begin(beatmap.tapStrains), end(beatmap.tapStrains));
	let index = distance(beatmap.tapStrains.begin(), max);
	let time = beatmap.hitObjects[index].time;
	beatmap.skills.stamina = max;
	beatmap.skills.stamina = GetVar("Stamina", "TotalMult") * pow(beatmap.skills.stamina, GetVar("Stamina", "TotalPow"));
	return beatmap.skills.stamina;
}