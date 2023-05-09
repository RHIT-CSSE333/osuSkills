//import algorithm;
const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
const mods = require('./mods.js')

function CalculateAgility(beatmap)
{
	if(beatmap.aimStrains.length == 0){
		beatmap.skills.agility = 0;
	}
	else{
	let max = Math.max.apply(Math, beatmap.aimStrains);
	let index = beatmap.aimStrains.indexOf(max)
	let time = beatmap.aimPoints[index].time;
	beatmap.skills.agility = max;
	}

	let topWeights = [];
	utils.getPeakVals(beatmap.aimStrains, topWeights);

	beatmap.skills.agility = utils.getWeightedValue2(topWeights, tweakvars.GetVar("Agility", "Weighting"));
	beatmap.skills.agility = tweakvars.GetVar("Agility", "TotalMult") * Math.pow(beatmap.skills.agility, tweakvars.GetVar("Agility", "TotalPow"));
	return beatmap.skills.agility;
}

module.exports = {
	CalculateAgility
}