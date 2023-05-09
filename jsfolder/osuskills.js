const slider = require("./slider.js")
const vector2d = require("./vector2d.js")
const filereader = require('./filereader.js')
const tweak = require('./tweakvars.js')
const modFile = require('./mods.js')
const strains = require('./strains.js')
const globals = require('./globals.js')
const reaction = require('./reaction.js')
const stamina = require('./stamina.js')
const tenacity = require('./tenacity.js')
const mods = require('./mods.js')
const generic = require('./generic.js')

function PreprocessMap(beatmap) {
    if (beatmap.hitObjects.length < 2)
    {
        console.log("The map has less than 2 hit objects!");
        return 0;
    }
    generic.prepareTimingPoints(beatmap);
    slider.ApproximateSliderPoints(beatmap);
    generic.bakeSliderData(beatmap);

    generic.prepareAimData(beatmap);
    generic.prepareTapData(beatmap);
    if (beatmap.distances.size() == 0)
        return 0;
    return 1;
}

function CalculateSkills(beatmap) {
		reaction.CalculateReaction(beatmap, mods.hasMod(beatmap, globals.MODS.HD));
		stamina.CalculateStamina(beatmap);
		tenacity.CalculateTenacity(beatmap);
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

async function ProcessFile(filepath, mods, beatmap) {
	if(await filereader.parseBeatmap(filepath, beatmap) == 0) {
		console.log(`Parsing of ${filepath} failed!`)
		return 0;
	}

	if(mods != 0) modFile.applyMods(beatmap, mods);

	PreprocessMap(beatmap)
}

async function CalculateBeatmapSkills(filepath, mods) {
	let beatmap = new globals.Beatmap()

	if(await ProcessFile(filepath, mods, beatmap) == 0) {
		console.log(`failed to parse @${filepath}!`);
		return 1;
	}

	strains.CalculateAimStrains(beatmap);
	strains.CalculateTapStrains(beatmap);
	CalculateSkills(beatmap);

	console.log(beatmap.skills)

	return beatmap;
}

module.exports = {
	PreprocessMap, CalculateSkills, ProcessFile, CalculateBeatmapSkills
}

CalculateBeatmapSkills('/mnt/c/Users/urbonal/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu', globals.MODS.HD & globals.MODS.DT)

//lukas's laptop path: /mnt/c/Users/urbonal/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu
//emma's C:/Users/letscher/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu