const utils = require("./utils.js")
const strains = require("./strains.js")
const slider = require("./slider.js")
const cc = require("./circumscribedCircle.js")

function prepareAimData(beatmap) {
    calculateMovementData(beatmap)
    gatherTargetPoints(beatmap)
    gatherAimPoints(beatmap)
    calculateAngles(beatmap)
}

function prepareTapData(beatmap) {
    calculatePressIntervals(beatmap)
    gatherTapPatterns(beatmap)
}

function prepareTimingPoints(beatmap) {
    beatmap.bpmMin = 10000;
    beatmap.bpmMax = 0;
    bpm = 0;
    sliderMult = -100;
    oldBeat = -100;

    let TP;
    for (let i = 0; i < beatmap.timingPoints.size(); i++) {
        TP = beatmap.timingPoints[i]
        if(TP.inherited) {
            if(TP.beatInterval <= 0) {
                sliderMult = TP.beatInterval;
                oldBeat = TP.beatInterval
            } else sliderMult = oldBeat;
        } else {
            sliderMult = -100;
            BPM = 60000 / TP.beatInterval;
            if(beatmap.bpmMin > BPM)
                beatmap.bpmMin = BPM;
            if(beatmap.bpmMax < BPM)
                beatmap.bpmMax = BPM;
        }

        TP.bpm = BPM;
        TP.sm = sliderMult;
    }
}

function calculatePressIntervals(beatmap) {
    let previousTime = -1;
    for(hitObj of beatmap.hitObjects) {
        if(utils.IsHitObjectType(hitObj.type, global.HITOBJECTTYPE.Normal)
        || utils.IsHitObjectType(hitObj.type, global.HITOBJECTTYPE.Slider)) {
            if(previousTime != -1)
                beatmap.pressIntervals.push(hitObj.time - previousTime);
            previousTime = hitObj.time;
        }
    }
}

function calculateMovementData(beatmap)

function gatherTapPatterns(beatmap)
function getHardestBurst(beatmap)
function gatherTargetPoints(beatmap)
function gatherAimPoints(beatmap)
function calculateAngles(beatmap)
function bakeSliderData(beatmap)

module.exports = {
    prepareAimData, prepareTapData, prepareTimingPoints,
    calculatePressIntervals, calculateMovementData, gatherTapPatterns,
    getHardestBurst, gatherTargetPoints, gatherAimPoints,
    calculateAngles, bakeSliderData
}