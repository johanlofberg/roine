import { Fragment, useState, useEffect } from 'react';
import { getFirestore, collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { Button } from '@mui/material';
import CardSingleRace from './CardSingleRace';

const ListRacesAsCards = (props) => {

    const [raceList, setRaceList] = useState([])

    useEffect(() => {fetchRaces()}, [db]);

    const fetchRaces = async () => {
        await getDocs(collection(db, "races"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log('Loaded races!');
                setRaceList(newData)
                console.log(newData);
            })
    }

    return (
        <Fragment key='racelist'>        
            {raceList.map((aRace,index) => {return <CardSingleRace racers={props.racers} setRacers={props.setRacers} raceSettings={props.raceSettings} setRaceSettings={props.setRaceSettings} index = {index} race = {aRace}/>})}
        </Fragment>
    )
}

export default ListRacesAsCards;