const utils = require("./utils.js")
const globals = require("./globals.js")
const strains = require("./strains.js")
const slider = require("./slider.js")
const cc = require("./circumscribedcircle.js")

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
    for (let i = 0; i < beatmap.timingPoints.length; i++) {
        TP = beatmap.timingPoints[i]
        if (TP.inherited) {
            if (TP.beatInterval <= 0) {
                sliderMult = TP.beatInterval;
                oldBeat = TP.beatInterval
            } else sliderMult = oldBeat;
        } else {
            sliderMult = -100;
            BPM = 60000 / TP.beatInterval;
            if (beatmap.bpmMin > BPM)
                beatmap.bpmMin = BPM;
            if (beatmap.bpmMax < BPM)
                beatmap.bpmMax = BPM;
        }

        TP.bpm = BPM;
        TP.sm = sliderMult;
    }
}

function calculatePressIntervals(beatmap) {
    let previousTime = -1;
    for (let hitObj of beatmap.hitObjects) {
        if (utils.IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Normal)
            || utils.IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Slider)) {
            if (previousTime != -1)
                beatmap.pressIntervals.push(hitObj.time - previousTime);
            previousTime = hitObj.time;
        }
    }
}

function calculateMovementData(beatmap) {
    let previousPos;
    let previousTime = -1;

    for (let i = 0; i < beatmap.hitObjects.length; i++) {
        if ((utils.IsHitObjectType(beatmap.hitObjects[i].type, globals.HITOBJECTTYPE.Normal)
            || utils.IsHitObjectType(beatmap.hitObjects[i].type, globals.HITOBJECTTYPE.Slider)) &&
            previousTime != -1) {

            let distance = beatmap.hitObjects[i].pos.getDistanceFrom(previousPos)
            let radSubtract = 2 * utils.CS2px(beatmap.cs)
            let interval = beatmap.hitObjects[i].time - previousTime;

            if (distance >= radSubtract) distance -= radSubtract;
            else distance /= 2;

            let speed = distance / interval

            beatmap.distances.push(distance);
            let distX = beatmap.hitObjects[i].pos.X - previousPos.X;
            beatmap.velocities.X.push(distX / interval)
            let distY = beatmap.hitObjects[i].pos.Y - previousPos.Y;
            beatmap.velocities.Y.push(distY / interval)
        }
        if (utils.IsHitObjectType(beatmap.hitObjects[i].type, globals.HITOBJECTTYPE.Normal) ||
            utils.IsHitObjectType(beatmap.hitObjects[i].type, globals.HITOBJECTTYPE.Slider)) {
            previousPos = beatmap.hitObjects[i].pos;
            previousTime = beatmap.hitObjects[i].time;
        }
    }

    let oldVelX = 0, oldVelY = 0;
    for (let i = 0; i < beatmap.velocities.X.length; i++) {
        let velX = beatmap.velocities.X[i];
        let velY = beatmap.velocities.Y[i];

        if (i) {
            beatmap.velocities.Xchange.push(velX - oldVelX)
            beatmap.velocities.Ychange.push(velY - oldVelY)
        }

        oldVelX = velX;
        oldVelY = velY;
    }
}

function gatherTapPatterns(beatmap) {
    let sections = {};

    let i = 0;
    let old = 0;
    let tmp = [];
    let uniq = new Set()
    const OFFSET_MAX_DISPLACEMENT = 2;
    for (let interval of beatmap.pressIntervals) {
        if (!uniq.has(interval)) {
            let found = false;
            for (let p = inteval - OFFSET_MAX_DISPLACEMENT; i <= interval + OFFSET_MAX_DISPLACEMENT; p++) {
                if (uniq.has(p)) {
                    interval = p;
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniq.add(interval);
                sections[interval] = [];
                beatmap.streams[interval] = [];
                beatmap.bursts[interval] = [];
            }
        }

        if (Math.abs(interval - old) > OFFSET_MAX_DISPLACEMENT) {
            tmplen = Object.keys(tmp).length;
            if (tmplen > 1) {
                sections.old.push(tmp);
                if (tmplen > 6)
                    beatmap.streams[old].push(tmp)
                else
                    beatmap.bursts[old].push(tmp)
            }
            tmp = {};
        }
        tmp.push(beatmap.hitObjects[i].time)
        old = interval
        i++
    }
}

function gatherTargetPoints(beatmap) {
    let targetPoint = {};
    let i = 0;
    let prev_time = Math.MIN_SAFE_INTEGER;

    for (let hitObj of beatmap.hitObjects) {
        if (Math.abs(hitObj.time - prev_time) < 5) continue;
        prev_time = hitObj.time;

        if (utils.IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Normal)) {
            targetPoint.time = hitObj.time;
            targetPoint.pos = hitObj.pos;
            targetPoint.key = i;
            targetPoint.press = false;

            beatmap.targetPoints.push(targetPoint);
        } else if (utils.IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Slider)) {
            for (let tick of hitObj.ticks) {
                targetPoint.time = tick;
                targetPoint.pos = slider.GetSliderPos(hitObj, tick);
                targetPoint.key = i;
                targetPoint.press = true;

                beatmap.targetPoints.push(targetPoint);
            }
        }

        i++;
    }
}


