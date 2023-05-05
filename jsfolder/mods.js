const globals = require('./globals.js')
const utils = require('./utils.js')

function hasMod(beatmap, mod) {
    return (mod & beatmap.mods) > 0;
}

function applyMods(beatmap, mods) {
    beatmap.mods = mods;

    if((hasMod(beatmap, globals.MODS.EZ) && hasMod(beatmap, globals.MODS.HR)) ||
    hasMod(beatmap,globals.MODS.HT) && hasMod(beatmap, globals.MODS.DT)) {
        console.log(`${beatmap.name} You can't select both DT and HT or
        both EZ and HR`)
        beatmap.mods = 0;
        return 0;
    }

    if(hasMod(beatmap, globals.MODS.EZ)) {
        beatmap.ar *= 0.5;
        beatmap.od *= 0.5;
        beatmap.cs *= 0.5;
    }

    if(hasMod(beatmap, globals.MODS.HR)) {
        beatmap.ar = Math.min(beatmap.ar * 1.4, 10);
        beatmap.od = Math.min(beatmap.ar * 1.4, 10);

        beatmap.cs = Math.min(beatmap.cs * 1.3, 10);
    }

    if(hasMod(beatmap, globals.MODS.HT)) {
        for(let obj of beatmap.hitObjects) {
            obj.time = Math.ceil(obj.time / 0.75);
        }

        for(let timing of beatmap.timingPoints) {
            if(timing.beatInterval > 0) 
                timing.beatInterval /= 0.75;
            timing.offset = Math.ceil(timing.offset / 0.75);
        }

        beatmap.ar = utils.ms2AR(Math.floor(AR2ms(beatmap.ar) / 0.75))
    }

    if(hasMod(beatmap, globals.MODS.DT)) {
        for(let obj of beatmap.hitObjects) {
            obj.time = Math.ceil(obj.time / 1.5);
        }

        for(let timing of beatmap.timingPoints) {
            if(timing.beatInterval > 0) 
                timing.beatInterval /= 1.5;

            timing.offset = Math.ceil(timing.offset / 1.5);
        }

        beatmap.ar = utils.ms2AR(Math.floor(AR2ms(beatmap.ar) / 1.5))
    }

    return 1;
}

module.exports = {
    applyMods, hasMod
}