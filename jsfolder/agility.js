//import algorithm;
const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');

function CalculateAgility(beatmap)
{
	let max = max_element(begin(beatmap.aimStrains), end(beatmap.aimStrains));
	let index = distance(beatmap.aimStrains.begin(), max);
	let time = beatmap.aimPoints[index].time;
	beatmap.skills.agility = max;

	vector<double> topWeights;
	getPeakVals(beatmap.aimStrains, topWeights);

	beatmap.skills.agility = getWeightedValue2(topWeights, GetVar("Agility", "Weighting"));
	beatmap.skills.agility = GetVar("Agility", "TotalMult") * pow(beatmap.skills.agility, GetVar("Agility", "TotalPow"));
	return beatmap.skills.agility;
}