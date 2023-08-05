import { Fragment, useState, useEffect } from 'react';
import { getFirestore, collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { Button } from '@mui/material';
import CardSingleRace from './CardSingleRace';

const ListRacesAsCards = (props) => {

    const [raceList, setRaceList] = useState([])
    const [needsReload,setNeedsReload] = useState(false)

    useEffect(() => { console.log('Useeffect in racelistcards');fetchRaces() }, [db,needsReload]);

    const fetchRaces = async () => {
        await getDocs(collection(db, "races"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log('Loaded races!');
                setRaceList(newData)
                console.log(newData);
                setNeedsReload(false)
            }
            )
    }

    return (
        <Fragment key='racelist'>
            {raceList.map((aRace, index) => { return <CardSingleRace needsReload = {needsReload} setNeedsReload={setNeedsReload} racers={props.racers} setRacers={props.setRacers} raceSettings={props.raceSettings} setRaceSettings={props.setRaceSettings} index={index} race={aRace} /> })}
        </Fragment>
    )
}

export default ListRacesAsCards;