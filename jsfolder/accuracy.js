const fs = require('fs');

const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
const mods = require('./mods.js');
const math = require('mathjs');

    function CalculateAccuracy(beatmap) {
        let circles = 0;
        
        fbeatmap.hitObjects.forEach(addFn);
        function addFn(obj) {
            if(IsHitObjectType(obj.type, HitObjectType.Normal))
                circles++;
        }
    
        let od_ms = math.OD2ms(beatmap.od);

        if(hasMod(beatmap, mods.DT)) od_ms /= 1.5;
        else if(HasMod(beatmap, mods.HT)) od_ms /= 0.75;

        let tapping = 0;
        if(beatmap.skills.stamina == 0) tapping = erf(math.INFINITY);
        else tapping = erf(od_ms / (math.GetVar("Accuracy", "AccScale") * beatmap.skills.stamina * beatmap.skills.stamina));
    
        beatmap.skills.accuracy = -math.GetVar("Accuracy", "VerScale")*circles*log(tapping);
        return beatmap.skills.accuracy;
    }