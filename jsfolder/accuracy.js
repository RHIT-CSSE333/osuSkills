const fs = require('fs');

const tweakvars = require('./tweakvars.js');
const utils = require('./utils.js');
const mods = require('./mods.js');
const globals = require('./globals.js');

function erf(x) {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
  
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;
  
    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
  }

    function CalculateAccuracy(beatmap) {
        let circles = 0;
        
        beatmap.hitObjects.forEach((obj) => {
            if(utils.IsHitObjectType(obj.type, globals.HITOBJECTTYPE.Normal))
                circles++;
        })
    
        let od_ms = utils.OD2ms(beatmap.od);

        if(mods.hasMod(beatmap, globals.MODS.DT)) od_ms /= 1.5;
        else if(mods.hasMod(beatmap, globals.MODS.DT)) od_ms /= 0.75;

        let tapping = 0;
        if(beatmap.skills.stamina == 0) tapping = erf(Infinity);
        else tapping = erf(od_ms / (tweakvars.GetVar("Accuracy", "AccScale") * beatmap.skills.stamina * beatmap.skills.stamina));
    
        beatmap.skills.accuracy = -tweakvars.GetVar("Accuracy", "VerScale")*circles*Math.log(tapping);
        return beatmap.skills.accuracy;
    }

    module.exports = {
        CalculateAccuracy
    }