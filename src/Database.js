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

        const docRef = doc(db, "racerlist", racerlistid);
        console.log('Connected to user database')
        const convertedList = arrayToObject(theRacerList)
        console.log('Converted list')
        await setDoc(docRef, convertedList)
            .then(() => {
                console.log('Participantlist was saved successfully');
            })
    }
    catch (e) {
        console.log(e);
    }
};


export const saveRaceToDataBase = async (theRace) => {
    try {
        console.log(theRace.id)
        console.log(theRace)
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
