import { Grid } from '@mui/material';
import { collection, getDocs } from "firebase/firestore";
import { Fragment, useEffect, useState } from 'react';
import CardSingleRaceNew from './CardSingleRaceNew';
import { db } from './firebase';

const ListRacesAsCards = (props) => {

    const [allAvailableRaces, setAllAvailableRaces] = useState([])
    const [needsReload,setNeedsReload] = useState(false)

    useEffect(() => { console.log('Useeffect in racelistcards');fetchRaces() }, [db,needsReload]);

    const fetchRaces = async () => {
        await getDocs(collection(db, "races"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log('Loaded races!');
                setAllAvailableRaces(newData)
                console.log(newData);
                setNeedsReload(false)
            }
            )
    }

    return (
        <>
            <Grid container paddingTop={'1rem'} spacing={1} justifyContent="left" alignItems="left">
            {allAvailableRaces.map((aRace, index) => { return <CardSingleRaceNew raceID={aRace.id} needsReload = {needsReload} setNeedsReload={setNeedsReload} racers={props.racers} setRacers={props.setRacers} raceSettings={props.raceSettings} setRaceSettings={props.setRaceSettings} index={index} race={aRace} /> })}
            </Grid>
        </>
    )
}

export default ListRacesAsCards;