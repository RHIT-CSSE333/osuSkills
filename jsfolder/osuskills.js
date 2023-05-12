const slider = require("./slider.js")
const vector2d = require("./vector2d.js")
const filereader = require('./filereader.js')
const tweak = require('./tweakvars.js')
const modFile = require('./mods.js')
const strains = require('./strains.js')
const globals = require('./globals.js')
const reaction = require('./reaction.js')
const agility = require('./agility.js')
const stamina = require('./stamina.js')
const tenacity = require('./tenacity.js')
const reading = require('./reading.js')
const accuracy = require('./accuracy.js')
const precision = require('./precision.js')
const memory = require('./memory.js')
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
    if (beatmap.distances.length == 0)
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
			agility.CalculateAgility(beatmap);
		precision.CalculatePrecision(beatmap, mods.hasMod(beatmap, globals.MODS.HD));
		accuracy.CalculateAccuracy(beatmap);
		if (mods.hasMod(beatmap, globals.MODS.FL))
		{
			memory.CalculateMemory(beatmap);
		}
		reading.CalculateReading(beatmap, mods.hasMod(beatmap, globals.MODS.HD));
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
	let formattedMods = 0 | ((mods.includes('HR')) ? globals.MODS.HR : 0) |
						((mods.includes('DT')) ? globals.MODS.DT : 0) |
						((mods.includes('HD')) ? globals.MODS.HD : 0) | 
						((mods.includes('FL')) ? globals.MODS.FL : 0);
	let beatmap = new globals.Beatmap()

	if(await ProcessFile(filepath, formattedMods, beatmap) == 0) {
		console.log(`failed to parse @${filepath}!`);
		return 1;
	}

	strains.CalculateAimStrains(beatmap);
	strains.CalculateTapStrains(beatmap);
	CalculateSkills(beatmap);

	// console.log(beatmap.skills)

	return beatmap.skills;
}

module.exports = {
	PreprocessMap, CalculateSkills, ProcessFile, CalculateBeatmapSkills
}

const directories = [
	'/home/lukas/Downloads/1972113 Tommy heavenly6 - PAPERMOON (TV Size) [no video]/Tommy heavenly6 - PAPERMOON (TV Size) (enri) [Insane].osu',
	'/mnt/c/Users/urbonal/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu',
	'C:/Users/letscher/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu'
]

// CalculateBeatmapSkills(directories[0], globals.MODS.HD & globals.MODS.DT)


//lukas's desktop path: /home/lukas/Downloads/1972113 Tommy heavenly6 - PAPERMOON (TV Size) [no video]/Tommy heavenly6 - PAPERMOON (TV Size) (enri) [Insane].osu
//lukas's laptop path: /mnt/c/Users/urbonal/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu
//emma's C:/Users/letscher/Downloads/Tommy_heavenly6_-_PAPERMOON_TV_Size_enri_Insane.osu