function gatherAimPoints(beatmap) {
    for (let hitObj of beatmap.hitObjects) {
        if (utils.IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Normal)) {
            beatmap.aimPoints.push([hitObj.time, hitobs.pos, globals.AIM_POINT_TYPES.AIMPOINTCIRCLE])
        } else if (IsHitObjectType(hitObj.type, globals.HITOBJECTTYPE.Slider)) {
            beatmap.aimPoints.push([hitObj.time, hitObj.pos, globals.AIM_POINT_TYPES.AIM_POINT_SLIDER]);

            let endTime = utils.GetLastTickTime(hitObj)
            let endPos = slider.GetSliderPos(hitObj, endTime);

            if (hitObj.ticks.length || hitObj.pos.getDistanceFrom(endPos) > 2 * utils.CS2px(beatmap.cs))
                beatmap.aimPoints.push([endTime, endPos, globals.AIM_POINT_TYPES.AIM_POINT_SLIDEREND]);
        }
    }
}

function calculateAngles(beatmap) {
    for (let i = 0; i + 2 < beatmap.aimPoints.size(); i++) {
        let angle = GetDirAngle(beatmap.aimPoints[i].pos, beatmap.aimPoints[i + 1].pos,
            beatmap.aimPoints[i + 2].pos)

        beatmap.angles.push(angle);
    }

    let oldAngle = beatmap.angles[0] - 2 * beatmap.angles[0];
    for (let angle of beatmap.angles) {
        let bonus = 0;
        let absd = Math.abs(angle);
        if (Math.sign(angle) == Math.sign(oldAngle)) {
            if (absd < 90)
                bonus = Math.sin(utils.DegToRad(absd) * 0.784 + 0.339837);
            else
                bonus = Math.sin(utils.DegToRad(absd));
        } else {
            if (absd < 90)
                bonus = Math.sin(utils.DegToRad(absd) * 0.536 + 0.72972);
            else
                bonus = Math.sin(utils.DegToRad(absd)) / 2;
        }

        beatmap.angleBonuses.push(bonus);
        oldAngle = angle;
    }
}

function bakeSliderData(beatmap) {
    for (let hitObject of beatmap.hitObjects) {
        if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Slider)) {
            switch (hitObject.curveType) {
                case 'B': {
                    let s = new slider.Slider(hitObject, false);
                    hitObject.lerpPoints = s.curve;
                    hitObject.ncurve = s.ncurve;
                    console.log('B:')
                    console.log(s.curve)
                    break;
                }
                case 'P': {
                    if (hitObject.curves.length == 2) {
                        let c = new cc.CircumscribedCircle(hitObject);
                        hitObject.lerpPoints = c.curve;
                        hitObject.ncurve = c.ncurve;
                        // console.log('P, circle:')
                        // console.log(c.curve)
                    } else {
                        let s = new slider.Slider(hitObject, false)
                        console.log('P, slider:')
                        hitObject.lerpPoints = s.curve;
                        hitObject.ncurve = s.ncurve
                        console.log(s.curve)
                    }
                    break;
                }
                case 'L': case 'C': {
                    let s = new slider.Slider(hitObject, true);
                    // console.log('L/C')
                    // console.log(s);
                    hitObject.lerpPoints = s.curve;
                    hitObject.ncurve = s.ncurve;
                    break;
                }
            }
            hitObject.endPoint = (hitObject.repeat % 2) ? hitObject.lerpPoints.slice(-1) : hitObject.lerpPoints[0];
        }
    }
}

module.exports = {
    prepareAimData, prepareTapData, prepareTimingPoints,
    calculatePressIntervals, calculateMovementData, gatherTapPatterns,
    gatherTargetPoints, gatherAimPoints, calculateAngles, bakeSliderData
}