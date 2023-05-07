const utils = require('./utils.js');
const patterns = require('./patterns.js');
const tweakvars = require('./tweakvars.js'); 
// #include <algorithm>

function CalculatePrecision(beatmap, hidden)
{
	let scaledAgility;
	if (beatmap.skills.agility > GetVar("Precision", "AgilityLimit"))
		scaledAgility = 1;

	scaledAgility = Math.pow(beatmap.skills.agility + 1, GetVar("Precision", "AgilityPow")) - GetVar("Precision", "AgilitySubtract");

	// the magic number above is to make an agility of 10 become 1 when scaled
	beatmap.skills.precision = scaledAgility * beatmap.cs;
	beatmap.skills.precision = GetVar("Precision", "TotalMult") * pow(beatmap.skills.precision, GetVar("Precision", "TotalPow"));

	return beatmap.skills.precision;
}
