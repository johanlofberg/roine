import {createDefaultRaceClasses} from './myUtilities'

export default function Createexamplerace() {

    const classes = createDefaultRaceClasses()    
    const theRace = {
        id: '',
        name: 'Testtävling',
        classes: classes,
        sport: '',
        type: 'Lap',
        start: 'Individual',        
        date: '',
        state: 'planning', 
        datecreated: '',
        dateedited: '',        
        racerlistid: '',     
        racelogid: '',
        series: [],
    };
    return theRace;
}