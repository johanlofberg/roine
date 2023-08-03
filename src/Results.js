import React from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Typography from "@mui/material/Typography";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { ButtonGroup } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { faTrophy, faUserGroup, faStopwatch20 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Rightviewmenu from './Rightviewmenu'
import relativemilliSecondsToTimeStr from './myTimeDisplays'

export default function Results(props) {

    const knowncolumns = [
        {
            field: 'place',
            headerAlign: 'center',
            headerName: 'Placering',
            align: 'center',
            width: '75',
            editable: false,
        },
        {
            field: 'number',
            headerAlign: 'center',
            headerName: 'Nummer',
            align: 'center',
            width: 70,
            editable: false,
        },
        {
            field: 'name',
            headerAlign: 'center',
            headerName: 'Namn',
            align: 'center',
            width: 150,
            editable: false,
        },
        {
            field: 'completedlaps',
            headerAlign: 'center',
            headerName: 'Antal varv',
            align: 'center',
            width: 80,
            editable: false,
        },
        {
            field: 'totaltime',
            headerAlign: 'center',
            headerName: 'Totaltid',
            align: 'center',
            width: 120,
            editable: false,
            valueGetter: (params) => { return relativemilliSecondsToTimeStr(params.value) }
        },
    ]

    let columns = knowncolumns

    // Most number of laps?
    let N = Math.max(...props.racers.map((racer) => (racer.lapmarkings.length-1)))
    
    for (let i = 0; i < N; i++) {
    columns.push(
        {
            field: 'lap'+(i+1),
            headerAlign: 'center',
            headerName: 'Varv ' + (i+1),
            align: 'center',            
            editable: false,
            valueGetter: (params) => { return relativemilliSecondsToTimeStr(params.value, 'short') }
        });   
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

    function createResultsList(raceClass) {

        let racers = props.racers.filter((racer) => ((racer.class.toLowerCase() == raceClass) || raceClass == 'total'))

        if (racers.length == 0) {
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
                            columns={columns}
                            hideFooter
                        />

                    </div>
                </>
            );
        }
    }

    return (
        <div>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <ButtonGroup>
                        <Container align='right'>
                        </Container>
                    </ButtonGroup>
                    <Rightviewmenu />
                </Toolbar>
            </AppBar>
            {props.raceSettings.classes[0].name !='gemensam' ? 
            props.raceSettings.classes.map((raceClass) => createResultsList(raceClass.name.toLowerCase())) :
             '' }            
            {createResultsList('total')}
        </div>
    );
}