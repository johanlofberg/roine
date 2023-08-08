import Typography from "@mui/material/Typography";
import { DataGrid } from '@mui/x-data-grid';
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from './firebase';
import { deepClone } from "./myUtilities";
import { Paper } from "@mui/material";
import { Container } from "react-bootstrap";
import relativemilliSecondsToTimeStr from "./myTimeDisplays";

export default function NewResults() {
    const [theRace, setTheRace] = useState([])
    const [racerList, setRacerList] = useState([])



    const numberColumn = { field: 'number', headerAlign: 'center', headerName: 'Nummer', align: 'center', width: '75' }
    const placeColumn = { field: 'place', headerAlign: 'center', headerName: 'Placering', align: 'center', width: '75' }
    const nameColumn = { field: 'name', headerAlign: 'center', headerName: 'Namn', align: 'right', width: '200' }
    const clubColumn = { field: 'club', headerAlign: 'center', headerName: 'Klubb', align: 'center', width: '75' }

    const numberOfLapsColumn = { field: 'numberoflaps', headerAlign: 'center', headerName: 'Antal varv', align: 'center', width: 80 }
    const totaltimeColumn = { field: 'totaltime', headerAlign: 'center', headerName: 'Totaltid', align: 'center', width: 120, editable: false, valueGetter: (params) => { return relativemilliSecondsToTimeStr(params.value) } }

    function computeDataGridColumns() {
        const knowncolumns = [placeColumn, numberColumn, nameColumn, clubColumn]

        let columns = knowncolumns


        // Most number of laps?
        let N = Math.max(...racerList.map((racer) => (racer.lapmarkings.length - 1)))

        for (let i = 0; i < N; i++) {
            columns.push(
                {
                    field: 'lap' + (i + 1),
                    headerAlign: 'center',
                    headerName: 'Varv ' + (i + 1),
                    align: 'center',
                    editable: false,
                    valueGetter: (params) => { return relativemilliSecondsToTimeStr(params.value, 'short') }
                });
        }
    }

    function createLapTimes(racer) {
        let newRacer = racer
        if (racer.lapmarkings.length > 1) {
            let laptimes = new Array(racer.lapmarkings.length - 1).fill(0);
            let newRacer = racer;
            for (let i = 0; i < laptimes.length; i++) {
                laptimes[i] = racer.lapmarkings[i + 1].time - racer.lapmarkings[i].time
                newRacer['lap' + (i + 1)] = laptimes[i]
            }
        }
        return newRacer
    }

    function createResultsList(resultsClass) {


        let knowncolumns = []   
        let results = []
        if (racerList && (racerList[0]?.lapmarkings.length==0) && racerList[0]?.totaltimeinmilliseconds.length===0) {
            // typ importerat stubb
            // Generate a results list with name and number
            knowncolumns = [placeColumn, {...nameColumn,width:'300'}]                    
            resultsClass.results.forEach((element, index) => {
                let j = racerList.findIndex((racer) => racer.id === element)
                if (j !==-1) {
                    results = [...results, {id: racerList[j].id, 
                                            name: racerList[j].name, 
                                            place:index+1 }]
                }
            });        
        }
        else if (racerList && (racerList[0].totaltimeinmilliseconds) && (racerList[0].numberoflaps))  {            
            // typ importerat km, varv men inga varvtider
            knowncolumns = [placeColumn,nameColumn,numberOfLapsColumn,totaltimeColumn]                                
            resultsClass.results.forEach((element, index) => {
                let j = racerList.findIndex((racer) => racer.id === element)
                if (j !==-1) {                    
                    results = [...results, {id: racerList[j].id, 
                                            name: racerList[j].name, 
                                            place:index+1,
                                            numberoflaps:racerList[j].numberoflaps,
                                            totaltime: racerList[j].totaltimeinmilliseconds}]
                }
            })
            console.log('REsults' + resultsClass,results);            
        }


        return (
            <>
                <Paper>
                    <Typography component="h5" >{resultsClass.class.toUpperCase()}</Typography>
                    <DataGrid
                        rows={results}
                        columns={knowncolumns}
                        hideFooter
                    />
                </Paper>
            </>
        );

        //let racers = racerList.filter((racer) => ((racer.class.toLowerCase() == raceClass) || raceClass == 'total'))
        //console.log(racers)

        /*
        if (true) {//|| racers.length == 0) {
            return (
                <div>
                    <Typography component="h5">{raceClass.toUpperCase()}</Typography>
                    <Typography component="h6">Inga tävlande</Typography>
                </div>
            )
        }
        else {
            racers.map((racer) => (racer.completedlaps = (racer.dns || racer.lapmarkings.length == 0 ? 0 : racer.lapmarkings.length - 1)))
            racers.map((racer) => (racer.totaltime = (racer.dns || racer.lapmarkings.length == 0 ? 0 : racer.lapmarkings.slice(-1)[0].time - racer.lapmarkings[0].time)))
            let resultList = racers.sort((a, b) => (b.completedlaps - a.completedlaps) || (a.totaltime - b.totaltime))

            racers.map((racer) => (createLapTimes(racer)))

            resultList.map((racer, index) => (racer.completedlaps == 0 ? racer.place = 'DNS' : racer.place = index + 1))

            for (let i = 0; i < resultList.length; i++) {
                resultList[i].laptimes = resultList[i].lapmarkings.slice(1).map((num, index) => num.time - resultList[i].lapmarkings[index].time);
            }

            return (
                <>
                    <div>
                        <Typography component="h5" >{raceClass.toUpperCase()}</Typography>
                        <DataGrid
                            rows={resultList}
                            columns={computeDataGridColumns}
                            hideFooter
                        />

                    </div>
                </>
            );
        }*/
    }

    const location = useLocation();
    const raceID = location.pathname.split('newresults/').pop()

    useEffect(() => {        
        if (raceID && raceID.length) {
            const fetchDataInSeries = async () => {
                try {
                    // First load the race structure
                    let raceData = []
                    const raceRef = doc(db, 'races', raceID);
                    const snapshot = await getDoc(raceRef);
                    if (snapshot.exists) {
                        raceData = snapshot.data();                        
                    }

                    let racerListData = []
                    if (raceData.racerlistid) {                        
                        const racerListRef = doc(db, 'racerlist', raceData.racerlistid);                        
                        const snapshot = await getDoc(racerListRef);                        
                        if (snapshot.exists) {                            
                            racerListData = snapshot.data();
                            console.log('snapped')
                            console.log(racerListData)
                            racerListData = Object.values(snapshot.data())
//                            racerListData = racerListData.map(({ id, name, class: className, number }) => ({ id, name, class: className }));
                        }
                    }
                    setTheRace(raceData)
                    setRacerList(racerListData);
                    console.log(raceData)
                    console.log(racerListData)
                }
                catch (error) { console.error('Error fetching data:', error); };
            }
            fetchDataInSeries();
        }

        return () => { }
    }, [])


    return (
        <><Container>
            {theRace?.classes && theRace.results.map((resultsClass) => createResultsList(resultsClass))}
            </Container></>
    );

}