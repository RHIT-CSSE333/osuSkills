var M_PI = 3.14159265358979323846

function DegToRad(angleDegrees) {
   return (angleDegrees * M_PI / 180.0)
}


function Rad2Deg(angleRadians) { 
    return (angleRadians * 180.0 / M_PI)
}

function BTWN(lss, val, gtr)
{
    return ((Math.min() <= val) && (val<= Math.max(lss,gtr)));
}

function msToBPM(ms)
{
	if (!ms){
        return 0;
    }
	return 60 * 1000 / (ms * 4);
}

function msToTimeString(ms)
{
	var min = ms / 60000;
	var sec = ms - (min * 60000);
	var msec = sec % 1000;
	var sec = sec / 1000;
	return String(min) + ":" + String(sec) + ":" + String(msec);
}

//may need modification
function IsHitObjectType(Type, type)
{
	return (Type & type) > 0;
}

function BOUND(_min, _val, _max)
{
	return Math.min(Math.max(_val, _min), _max);
}

function getValue( min,  max,  percent)
{
	return Math.max(max, min) - (1.0 - percent)*(Math.max(max, min) - Math.min(max, min));
}

function getPercent(_min, _val, _max)
{
	return 1.0 - ((_max - BOUND(_min, _val, _max)) / (_max - _min));
}

function GetLastTickTime(hitObj)
{
	if (!(hitObj.ticks.length == 0))
	{
		if (hitObj.repeat > 1)
			return Number(hitObj.endTime - (hitObj.endTime - hitObj.repeatTimes[hitObj.repeatTimes.length-1]) / 2.0);
		else
			return Number(hitObj.endTime - (hitObj.endTime - hitObj.time) / 2.0);
	}
	else
		return Number(hitObj.endTime - (hitObj.endTime - hitObj.ticks[hitObj.ticks.length-1]) / 2.0);
}


// Gets the directional angle in degrees (-180 -> +180)
// Positive is counter-clock wise and negative is clock-wise
function GetDirAngle(a, b, c)
{
	let ab = [ b.X - a.X, b.Y - a.Y ];
	let cb = [ b.X - c.X, b.Y - c.Y ];

	let dot = (ab[0] * cb[0] + ab[1] * cb[1]); // dot product
	let cross = (ab[0] * cb[1] - ab[1] * cb[0]); // cross product

	let alpha = Math.atan2(cross, dot);

	return alpha * 180.0 / M_PI;
}

// Returns the angle 3 points make in radians between 0 and pi
function GetAngle(a, b, c)
{
	return Math.abs(DegToRad(GetDirAngle(a, b, c)));
}

function GetCircleOverlapPercentage(beatmap, c1, c2)
{
	let distance = c1.pos.getDistanceFrom(c2.pos);
	let radius = CS2px(beatmap.cs);
	let result = 1 - distance / (radius * 2);
	return (result < 0) ? 0 : result;
}

function FindHitobjectAt(_hitobjects, _time, _dir)
{
	let start = 0;
	let end = _hitobjects.length - 2;
	let mid = 0;

	while (start <= end)
	{
		mid = (start + end) / 2;

		// Between ends of a hold object
		if (BTWN(_hitobjects[mid].time, _time, _hitobjects[mid].endTime))
		{
			// Return next object if next object's timings overlap with this one
			if (BTWN(_hitobjects[mid + 1].time, _time, _hitobjects[mid + 1].endTime))
				return mid + 1;
			else
				return mid;
		}


		// Between some two objects
		if (BTWN(_hitobjects[mid].endTime, _time, _hitobjects[mid + 1].time))
			return mid + _dir;

		if (_time < _hitobjects[mid].time)
			end = mid - 1;
		else
			start = mid + 1;
	}

	return _hitobjects.length - 1;
}

