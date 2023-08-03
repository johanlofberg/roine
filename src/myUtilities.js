export function createDefaultRaceClasses() {
    const class1 = { name: 'Bredd', laps: 3, active: true };
    const class2 = { name: 'Motion', laps: 2, active: true };
    const class3 = { name: 'Dam', laps: 3, active: true };
    return [class1, class2, class3]
}

export function uniqueID(length = 8) {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.random() * 62 | 0));
    return s;
}

export function normalizeRacer(racer,dodate = false) {
    
    let e = racer
    if (!e.hasOwnProperty('dns')) { e.dns = false }
    if (!e.hasOwnProperty('dnf')) { e.dnf = false }
    if (!e.hasOwnProperty('finished')) { e.finished = false }
    if (!e.hasOwnProperty('lapmarkings')) { e.lapmarkings = [] }
    if (!e.hasOwnProperty('next')) { e.next = 999 }
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
        return racers.map((e) => normalizeRacer(e))
    } else {return []}
};