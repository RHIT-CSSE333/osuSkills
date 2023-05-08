const utils = require("./utils.js")
const generic = require("./generic.js")
const globals = require("./globals.js")
const vector2d = require("./vector2d.js")
const fs = require('fs');
const readline = require('node:readline')

// import * as readline from 'node:readline'

function tokenize(str, tokens, delimiters = " ", trimEmpty) {
    let lastPos = 0;

    if(delimiters.length != 1) {
        console.error("DUDE WE'RE FUCKING RETARDED")
        return;
    }

    for(let i = 0; i < str.length; i++) {
        if(str.charAt(i) == delimiters) {
            tokens.push(trimEmpty ? str.substring(lastPos, i).trim() : 
                                    str.substring(lastPos,i))
            lastPos = i + 1;
        }

        if(i == str.length - 1) {
            tokens.push(str.substring(lastPos,i + 1))
        }
    }
}

function parseBeatmap(filepath, beatmap) {
    const FOUND = {
        FOUND_NONE: 0,
        FOUND_METADATA: 1,
        FOUND_DIFFICULTY: 2,
        FOUND_TIMINGPOINTS: 3,
        FOUND_HITOBJECTS: 4
    }

    let found = FOUND.FOUND_NONE

    const fileStream = fs.createReadStream(filepath);

    const r1 = readline.createInterface({
        input: fileStream,
        clrfDelay: Infinity
    });

    return new Promise((resolve, reject) => {
        let linesRead = 0;

        r1.on('line', (line) => {
            linesRead++;

            // console.log(line)
            
            line.replaceAll(/[\n\r]/g, "")
            if (line.substring(0, 10) == "[Metadata]") { found = FOUND.FOUND_METADATA;}
            else if (line.substring(0, 12) == "[Difficulty]") { found = FOUND.FOUND_DIFFICULTY; }
            else if (line.substring(0, 14) == "[TimingPoints]") { found = FOUND.FOUND_TIMINGPOINTS; }
            else if (line.substring(0, 12) == "[HitObjects]") { found = FOUND.FOUND_HITOBJECTS; }
            else if (found == FOUND.FOUND_METADATA) {

                let tokens = [];

                tokenize(line, tokens, ":", false)
                if (tokens[0] == "Artist") {
                    if (tokens.length > 1) {
                        beatmap.artist = tokens[1];
                    }
                }

                if (tokens[0] == "Title") {
                    // console.log('in found metadata')
                    if (tokens.length > 1) {
                        beatmap.title = tokens[1];
                    }
                }

                if (tokens[0] == "Version") {
                    if (tokens.length > 1) {
                        beatmap.version = tokens[1];
                    }
                }

                if (tokens[0] == "Creator") {
                    if (tokens.length > 1) {
                        beatmap.creator = tokens[1];
                    }
                }
            } else if (found == FOUND.FOUND_DIFFICULTY) {
                let tokens = [];
                // console.log(line)
                tokenize(line, tokens, ":", false)
                if (tokens[0] == "HPDrainRate") {
                    if (tokens.length > 1) {
                        beatmap.hp = Number(tokens[1]);
                        // console.log(`HP: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }

                if (tokens[0] == "CircleSize") {
                    if (tokens.length > 1) {
                        beatmap.cs = Number(tokens[1]);
                        // console.log(`CS: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }

                if (tokens[0] == "OverallDifficulty") {
                    if (tokens.length > 1) {
                        beatmap.od = Number(tokens[1]);
                        // console.log(`OD: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }

                if (tokens[0] == "ApproachRate") {
                    if (tokens.length > 1) {
                        beatmap.ar = Number(tokens[1]);
                        // console.log(`AR: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }

                if (tokens[0] == "SliderMultiplier") {
                    if (tokens.length > 1) {
                        beatmap.sm = Number(tokens[1]);
                        // console.log(`SM: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }

                if (tokens[0] == "SliderTickRate") {
                    if (tokens.length > 1) {
                        beatmap.st = Number(tokens[1]);
                        // console.log(`ST: ${Number(tokens[1])}, og: ${tokens[1]}`)
                        // console.log(tokens)
                    }
                }
            } else if (found == FOUND.FOUND_TIMINGPOINTS) {
                let tPoint = {};
                let tokens = [];
                tokenize(line, tokens, ",")

                if (tokens.length < 2) {
                    found = FOUND.FOUND_NONE;
                }

                tPoint.offset = Number(tokens[0])
                tPoint.beatInterval = Number(tokens[1]);

                if (tokens.length > 6) tPoint.inherited = Number(tokens[6]) == 0;
                else tPoint.inherited = 0;

                //old maps don't have meters
                if (tokens.length >= 3) tPoint.meter = Number(tokens[2]);
                else tPoint.meter = 4;

                if (tPoint.offset == -1 || tPoint.meter == -1) {
                    console.log(`${beatmap.name} has wrong timing point data`)
                    resolve(0);
                }

                beatmap.timingPoints.push(tPoint);
            } else if (found == FOUND.FOUND_HITOBJECTS) {
                let hitObject = new globals.HitObject()
                hitObject.pixelLength = 0;
                hitObject.repeat = 1;
                hitObject.ncurve = 0;
                hitObject.curves = [];
                hitObject.toRepeatTime = 0;

                let tokens = [];
                tokenize(line, tokens, ",");
                hitObject.pos.X = Number(tokens[0]);
                hitObject.pos.Y = Number(tokens[1]);
                hitObject.time = Number(tokens[2]);
                hitObject.type = Number(tokens[3]);
                hitObject.endTime = hitObject.time;

                if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Normal)) {
                    hitObject.endPoint = hitObject.pos;
                    beatmap.hitObjects.push(hitObject);
                    beatmap.timeMapper[hitObject.time] = beatmap.hitObjects.length - 1;
                } else if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Slider)) {
                    let sliderTokens = [];
                    tokenize(tokens[5], sliderTokens, "|");
                    hitObject.curveType = sliderTokens[0].charAt(0);

                    for (let i = 1; i < sliderTokens.length; i++) {
                        let curveTokens = [];
                        tokenize(sliderTokens[i], curveTokens, ":");

                        let curve = new vector2d.Vector2d(
                            Number(curveTokens[0]),
                            Number(curveTokens[1]));

                        hitObject.curves.push(curve);
                    }

                    hitObject.repeat = Number(tokens[6]);
                    hitObject.pixelLength = Number(tokens[7]);
                    beatmap.hitObjects.push(hitObject);

                    beatmap.timeMapper[hitObject.time] = beatmap.hitObjects.length - 1;
                } else if (utils.IsHitObjectType(hitObject.type, globals.HITOBJECTTYPE.Spinner)) {
                    beatmap.spinners++;
                }
            } else if (line.substring(0, 5) == "Mode:") {
                let mode = Number(line.substring(5))
                if (mode > 0) {
                    console.log(`mode invalid: ${mode}`);
                    resolve(0);
                }
            } else if (line.substring(0, 17) == "osu file format v")
                beatmap.format = Number(line.substring(17));
        })

        r1.on('close', (input) => {
            // console.log("done parsing: ")
            // console.log(beatmap)
            
            if (beatmap.format == -1)
                console.log(`Warning: Wrong osu file format version: ${beatmap.name}\n`);
            if (beatmap.hp == -1 || beatmap.cs == -1 || beatmap.od == -1 ||
                beatmap.sm == -1 || beatmap.st == -1) {
                console.log(`Wrong file format for beatmap: ${beatmap.name}\n`);
                resolve(0);
            }
            if (beatmap.ar == -1) beatmap.ar = beatmap.od;

            beatmap.name = `${beatmap.artist} - ${beatmap.title} (${beatmap.creator}) 
                        [${beatmap.version}]`
            console.log(`lines read: ${linesRead}`)
            resolve(1);
        })
    })
}

function getMapListFromFile(filepath, mapList) {
    const fileStream = fs.createReadStream(filepath);

    const r1 = readline.createInterface({
        input: fileStream,
        clrfDelay: Infinity
    });

    r1.on('line', (line) => {
        if (line.length == 0 || line.indexOf('//') == -1) return;

        mapList.push(line);
    })
}

module.exports = {
    tokenize, getMapListFromFile, parseBeatmap
}