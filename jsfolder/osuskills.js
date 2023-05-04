const slider = require("./slider.js")
const vector2d = require("./vector2d.js")

function PreprocessMap(beatmap)
{
    if (beatmap.hitObjects.length < 2)
    {
        console.log("The map has less than 2 hit objects!");
        return 0;
    }
    PrepareTimingPoints(beatmap);
    ApproximateSliderPoints(beatmap);
    BakeSliderData(beatmap);

    PrepareAimData(beatmap);
    PrepareTapData(beatmap);
    if (beatmap.distances.size() == 0)
        return 0;
    return 1;
}

function CalculateSkills(beatmap)
	{
		CalculateReaction(beatmap, HasMod(beatmap, HD));
		CalculateStamina(beatmap);
		CalculateTenacity(beatmap);
		agilityV2 = false;
		if (agilityV2)
			CalculateAgilityStrains(beatmap);  // calculates precision as well. Might seperate that later
		else
			CalculateAgility(beatmap);
		CalculatePrecision(beatmap, HasMod(beatmap, HD));
		CalculateAccuracy(beatmap);
		if (HasMod(beatmap, FL))
		{
			CalculateMemory(beatmap);
		}
		CalculateReading(beatmap, HasMod(beatmap, HD));
	}