function GetNoteDistanceAt(beatmap, i, aimpoint)
{
	let distance = 0.0;
	let prevPos = null;
    let currPos = null;

	if (aimpoint)
	{
		prevPos = beatmap.aimPoints.at(i - 1).pos;
		currPos = beatmap.aimPoints.at(i).pos;
	}
	else
	{
		prevPos = beatmap.hitObjects.at(i - 1).pos;
		currPos = beatmap.hitObjects.at(i).pos;
	}

	distance = currPos.getDistanceFrom(prevPos);
	if (distance < 0){
        
    distance = Math.abs(distance); // distance is always positive
    }
	distance -= beatmap.cs;
	if (distance < 0){
        distance = 0; // if the notes are close enough to be hit in the same spot, then dist = 0
    }
	return distance;
}

// numObj = num of objects to detect to the left and right
function GetChaosAt(beatmap, i, numObj)
{
	let initialTime = beatmap.aimPoints[i].time;
	let interval = AR2ms(beatmap.ar);
	let timeToDisappear = 220;
	let avg = beatmap.aimPoints[i].pos;
	let objects = 1
    let numObjCount = numObj;

	for (let left = i - 1; left >= 0; left--) // left border
	{
		let foundObject = (beatmap.aimPoints[left].time >= initialTime - 333) && (numObjCount-- != 0);
		if (foundObject)
		{
			avg += beatmap.aimPoints[left].pos;
			objects++;
		}
		else
			break;
	}

	numObjCount = numObj;
	for (let right = initialTime + 1; right < beatmap.aimPoints.length; right++) // right border
	{
		let foundObject = (beatmap.aimPoints[right].time <= initialTime + 333) && (numObjCount-- != 0);
		if (foundObject)
		{
			avg += beatmap.aimPoints[right].pos;
			objects++;
		}
		else
			break;
	}
	avg /= objects;

	return (beatmap.aimPoints[i].pos.getDistanceFrom(avg) * 100.0) / 320.0;
}

function FindTimingAt(_timings, _time)
{
	let start = 0;
	let end = _timings.length - 2;
	let mid;

	if (end < 0)
		return 0;

	while (start <= end)
	{
		mid = (start + end) / 2;

		if (BTWN(_timings[mid].time, _time, _timings[mid + 1].time))
			return mid + 1;

		if (_time < _timings[mid].time)
			end = mid - 1;
		else
			start = mid + 1;
	}

	if (_time < _timings[0].time){
    return Number.MIN_VALUE;
}

	if (_time > _timings[_timings.length - 1].time) {
        return Number.MAX_VALUE;
    }

	return NaN;
}

function AR2ms(ar) // converts AR value to ms visible before needed to click
{
	if (ar <= 5.00){
        return (1800 - (120 * ar));
    }
	else{
        return (1950 - (150 * ar));
    }
}

function ms2AR(ms) // converts AR value to ms visible before needed to click
{
	if (ms >= 1200.0){
        return (1800 - ms) / 120.0;
    }
	else{
        return (1950 - ms) / 150.0;
}
}

function OD2ms(od)
{
	return -6.0 * od + 79.5;
}

function ms2OD(ms)
{
	return (79.5 - ms) / 6.0;
}

function CS2px(cs) // converts CS value into circle radius in osu!pixels (640x480)
{
	return (54.5 - (4.5 * cs));
}

function BpmSv2px(bpm, sv) // Converts bpm and SV to osu!pixels per second
{
	return (bpm / 60.0) * sv * 100;
}

