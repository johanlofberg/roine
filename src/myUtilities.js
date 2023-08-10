import { SignalCellularNullOutlined } from '@mui/icons-material';
import Papa from 'papaparse';

export function proposeCSVDownload(array, name) {
    var csv = Papa.unparse(array);
    console.log(csv)
    var csvData = new Blob([csv], { type: 'text/csv;' });
    var csvURL = window.URL.createObjectURL(csvData);
    var testLink = document.createElement('a');
    testLink.href = csvURL;
    testLink.setAttribute('test', name + '.csv');
    testLink.click();
}

export function createDefaultRaceClasses() {
    const class1 = { name: 'Bredd', laps: 3, active: true };
    const class2 = { name: 'Motion', laps: 2, active: true };
    const class3 = { name: 'Dam', laps: 3, active: true };
    return [class1, class2, class3]
}

export function deepClone(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj; // Return primitive values and null as is
    }

    if (obj instanceof Date) {
        return new Date(obj); // Return a new Date object for Date instances
    }

    if (Array.isArray(obj)) {
        // Clone arrays and their nested elements
        return obj.map((item) => deepClone(item));
    }

    // Clone objects and their nested properties
    const clonedObj = {};
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

export function uniqueID(length = 8) {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 62 | 0));
    return s;
}


function check(obj, key, defaultValue) {
    if (!obj[key]) {
        obj[key] = defaultValue;
    }
}

export function normalizeRace(Race) {
    if (Race) {
        check(Race, 'logid', '')
        check(Race, 'eventorganizer', '')
        check(Race, 'racerlistid', '')
        check(Race, 'seriesid', '')
        check(Race, 'results', [])
        check(Race, 'location', '')
    }
    return Race
};

export function normalizeRacer(racer, dodate = false) {

    let e = racer
    if (!e.hasOwnProperty('familyname')) { e.familyname = '' }
    if (!e.hasOwnProperty('givenname')) { e.givenname = '' }
    if (!e.hasOwnProperty('name')) { e.givenname = e.givenname + ' ' + e.familyname }
    if (!e.hasOwnProperty('id')) { e.id = uniqueID() }
    if (!e.hasOwnProperty('rfid')) { e.rfid = '' }
    if (!e.hasOwnProperty('dns')) { e.dns = false }
    if (!e.hasOwnProperty('dnf')) { e.dnf = false }
    if (!e.hasOwnProperty('finished')) { e.finished = false }
    if (!e.hasOwnProperty('lapmarkings')) { e.lapmarkings = [] }
    if (!e.hasOwnProperty('next')) { e.next = 999 }
    if (!e.hasOwnProperty('participatedin')) { e.participatedin = [] }

    if (dodate) {
        console.log('Normalizing racer dates')
        for (let index = 0; index < e.lapmarkings.length; index++) {
            e.lapmarkings[index].time = e.lapmarkings[index].time.toDate()
            console.log(e)
        }
    }
    return e
};

export function normalizeRacers(racers) {
    if (racers) {
        console.log(racers)
        return racers.map((e) => normalizeRacer(e))
    } else { return [] }
};

export function createProfileLink(id) { return `/profile/${id}` }
export function createResultsLink(id) { return `/result/${id}` }
export function createSeriesLink(id) { return `/createserie/${id}` }

//export function computePlacings(race,racerlist)

export function isValidSerial(serial) {
    // Remove any whitespace and convert the serial to uppercase
    const formattedSerial = serial.replace(/\s/g, '').toUpperCase();

    // Check if the serial number has the correct format (xx:yy:zz:uu:vv:ww)
    if (!/^[0-9A-F]{2}(:[0-9A-F]{2}){3,5}$/.test(formattedSerial)) {
        return false;
    }
    return true;
};

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function matlabsort(arr) {
    const indices = [...arr.keys()];
    const sorted = [...arr].sort((a, b) => b - a)
    const sortedIndices = indices.sort((a, b) => arr[b] - arr[a]);
    return [sorted, sortedIndices]
}


export function generateNamedResults(resultsClass, racerList) {
    let results = []
    console.log('Entered', resultsClass, racerList)
    resultsClass.results.forEach((element, index) => {
        console.log(element)
        let j = racerList.findIndex((racer) => racer.id === element)
        if (j !== -1) {
            results = [...results, {
                id: racerList[j].id,
                name: racerList[j].name,
                place: index + 1
            }]
        }
    })
    return results
}


export function computeRacePlace(race, racerID) {
    let place = null
    let className = null
    //console.log('detailed')
    console.log(racerID)
    console.log(race.results)
    for (let classes = 0; classes < race.results.length; classes++) {
      //  console.log(race.results[classes])       
        place = race.results[classes].results.indexOf(racerID)            
        if (place !== -1) {
            place += 1
            className = race.results[classes].class
            console.log([place, className])
            return [place, className]
                        
        }
    }
}
