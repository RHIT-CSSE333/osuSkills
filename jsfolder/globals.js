const { Vector2d } = require("./vector2d");

const MODS = {
    NF: 1,
    EZ: 2,
    HD: 8,
    HR: 16,
    SD: 32,
    DT: 64,
    RL: 128,
    HT: 256,
    FL: 1024,
    AU: 2048,
    SO: 4096,
    AP: 8192
}

const HITOBJECTTYPE = {
    Normal: 1,
    Slider: 2,
    NewCombo: 4,
    NormalNewcombo: 5,
    SliderNewCombo: 6,
    Spinner: 8,
    ColorHax: 112,
    HOLD: 128,
    ManiaLong: 128
}

const CURVETYPE = {
    PerfectCurve: 'P',
    BezierCurve: 'B',
    LinearCurve: 'L',
    CatmullCurve: 'C'
}

const AIM_POINT_TYPES = {
    AIM_POINT_NONE: 0,
    AIM_POINT_CIRCLE: 1,
    AIM_POINT_SLIDER: 2,
    AIM_POINT_SLIDERREVERSE: 3,
    AIM_POINT_SLIDEREND: 4
}

class Beatmap {
    constructor() {
        this.format = -1;
        this.artist = "";
        this.title = "";
        this.version = "";
        this.creator = "";
        this.name = "";
        this.hp = -1;
        this.cs = -1;
        this.od = -1;
        this.ar = -1;
        this.sm = -1;
        this.st = -1;
        this.bpmMin = -1;
        this.bpmMax = -1;
        this.timingPoints = [];
        this.hitObjects = [];
        this.aimPoints = [];
        this.targetPoints = [];
        this.spinners = 0;
        this.timeMapper = {};
        this.velocities = {
            X: [],
            Y: [],
            Xchange: [],
            Ychange: []
        };
        this.distances = [];
        this.aimStrains = [];
        this.angleStrains = [];
        this.angles = [];
        this.angleBonuses = [];
        this.reactionTimes = [];
        this.pressIntervals = [];
        this.tapStrains = [];
        this.streams = {};
        this.bursts = {};
        this.skills = {
            agility: 0,
            tenacity: 0,
            stamina: 0,
            accuracy: 0,
            precision: 0,
            reaction: 0,
            memory: 0,
            reading: 0
        };
        this.mods = 0;
        this.modsString = "";
        this.patterns = {
            compressedStream: [],
            stream: [],
            stack: []
        }

    }
}

class HitObject {
    constructor() {
        this.pos = new Vector2d();
        this.time = -1;
        this.type = -1;
        
        this.curveType = null;
        this.curves = [];
        this.lerpPoints = [];
        this.ncurve = 0;
        this.repeat = 0;
        this.repeatTimes = [];
        this.pixelLength = 0;
        this.endTime = 0;
        this.toRepeatTime = 0;
        this.endPoint = null;
        this.ticks = [];
    }
}

class AimPoint {
    constructor(time, pos, type) {
        this.pos = pos;
        this.time = time;
        this.type = type;
    }
}

module.exports = {
    MODS, HITOBJECTTYPE, CURVETYPE, AIM_POINT_TYPES, Beatmap, HitObject, AimPoint
}