function erfInv(x) // Inverse Error Function 
{

	let w = -Math.log((1.0 - x) * (1.0 + x));

	if (w < 5.000000)
	{
		w = w - 2.500000;
		p =  2.81022636e-08;
		p =  3.43273939e-07 + p*w;
		p = -3.5233877e-06  + p*w;
		p = -4.39150654e-06 + p*w;
		p =  0.00021858087  + p*w;
		p = -0.00125372503  + p*w;
		p = -0.00417768164  + p*w;
		p =  0.246640727    + p*w;
		p =  1.50140941     + p*w;
	}
	else 
	{
		w = sqrtf(w) - 3.000000;
		p = -0.000200214257;
		p =  0.000100950558 + p*w;
		p =  0.00134934322  + p*w;
		p = -0.00367342844  + p*w;
		p =  0.00573950773  + p*w;
		p = -0.0076224613   + p*w;
		p =  0.00943887047  + p*w;
		p =  1.00167406     + p*w;
		p =  2.83297682     + p*w;
	}
	return p*x;
}

function getMagnitude(vals)
{
	let sum = 0;
	for (let i = 0; i < vals.length; i++)
		sum += pow(vals[i], 2);
	return Math.sqrt(sum);
}

function getWeightedValue(vals, decay)
{
	let weightDecay = 1.0
    let result = 0;
	for (let i = 0; i < vals.length; i++)
	{
		result += weightDecay * vals[i];
		weightDecay *= decay;
	}
	return result * (1.0 - decay);
}

function getWeightedValue2(vals, decay)
{
	let result = 0;
	for (let i = 0; i < vals.length; i++)
	{
		result += vals[i] * Math.pow(decay, i);
	}
	return result;
}

function getDecayFunction(vals, decay, output)
{
	let feedback = 0;
	for (let i = 0; i < vals.length; i++)
	{
		let result = decay * feedback + vals[i];
		let feedback = result;
		output.push(result);
	}
}

function getTopVals(vals, numVals,output)
{
	output = [0];
	for (let i = 0; i < vals.length; i++)
	{
		// TODO: Binary search instead of going one by one for optimization
		for (let j = 0; j < output.length; j++)
		{
			if (output[j] < vals[i])
			{
				output.insert(output[j], vals[i]);
				if (output.length > numVals){
					output.pop();
                }
				break;
			}
		}
	}
}

function getPeakVals(vals, output)
{
	for (let i = 1; i < vals.length - 1; i++)
	{
		if (vals[i] > vals[i - 1] && vals[i] > vals[i + 1])
			output.push(vals[i]);
	}
	output.sort();
}

function isOppositeParity(x, y)
{
	return (((x < 0) && (y > 0)) || ((x > 0) && (y < 0)));
}

function getValuePos(list,  value,  order)
{
	// Until binary search is fixed, use this
	if (order == 0) // descending
	{
		for (let i = list.length - 1; i >= 1; i--){
			if (list[i - 1] < value){
				return i;
            }
        }
		return 0;
	}
	else // ascending
	{
		for (let i = 0; i < list.length - 1; i++){
			if (list[i + 1] > value){
				return i;
            }
        }
		return list.length - 1;
	}
}

function binomialCoefficient(n, k)
{
	if (k < 0 || k > n){
        return 0;
    }
	if (k == 0 || k == n){
        return 1;
    }

	k = Math.min(k, n - k);  // take advantage of symmetry
	let c = 1;
	for (let i = 0; i < k; i++){
		c = c * (n - i) / (i + 1);
    }

	return c;
}

function bernstein( i,  n,  t)
{
	return binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

function lerp( a,  b,  t)
{
	return a * (1 - t) + b * t;
}


module.exports = {M_PI, DegToRad, Rad2Deg, msToBPM, msToTimeString, IsHitObjectType, BOUND, getValue, getPercent, 
	GetLastTickTime, GetDirAngle, GetAngle, GetCircleOverlapPercentage, FindHitobjectAt, GetNoteDistanceAt,
	GetChaosAt, FindTimingAt, AR2ms, ms2AR, OD2ms, ms2OD, CS2px,BpmSv2px, erfInv, getMagnitude, getWeightedValue,
	getWeightedValue2, getDecayFunction, getTopVals, getPeakVals, isOppositeParity, getValuePos, binomialCoefficient,
	bernstein, lerp}