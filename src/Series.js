import { Grid } from '@mui/material';
import { collection, getDocs } from "firebase/firestore";
import { Fragment, useEffect, useState } from 'react';
import CardSingleRaceNew from './CardSingleRaceNew';
import CardSingleSerie from './CardSingleSerie';
import { db } from './firebase';

const Series = (props) => {
   
    const [allAvailableSeries, setAllAvailableSeries] = useState([])
    
    useEffect(() => { console.log('Useeffect in list series card');fetchData() }, [db]);

    const fetchData = async () => {
        await getDocs(collection(db, "series"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log('Loaded series!');
                setAllAvailableSeries(newData)
                console.log(newData);                
            }
            )              
    }

    return (
        <>
            <Grid container paddingTop={'1rem'} spacing={1} justifyContent="left" alignItems="left">
            {allAvailableSeries.map((aSerie, index) => { return <CardSingleSerie serieID={aSerie.id} /> })}
            </Grid>
        </>
    )
}

export default Series;