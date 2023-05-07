//import algorithm;
const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
const mods = require('./mods.js')

function CalculateAgility(beatmap)
{
	let max = max(beatmap.aimStrains);
	let index = beatmap.aimStrains.indexOf(max)
	let time = beatmap.aimPoints[index].time;
	beatmap.skills.agility = max;

	let topWeights = [];
	utils.getPeakVals(beatmap.aimStrains, topWeights);

	beatmap.skills.agility = utils.getWeightedValue2(topWeights, GetVar("Agility", "Weighting"));
	beatmap.skills.agility = mods.GetVar("Agility", "TotalMult") * pow(beatmap.skills.agility, mods.GetVar("Agility", "TotalPow"));
	return beatmap.skills.agility;
}