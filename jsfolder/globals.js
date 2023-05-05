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

module.exports = {
    MODS, HITOBJECTTYPE, CURVETYPE, AIM_POINT_TYPES
}