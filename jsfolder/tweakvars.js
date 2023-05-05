const fs = require('fs');
const config = "config.cfg";
let VARS = {
    "Stamina" : {"Decay": 0.94,
                 "Mult": 0.8,
                 "Pow": 0.1,
                 "DecayMax": 0,
                 "Scale": 7000,
                "LargestInterval": 50550.0,
                 "TotalMult": 4.6,
                 "TotalPow": 0.75},
    "Tenacity" : {"IntervalMult": 0.37,
                  "IntervalMult2": 13000,
                  "IntervalPow": 0.143,
                  "LengthDivisor": 0.08,
                  "LengthMult": 15.0,
                  "TotalMult": 5,
                  "TotalPow": 0.75},
    "Agility" : {
                "DistMult": 1,
                "DistPow": 1,
                "DistDivisor": 2,
                "TimeMult": 0.001,
                "TimePow": 1.04,
                "StrainDecay": 16.9201,
                "AngleMult": 4,
                "SliderStrainDecay": 2,
                "Weighting": 0.78,
                "TotalMult": 30,
                "TotalPow": 0.28
    },
    "Accuracy": {
               "AccScale": 0.01,
               "VerScale": 0.3
    },
    "Precision": {
               "AgilityLimit": 700,
               "AgilityPow": 0.1,
               "AgilitySubtract": 0.995462,
               "TotalMult": 20,
               "TotalPow": 2
    },
    "Memory": {
        "FollowpointsNerf": 0.8,
        "SliderBuff": 1.1,
        "TotalMult": 205,
        "TotalPow": 0.3
    },
    "Reaction": {
        "AvgWeighting": 0.7,
        "PatternDamping": 0.15,
        "FadeinPercent": 0.1,
        "VerScale": 12.2,
        "CurveExp": 0.64
    }
   }

function GetVar(skill, name)
{
	if (!(skill in VARS))
	{
		console.log("Algorithm variable loader: Wrong skill - ");
		return 0;
	}
	else
	{
		if (!(name in VARS[skill]))
		{
			console.log("Algorithm variable loader: Wrong variable name - ");
			return 0;
		}
		else
		{
			return VARS[skill][name];
		}
	}	
}

module.exports = {
    GetVar
}