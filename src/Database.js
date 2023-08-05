import { db } from './firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";


const arrayToObject = (array) =>
    array.reduce((obj, item) => {
        obj[item.id] = item
        return obj
    }, {})

export async function loadSingleDocument(thecoll, id) {
    const docRef = doc(db, thecoll, id);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (error) {
        return null
    }
}

export const saveRacerListToDataBase = async (theRacerList, racerlistid) => {
    try {

        console.log('Saving racer list ', racerlistid)
        const docRef = doc(db, "racerlist", racerlistid);
        console.log('Connected to racer list database')
        const convertedList = arrayToObject(theRacerList)
        console.log('Converted list')
        await setDoc(docRef, convertedList)
            .then(() => {
                console.log('Racer list was saved successfully');
            })
    }
    catch (e) {
        console.log(e);
    }
};

export const saveRaceLogToDataBase = async (theRaceLog, racelogid) => {
    try {
        console.log('Saving race log ', racelogid)
        const docRef = doc(db, "racelog", racelogid);
        console.log('Connected to race log database')
        const convertedList = arrayToObject(theRaceLog)
        console.log('Converted list')
        await setDoc(docRef, convertedList)
            .then(() => {
                console.log('Race log was saved successfully');
            })
    }
    catch (e) {
        console.log(e);
    }
};

export const saveRaceToDataBase = async (theRace) => {
    try {
        const docRef = doc(db, "races", theRace.id);
        await setDoc(docRef, theRace)
            .then(() => {
                console.log('Race was been saved successfully');
            })
        return true
    }
    catch (e) {
        console.log(e);
        return false
    }
};

export const saveUserToDataBase = async (theUser) => {
    try {
        // Only relevant stuff is saved
        const keysToKeep = ['id', 'name', 'rfid', 'club', 'participatedin'];
        const filteredObject = {};
        for (const key of keysToKeep) {
            if (theUser.hasOwnProperty(key)) {
                filteredObject[key] = theUser[key];
            }
        }
        console.log(filteredObject)
        const docRef = doc(db, "racers", filteredObject.id);
        await setDoc(docRef, filteredObject)
            .then(() => {
                  console.log('User saved successfully');
            })
        return true
    }
    catch (e) {
        console.log(e);
        return false
    }
};

/*
function loadFromLocalStorage() {
    return //FIXME
    const savedracers = localStorage.getItem("racers");
    const savedlogLaps = localStorage.getItem("logLaps");
    const raceSettings = localStorage.getItem("raceSettings");
    let parsedracers = JSON.parse(savedracers);
    let parsedlogLaps = JSON.parse(savedlogLaps);
    const parsedraceSettings = JSON.parse(raceSettings);



    parsedlogLaps.map((logItem) => (logItem.time = new Date(logItem.time)))
    for (let i = 0; i < parsedracers.length; i++) {
        if (parsedracers[i].lapmarkings.length > 0) {
            parsedracers[i].lapmarkings.map((log) => (log.time = new Date(log.time)))
        }
    }

    //parsedracers.map((racer) => {return (racer.lapmarkings.length> 0 ? racer.lapmarkings.map( (log) => (log.time = new Date(log.time)))

    setAllCompetitors(parsedracers)
    props.setlogLaps(parsedlogLaps)
    setraceSetup(parsedraceSettings)
}
function saveToLocalStorage() {
    return //FIXME
    localStorage.setItem("logLaps", JSON.stringify(props.logLaps));
    localStorage.setItem("racers", JSON.stringify(allCompetitors));
    localStorage.setItem("raceSettings", JSON.stringify(raceSetup));
}*/