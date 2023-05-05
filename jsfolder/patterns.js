const utils = require('./utils.js')
const globals = require('./globals.js');
const slider = require('./slider.js')
const vector2d = require('./vector2d.js')

function getVelocity(obj) {
    let period = obj.endTime - obj.time;
    let length = obj.pixelLength;

    return length / period;
}

function getPattern(obj, time, index, CS, quant) {
    let circle = obj[index];
    let points = [];

    if(utils.IsHitObjectType(circle.type, globals.HITOBJECTTYPE.Slider)) {
        let curr_time = time, prev_time = time;

        let parts = circle.pixelLength / utils.CS2px(CS);
        let timeDelta = (circle.endTime - circle.time) / parts;
        let pos = slider.GetSliderPos(circle, time);

        if(!utils.BTWN(circle.time, curr_time, circle.endTime))
            curr_time = circle.time;

        points.push(slider.getPointAt(circle, curr_time))
        curr_time -= timeDelta;

        while(curr_time >= circle.time && points.length < quant) {
            let dist = 0;

            while(dist < utils.CS2px(CS) && curr_time >= circle.time && points.length < quant) {
                let prevSliderPos = slider.GetSliderPos(circle, Math.floor(prev_time));
                let currSliderPos = slider.GetSliderPos(circle, Math.floor(curr_time));

                dist = prevSliderPos.getDistanceFrom(currSliderPos);
                curr_time -= timeDelta;
            }

            let prevPos = new vector2d.Vector2d(points.slice(-1)[0], points.slice(-1)[1])
            let newPros = slider.GetSliderPos(circle, Math.floor(curr_time + timeDelta));
            if(prevPos.getDistanceFrom(newPos) >= utils.CS2px(CS)) {
                points.push(getPointAt(obj[index], Math.floor(curr_time + timeDelta)));

                prev_time = curr_time;
            }
        }
    } else {
        let pos = circle.pos;
        points.push([pos.X, pos.Y, circle.time, 0])
    }

    if(points.length < quant && index > 0) {
        let pattern = getPattern(obj, obj[index - 1], index - 1, CS, quant - points.length);

        points.concat(pattern);
    }
    return points;
}

function getHitcircleAt(hitcircles, time) {
    let start = 0;
    let end = hitcircles.length - 2;
    let mid;

    while(start <= end) {
        mid = (start + end) / 2;
        if(utils.BTWN(hitcircles[mid].time, time, hitcircles[mid + 1].time - 1))
            return mid;
        else if (time < hitcircles[mid].time)
            end = mid - 1;
        else start = mid + 1;
    }

    return -1;
}

function getVisibilityTimes(obj, AR, hidden, opacityStart, opacityEnd) {
    let preampTime = obj.time - utils.AR2ms(AR);
    let times = [];

    if(hidden) {
        let fadeinDuration = 0.4 * utils.AR2ms(AR);
        let fadeinTimeEnd = preampTime + fadeinDuration;

        times[0] = Math.floor(utils.getValue(preampTime, fadeinTimeEnd, opacityStart));

        if(utils.IsHitObjectType(obj.type, glboals.HITOBJECTTYPE.Slider)) {
            let fadeoutDuration = (obj.endTime - fadeinTimeEnd);
            let fadeoutTimeEnd = fadeinTimeEnd + fadeoutDuration;
            times[1] = Math.floor(utils.getValue(fadeinTimeEnd, fadeoutTimeEnd, 1.0 - opacityEnd))
            
            return times;
        } else {
            let fadeoutDuration = 0.7 * (obj.time - fadeinTimeEnd);
            let fadeoutTimeEnd = fadeinTimeEnd + fadeoutDuration;
            times[1] = Math.floor(utils.getValue(fadeinTimeEnd, fadeoutTimeEnd, 1.0 - opacityStart))
        }
    } else {
        let fadeinDuration = Math.min(utils.AR2ms(AR), 400);
        let fadeinTimeEnd = preampTime + fadeinDuration;

        times[0] = Math.floor(utils.getValue(preampTime, fadeinTimeEnd, opacityStart));

        if(utils.IsHitObjectType(obj.type, globals.HITOBJECTTYPE.Slider)) {
            times[1] = obj.endTime;
            return times;
        } else {
            times[1] = obj.time;
            return times;
        }
    }
}

module.exports = {
    getVelocity, getPattern, getHitcircleAt, getVisibilityTimes
}