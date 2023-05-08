const utils = require('./utils.js')
const tweaks = require('./tweakvars.js')
const globals = require('./globals.js')
const vector2d = require('./vector2d.js')

function CalculateTapStrains(beatmap) {
    let c = 0;
    let oldbonus;
    let strain = 0;

    for(let interval of beatmap.pressIntervals) {
        if(c == 0) {
            if(interval >= tweaks.GetVar("Stamina", "LargestInterval")) {
                strain = 0;
            } else {
                strain = tweaks.GetVar("Stamina", "Scale") / Math.pow(interval, 
                    Math.pow(interval, tweaks.GetVar("Stamina", "Pow")) * 
                    tweaks.GetVar("Stamina", "Mult"));
            }

            console.log(`strain: ${strain}`)

            beatmap.tapStrains.push(strain);
        } else {
            if(interval >= tweaks.GetVar("Stamina", "LargestInterval"))
                strain *= tweaks.GetVar("Stamina", "DecayMax");
            else {
                if(interval <= 15) continue;

                strain = tweaks.GetVar("Stamina", "Scale") / Math.pow(interval, Math.pow(
                    interval, tweaks.GetVar("Stamina", "Pow")) *
                    tweaks.GetVar("Stamina", "Mult"))

                strain += oldbonus * tweaks.GetVar("Stamina", "Decay");
            }

            console.log(strain)

            beatmap.tapStrains.push(strain);
        }

        oldbonus = strain;
        c++;
    }
}

function GetWeightedAimDistance(distance) {
    let distanceBonus = Math.pow(1 + (distance * tweaks.GetVar("Agility", "DistMult")),
        tweaks.GetVar("Agility", "DistPow"));
    
    return distance * distanceBonus;
}

function GetWeightedAimTime(time) {
    let timeBonus = Math.pow(time * tweaks.GetVar("Agility", "TimeMult"),
        GetVar("Agility", "TimePow"));

    return time * timeBonus;
}

/*function CalculateAimStrains(beatmap) {
    let oldStrain = 0;
    for(let i = 0; i < beatmap.aimPoints.length; i++) {
        let strain = 0;
        if(i) {
            let distance = GetWeightedAimDistance(beatmap.aimPoints[i].pos.
                getDistanceFrom(beatmap.aimPoints[i - 1].pos));
            
            let interval = beatmap.aimPoints[i].time - beatmap.aimPoints[i-1].time;
            let angleBonus = 1;
            if(i > 1)
                angleBonus = 1 + (tweaks.GetVar("Agility", "AngleMult") * beatmap.angleBonuses[i-2]);
            
            if(time > 0)
                strain = distance / time * angleBonus;
            else {
                console.log(`${beatmap.name} Agility strain calc: time <= 0`)
                continue;
            }

            if(beatmap.aimPoints[i].type == globals.AIM_POINT_TYPES.AIM_POINT_SLIDEREND ||
                beatmap.aimPoints[i-1].type == globals.AIM_POINT_TYPES.AIM_POINT_SLIDEREND)
                    strain *= tweaks.GetVar("Agility", "SliderStrainDecay");
            
            oldStrain -= tweaks.GetVar("Agility", "StrainDecay") * interval;
            if(oldStrain < 0)
                oldStrain = 0;

            strain += oldStrain;
        }

        beatmap.aimStrains.push(strain);
        oldStrain = strain;
    }
}*/

