const utils = require("./utils.js")
const generic = require("./generic.js")
const globals = require("./globals.js")
const vector2d = require("./vector2d.js")
const fs = require('fs');
const readline = require('node:readline')

// import * as readline from 'node:readline'

function tokenize(str, tokens, delimiters = " ", trimEmpty) {
    let pos, lastPos = 0

    while(true) {
        let curStr = str.substring(lastPos)
        pos = curStr.indexOf(delimiters)

        if(pos == str.length) {
            pos = str.length()

            if(pos != lastPos || !trimEmpty)
                tokens.push(str.substring(lastPos, pos))

            break;
        } else {
            if(pos != lastPos || !trimEmpty)
                tokens.push(str.substring(lastPos, pos))
        }

        lastPos = pos + 1;
    }
}

function parseBeatmap (filepath, beatmap) {
    const FOUND = {
        FOUND_NONE: 0,
        FOUND_METADATA: 1,
        FOUND_DIFFICULTY: 2,
        FOUND_TIMINGPOINTS: 3,
        FOUND_HITOBJECTS: 4
    }

    let bData;
    let found = FOUND.FOUND_NONE

    const fileStream = fs.createReadStream(filepath);

    const r1 = readline.createInterface({
        input: fileStream,
        clrfDelay: Infinity
    });

    r1.on('line', (line) => {
        line.replaceAll(/[\n\r]/g, "")
        if(!line.substring(0, 10) == "[Metadata]") found = FOUND.FOUND_METADATA;
        else if(!line.substring(0, 12) == "[Difficulty]") found = FOUND.FOUND_DIFFICULTY;
        else if(!line.substring(0,14) == "[TimingPoints]") found = FOUND.FOUND_TIMINGPOINTS;
        else if(!line.substring(0,12) == "[HitObjects]") found = FOUND_HITOBJECTS;
        if(found == FOUND.FOUND_METADATA) {
            let tokens = [];
            tokenize(line, tokens, ":", false)
            if(tokens[0] == "Artist") {
                if(tokens.length > 1) {
                    bData.artist = tokens[1];
                }
            }

            if(tokens[0] == "Title") {
                if(tokens.length > 1) {
                    bData.title = tokens[1];
                }
            }

            if(tokens[0] == "Version") {
                if(tokens.length > 1) {
                    bData.version = tokens[1];
                }
            }

            if(tokens[0] == "Creator") {
                if(tokens.length > 1) {
                    bData.creator = tokens[1];
                }
            }
        } else if(found == FOUND.FOUND_DIFFICULTY) {
            let tokens = [];
            tokenize(line, tokens, ":", false)
            if(tokens[0] == "HPDrainRate") {
                if(tokens.length > 1) {
                    bData.hp = Number(tokens[1]);
                }
            }

            if(tokens[0] == "CircleSize") {
                if(tokens.length > 1) {
                    bData.cs = Number(tokens[1]);
                }
            }

            if(tokens[0] == "OverallDifficulty") {
                if(tokens.length > 1) {
                    bData.od = Number(tokens[1]);
                }
            }

            if(tokens[0] == "ApproachRate") {
                if(tokens.length > 1) {
                    bData.ar = Number(tokens[1]);
                }
            }

            if(tokens[0] == "SliderMultiplier") {
                if(tokens.length > 1) {
                    bData.sm = Number(tokens[1]);
                }
            }

            if(tokens[0] == "SliderTickRate") {
                if(tokens.length > 1) {
                    bData.st = Number(tokens[1]);
                }
            }
        } else if(found == FOUND.FOUND_TIMINGPOINTS) {
            let tPoint = {};
            let tokens = [];
            tokenize(line, tokens, ",")

            if(tokens.length < 2) {
                found = FOUND.FOUND_NONE;
            }

            tPoint.offset = Number(tokens[0])
            tPoint.beatInterval = Number(tokens[1]);

            if(tokens.length > 6)   tPoint.inherited = Number(tokens[6]) == 0;
            else                    tPoint.inherited = 0;

            //old maps don't have meters
            if(tokens.length >= 3)  tPoint.meter = Number(tokens[2]);
            else                    tPoint.meter = 4;

            if(tPoint.offset == -1 || tPoint.meter == -1) {
                console.log(`${beatmap.name} has wrong timing point data`)
                return 0;
            }

            bData.timingPoints.push(tPoint);
        } else if(found == FOUND.FOUND_HITOBJECTS) {
            let hitObject = {};
            hitObject.pixelLength = 0;
            hitObject.repeat = 1;
            hitObject.ncurve = 0;
            hitObject.curves = [];
            hitObject.toRepeatTime = 0;

            let tokens = [];
            tokenize(line, tokens, ",");
            hitObject.pos.X = Number(tokens[0]);
            hitObject.pos.Y = Number(tokens[1]);
            hitObject.time  = Number(tokens[2]);
            hitObject.type  = Number(tokens[3]);
            hitObject.endTime = hitObject.time;

            if(utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Normal)) {
                hitObject.endPoint = hitObject.pos;
                bData.hitObjects.push(hitObject);
                bData.timeMapper[hitObject.time] = bData.hitObjects.length - 1;
            } else if(utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Slider)) {
                let sliderTokens = [];
                tokenize(tokens[5], sliderTokens, "|");
                hitObject.curveType = sliderTokens[0].charAt(0);

                for(let i = 1; i < sliderTokens.length; i++) {
                    let curveTokens = [];
                    tokenize(sliderTokens[i], curveTokens, ":");

                    let curve = new vector2d.Vector2d(
                            Number(curveTokens[0]),
                            Number(curveTokens[1]));

                    hitObject.curves.push(curve);
                }

                hitObject.repeat = Number(tokens[6]);
                hitObject.pixelLength = Number(tokens[7]);
                bData.hitObjects.push(hitObject);

                bData.timeMapper[hitObject.time] = bdata.Hitobjects.length - 1;
            } else if(utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Spinner)) {
                bData.spinners++;
            }
        } else if(line.substring(0,5) == "Mode:") {
            let mode = Number(line.substring(5))
            if(mode > 0) return 0;
        } else if(line.substring(0,17) == "osu file format v")
            bData.format = Number(line.substring(17));
    })

    r1.on('close', (input) => {
        if(bData.format == -1)
            console.log(`Warning: Wrong osu file format version: ${beatmap.name}\n`);
        if(bData.hp == -1 || bData.cs == -1 || bData.od == -1 ||
            bData.sm == -1 || bData.st == -1) {
            console.log(`Wrong file format for beatmap: ${beatmap.name}\n`);
            return 0;
        }
        if(bData.ar == -1) bData.ar = bData.od;

        beatmap = bData;
        beatmap.name = `${beatmap.artist} - ${beatmap.title} (${beatmap.creator}) 
                        [${beatmap.version}]`
        return 1;     
    })
}

function getMapListFromFile(filepath, mapList) {
    const fileStream = fs.createReadStream(filepath);

    const r1 = readline.createInterface({
        input: fileStream,
        clrfDelay: Infinity
    });

    r1.on('line', (line) => {
        if(line.length == 0 || line.indexOf('//') == -1) return;
        
        mapList.push(line);
    })
}

module.exports = {
    tokenize, getMapListFromFile, parseBeatmap
}