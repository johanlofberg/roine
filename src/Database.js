import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";

const arrayToObject = (array) =>
    array.reduce((obj, item) => {
        obj[item.id] = item
        return obj
    }, {})

export async function loadAllRacerList() {
    const querySnapshot = await getDocs(collection(db, "racerlist"));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return newData;
}

export async function loadAllUsers() {
    const querySnapshot = await getDocs(collection(db, "racers"));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return newData;
}
export async function loadAllRaces() {
    const querySnapshot = await getDocs(collection(db, "races"));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return newData;
}

export async function loadSingleDocument(thecoll, id) {
    const docRef = doc(db, thecoll, id);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (error) {
        return null
    }
}

export async function loadSingleRacerListByID(id) {
    const docRef = doc(db, 'racerlist', id);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (error) {
        return null
    }
}

export async function loadSingleRacer(id) {
    const docRef = doc(db, 'racers', id);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.data()
    } catch (error) {
        console.log('loadfail')
        return null
    }
}

export async function loadSingleRaceById(id) {
    const docRef = doc(db, 'races', id);
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
        console.log(convertedList)
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

export const saveSeriesToDataBase = async (theSeries) => {
    try {
        const docRef = doc(db, "series", theSeries.id);
        await setDoc(docRef, theSeries)
            .then(() => {
                console.log('Series was been saved successfully');
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
        const keysToKeep = ['id', 'name', 'givenname', 'familyname', 'rfid', 'club', 'participatedin'];
        const filteredObject = {};
        for (const key of keysToKeep) {
            if (theUser.hasOwnProperty(key)) {
                filteredObject[key] = theUser[key];
            }
        }
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

export async function deleteUserByID(userID) {
    const userRef = doc(db, 'racers', userID)
    await deleteDoc(userRef).then((e) => { console.log('User ' + userID + ' has been deleted') })
}

export async function deleteRacerListByID(racerListID) {
    const userRef = doc(db, 'racerlist', racerListID)
    await deleteDoc(userRef).then((e) => {
        if (e) {
            console.log('User ' + racerListID + ' has been deleted,')
        } else { console.log('Failure to delete racer list ' + racerListID, e) }
    })
}

export async function deleteRaceByID(raceID) {
    const raceRef = doc(db, 'races', raceID)
    console.log(raceRef)
    await deleteDoc(raceRef).then((e) => { console.log('Race ' + raceID + ' has been deleted', e) })
}

export async function deleteRace(race) {
    const raceid = race.id
    const racerlistid = race.racerlistid
    const logid = race.logid

    const raceRef = doc(db, 'races', raceid)
    deleteDoc(raceRef).then(() => { console.log("Entire race has been deleted successfully.") })
    if (racerlistid) {
        const listRef = doc(db, 'racerlist', racerlistid)
        deleteDoc(listRef).then(() => { console.log("Entire racer list has been deleted successfully.") })
    }
    if (logid) {
        const logRef = doc(db, 'racelog', logid)
        deleteDoc(logRef).then(() => { console.log("Entire race log has been deleted successfully.") })
    }
    return true
}

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