function GetAngleDecayFunc(beatmap, output) {
    let angleSpeeds = [];
    // console.log(beatmap)
    for(let i = 1; i < beatmap.aimPoints.length - 1; i++) {
        let prevPos = beatmap.aimPoints[i-1].pos,
            currPos = beatmap.aimPoints[i].pos,
            nextPos = beatmap.aimPoints[i + 1].pos
        
        let timeDelta = beatmap.aimPoints[i + 1].time - beatmap.aimPoints[i - 1].time,
            rad = utils.GetDirAngle(prevPos, currPos, nextPos),
            angle = Math.PI - rad;
        
        let radSpeed = angle / (timeDelta);

        let prevPrevPos;
        if(i > 1)
            prevPrevPos = beatmap.aimPoints[i-2].pos;
        else
            prevPrevPos = beatmap.aimPoints[i-1].pos;

        let equ = 1.07560910263708;
        if(angle < equ)
            radSpeed *= 1 + (0.5 / (1 + 40 * Math.exp(-angle * 4.5) + 0.5)) * 100;
        else
            radSpeed *= 1 + Math.abs(Math.sin(angle)) * 100;
            
        let currMidpoint = (prevPos + nextPos) / 2.0;
        let prevMidPoint = (prevPrevPos + currPos) / 2.0;

        let currNormal = new vector2d.Vector2d(currPos.X - currMidpoint.X,
                                                currPos.Y - currMidpoint.Y),
            prevNormal = new vector2d.Vector2d(prevPos.X - prevMidPoint.X,
                                                prevPox.Y - prevMidpoint.Y);
        
        if(utils.isOppositeParity(currNormal.X, prevNormal.X) ||
        utils.isOppositeParity(currNormal.Y, prevNormal.Y))
            radSpeed *= 1.5 * 100;

        angleSpeeds.push(radSpeed);
    }

    utils.getDecayFunction(angleSpeeds, 0.9, output);
}

function GetChaosDecayFunc(beatmap, output) {
    let chaosVals = [];

    for(let i = 1; i < beatmap.aimPoints.length - 1; i++) {
        let chaos = utils.GetChaosAt(beatmap, i);
        chaosVals.push(chaos);
    }

    utils.getDecayFunction(chaosVals, 0.9, output);
}

function GetPrecisionDecayFunc(beatmap, output) {
    let PrecisionVals = [];

    for(let i = 1; i < beatmap.aimPoints.length - 1; i++) {
        let humanTime = Math.log2(utils.GetNoteDistanceAt(beatmap, i, true) /
            (2 * utils.CS2px(beatmap.cs)) + 1) * 5,
            actualTime = beatmap.aimPoints[i+1].time - beatmap.aimPoints[i].time,
            precisionDiff = 0;

        if(humanTime == 0)
            precisionDiff = 0;
        else if(actualTime - humanTime < 0)
            precisionDiff = Infinity;
        else
            precisionDiff = (1000 * 1000) / Math.pow(actualTime - humanTime, 2);

        PrecisionVals.push(precisionDiff);
    }

    utils.getDecayFunction(PrecisionVals, 0.9, output)

    let topWeights = [];
    utils.getTopVals(output, 1000, topWeights);

    beatmap.skills.precision = utils.getWeightedValue(topWeights, 0.99) * 0.5;
}

function CalculateAimStrains(beatmap) {
    let angles = [], chaos = [], precision = [];
    let weightVals = [], weightFunc = [];

    GetAngleDecayFunc(beatmap, angles);
    GetChaosDecayFunc(beatmap, chaos);
    GetPrecisionDecayFunc(beatmap, precision);

    let size = Math.min(angles.length, chaos.length, precision.length)

    for(let i = 0; i < size; i++) {
        let weight = utils.getMagnitude([angles[i], chaos[i], precision[i] * 0.1])
        weightVals.push(weight);
    }

    utils.getDecayFunction(weightVals, 0.9, weightFunc);

    for(let i = 0; i < weightVals.length; i++)
        beatmap.angleStrains.push(weightFunc[i]);

    let topWeights = [];
    utils.getTopVals(weightVals, 1000, topWeights);

    beatmap.skills.agility = utils.getWeightedValue(topWeights, 0.99);
}

function ClearStrains(beatmap) {
    beatmap.tapStrains.clear();
    beatmap.aimStrains.clear();
}

module.exports = {
    CalculateTapStrains, CalculateAimStrains, ClearStrains
}