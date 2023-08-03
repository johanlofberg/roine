import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from 'react';
//import {Card,CardHeader} from 'react-bootstrap';
// I tidig variant header från mui och card from react
import { Card, CardHeader } from '@mui/material';
//import CardHeader from "@mui/material/CardHeader";
//import Card from 'react-bootstrap/Card';
//import CardHeader from "@mui/material/CardHeader";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AppBar, Avatar, Badge, Box, Button, CardActionArea, Grid, Menu, MenuItem, Toolbar, Tooltip } from '@mui/material';
import IconButton from "@mui/material/IconButton";
import { blue, green, red } from "@mui/material/colors";
import { faArrowDown, faBinoculars, faEye, faEyeSlash, faHouseTsunami, faList, faSortAlphaAsc, faSortAlphaDesc, faSortNumericAsc, faSortNumericDesc, faTableCells } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaCopy, FaEdit, FaFlagCheckered, FaStopwatch, FaTrash } from 'react-icons/fa';
// Hoom, get border with mui
import { ButtonGroup } from 'react-bootstrap';
import Rightviewmenu from './Rightviewmenu';
import relativemilliSecondsToTimeStr, { niceAbsoluteTimeFormat } from './myTimeDisplays';
import uniqueID from './uniqueID';
import { normalizeRacers } from "./myUtilities";
import { saveRaceToDataBase, saveRacerListToDataBase } from './Database';

export default function Scoreboard(props) {

    const [sortField, setsortField] = useState('number');
    const [sortDirection, setsortDirection] = useState(1);
    const [viewModel, setviewModel] = useState({ state: 1 });
    const [hideCards, sethideCards] = useState(false);
    const [viewedRacer, setviewedRacer] = useState(null);

    const [anchorRacerOptions, setanchorRacerOptions] = useState([]);

    function terminateRace() {
        // TOD: If this is forcefully called, we should mark all non-started and non-finished as DNS/DNF

        const theRace = {...props.raceSettings, state:'finished'}       
        props.setRaceSettings(theRace)        
        const finishLog = { id: uniqueID(), time: (new Date() + 1), racerID: '', eventtype: 'endrace', comment: 'Slut på tävling', associatedID: '' }
        props.setlogLaps([...props.logLaps, finishLog]);        

//        let didWeManageTosSaveParticpants = saveRacerListToDataBase(normalizeRacers(props.racers), props.raceSettings.racerlistid)
        //let didWeManageTosSaveRace = saveRaceToDataBase(props.raceSettings)

        //if (didWeManageTosSaveParticpants && didWeManageTosSaveRace) {            
            //const saveLog = { id: uniqueID(), time: (new Date()), racerID: '', eventtype: 'savedrace', comment: 'Tävling sparad i databas', associatedID: '' }
            //props.setlogLaps([...props.logLaps, saveLog]);
        //}
    }

    function estimateSingleRacerLapTime(racer, now) {

        if (!(racer.dns || racer.dnf || racer.finished) && (racer.lapmarkings.length > 0)) {
            let lastLapTime = 0
            if (racer.lapmarkings.length === 1) {
                // Started but not lapped
                lastLapTime = 5 * 60 * 1000
            } else {
                lastLapTime = racer.lapmarkings.at(-1).time - racer.lapmarkings.at(-2).time
            }
            let timeUntilArrival = racer.lapmarkings.at(-1).time.getTime() + lastLapTime - now
            if (timeUntilArrival < 1) {
                return 0
            } else {
                return Math.ceil(timeUntilArrival / (60 * 1000))
            }
        }
        else if (racer.finished) {
            return 1002
        } else if (racer.dnf) {
            return 1001
        } else if (racer.dns) {
            return 1000
        } else return 999
    }

    function updateNext() {
        return //FIXME
        let racers = props.racers
        let now = new Date()
        // create a new Date object, using the adjusted time        
        racers = racers.map((racer) => { racer.next = estimateSingleRacerLapTime(racer, now) })
        props.setRacers(racers)
    }

    function clickViewModel(event) {
        let newviewModel = viewModel;
        newviewModel.state = (newviewModel.state + 1) % 3
        setviewModel(newviewModel)
    }

    function changeHideMode(event) {
        let aux = hideCards
        sethideCards(!aux)
    }

    function computeRequiredLaps(racer) {
        return props.raceSettings.classes.find((raceClass) => raceClass.name.toLowerCase() === racer.class.toLowerCase()).laps;
    }

    function deleteEvent(params) {

        let theRacerIndex = props.racers.findIndex((x) => (x.id === params.row.racerID));
        let theRacer = props.racers[theRacerIndex]
        let theRacers = props.racers

        if (params.row.eventtype === 'dns') {
            theRacers[theRacerIndex].dns = false
            theRacers[theRacerIndex].next = 999;
        } else if (params.row.eventtype === 'dnf') {
            theRacers[theRacerIndex].dnf = false
            theRacers[theRacerIndex].next = 20;
        } else if (params.row.eventtype === 'finished') {
            let theNewRacerLog = theRacer.lapmarkings.filter((x) => x.id !== params.row.id)
            theRacers[theRacerIndex].lapmarkings = theNewRacerLog;
            theRacers[theRacerIndex].next = estimateSingleRacerLapTime(theRacers[theRacerIndex]);
            theRacers[theRacerIndex].finished = false
        } else if (params.row.eventtype === 'start') {
            let theNewRacerLog = theRacer.lapmarkings.filter((x) => x.id !== params.row.id)
            theRacers[theRacerIndex].next = 999;
            theRacers[theRacerIndex].lapmarkings = theNewRacerLog;
        }
        else {
            let theNewRacerLog = theRacer.lapmarkings.filter((x) => x.id !== params.row.id)
            theRacers[theRacerIndex].lapmarkings = theNewRacerLog;
        }
        props.setRacers(theRacers)
        props.setlogLaps(props.logLaps.filter((x) => x.id !== params.row.id))
    }

    function clickedCard(event, racer) {

        if ((props.raceSettings.state !== 'finished') && (racer.dns || racer.dnf || racer.finished) === false) {

            if (props.raceSettings.state ===  'planning') {
                console.log('Hey, race started!')
                props.setRaceSettings({...props.raceSettings, state:'running'})
            }

            let now = new Date();
            let eventID = uniqueID();

            let index = props.racers.findIndex(x => x.id === racer.id);
            let OldRacers = props.racers;
            let newEvent = { id: eventID, time: now };
            OldRacers[index].lapmarkings.push(newEvent)

            const requiredLaps = computeRequiredLaps(racer)

            const numberLaps = OldRacers[index].lapmarkings.length - 1
            if (numberLaps === requiredLaps) {
                OldRacers[index].next = 1002
                OldRacers[index].finished = true
            } else {
                OldRacers[index].next = estimateSingleRacerLapTime(racer, now)
            }
            props.setRacers(OldRacers)

            let theComment = 'Start'
            const theRacerLaps = OldRacers[index].lapmarkings
            if (numberLaps > 0) {
                const driveTimeInMilliSeconds = (theRacerLaps[theRacerLaps.length - 1].time - theRacerLaps[theRacerLaps.length - 2].time)
                theComment = 'Passering varv ' + numberLaps + ' på ' + relativemilliSecondsToTimeStr(driveTimeInMilliSeconds, 'short')
            }
            const passageLog = { id: eventID, time: now, racerID: racer.id, eventtype: (numberLaps === 0 ? 'start' : 'timecheck'), comment: theComment };
            let newLog = null
            if (OldRacers[index].finished) {
                // Add a related stamp which simply says racer finished the race. In this stamp, we point to the actual event
                let associatedID = eventID
                eventID = uniqueID();
                // FIXME: hack to ensure synced in log list
                now = new Date(Date.now() + 1000);
                const totaldriveTimeInMilliSeconds = (theRacerLaps[theRacerLaps.length - 1].time - theRacerLaps[0].time)
                theComment = 'Målgång, totaltid ' + relativemilliSecondsToTimeStr(totaldriveTimeInMilliSeconds, 'short')
                const goalLog = { id: eventID, time: now, racerID: racer.id, eventtype: 'finished', comment: theComment, associatedID: associatedID }
                newLog = [...props.logLaps, passageLog, goalLog];
            } else {
                newLog = [...props.logLaps, passageLog];
            }
            props.setlogLaps(newLog);


            console.log('Computing finishing status')            
            const allFinished = props.racers.reduce((accumulator, racer) => {
                return accumulator && (racer.dnf || racer.dns || racer.finished)
            }, true);
            if (allFinished) {
                console.log('Terminating race')
                terminateRace()
            }            
        }
    }

    function createLapTimeInfoString(racer) {

        let now = new Date();

        if (racer.dns) {
            return 'DNS'
        } else if (racer.dnf) {
            return 'DNF efter ' + (racer.lapmarkings.length - 1) + ' varv'
        } else if (racer.lapmarkings.length === 0) {
            return 'Ej startat'
        }
        else if (racer.finished) {
            const driveTimeInMilliSeconds = racerTotalRaceTime(racer)
            // We are not out on the (n+1)th, but have finished nth
            let numberOfLaps = racer.lapmarkings.length - 1
            const requiredLaps = computeRequiredLaps(racer)
            return relativemilliSecondsToTimeStr(driveTimeInMilliSeconds) + ' (' + numberOfLaps + '/' + requiredLaps + ')';

        } else {
            const driveTimeInMilliSeconds = (now - racer.lapmarkings[0].time)
            let driveTimeString = relativemilliSecondsToTimeStr(driveTimeInMilliSeconds, 'short')
            let numberOfLaps = racer.lapmarkings.length
            const requiredLaps = computeRequiredLaps(racer)
            return driveTimeString + ' (' + numberOfLaps + '/' + requiredLaps + ')';
        }
    }

    function onClickRacerOptions(event, racer, index) {
        let temp = anchorRacerOptions
        temp[index] = event.currentTarget;
        setanchorRacerOptions(temp)
    }

    function onCloseRacerOptions(event, racer, index, what) {

        event.preventDefault()
        event.stopPropagation()

        let temp = new Array(props.racers.length);
        if (index === undefined) {
            temp.fill(null);
        } else {
            temp = anchorRacerOptions
            temp[index] = null

            let theRacerIndex = props.racers.findIndex((x) => (x.id === racer.id));
            let allRacers = props.racers;
            let now = new Date();
            const eventID = uniqueID();
            switch (String(what)) {
                case 'view':
                    setviewedRacer(racer)
                    break
                case 'close':
                    break
                case 'dnf':
                    if ((allRacers[theRacerIndex].lapmarkings.length > 0) && (allRacers[theRacerIndex].finished === false)) {
                        allRacers[theRacerIndex].dnf = true
                        allRacers[theRacerIndex].next = 1001
                        props.setRacers(allRacers)
                        props.setlogLaps([...props.logLaps, { id: eventID, time: now, racerID: racer.id, eventtype: 'dnf', comment: 'DNF' }]);
                    }
                    break
                case 'dns':
                    if (allRacers[theRacerIndex].lapmarkings.length === 0) {
                        allRacers[theRacerIndex].dns = true
                        allRacers[theRacerIndex].next = 1000
                        props.setRacers(allRacers)
                        props.setlogLaps([...props.logLaps, { id: eventID, time: now, racerID: racer.id, eventtype: 'dns', comment: 'DNS' }]);
                    }
                    break
                case 'remove dns':
                    allRacers[theRacerIndex].dns = false
                    allRacers[theRacerIndex].next = 0
                    props.setRacers(allRacers)
                    props.setlogLaps([...props.logLaps, { id: eventID, time: now, racerID: racer.id, eventtype: 'remove dns', comment: 'DNS removed' }]);
                    break
                case 'remove dnf':
                    allRacers[theRacerIndex].dnf = false
                    allRacers[theRacerIndex].next = 20
                    props.setRacers(allRacers)
                    props.setlogLaps([...props.logLaps, { id: eventID, time: now, racerID: racer.id, eventtype: 'remove dnf', comment: 'DNF removed' }]);
                    break
                default:

            }
        }
        setanchorRacerOptions(temp)
    }

    function racerTotalRaceTime(racer) {
        return racer.lapmarkings.slice(-1)[0].time - racer.lapmarkings[0].time
    }

    function createRacerTooltip(racer) {

        let theTip = ['#' + racer.number + ' ' + racer.name + ' ' + racer.club + ', ' + racer.class, <br />, <br />]

        if (racer.dns === true) {
            theTip.push(['DNS'])
            return theTip
        } else if (racer.dnf === true) {
            theTip.push(['DNF på varv ' + racer.lapmarkings.length])
        } else if (racer.lapmarkings.length === 0) {
            theTip.push(['Har ej startat.'])
            return theTip
        } else if (!racer.finished || racer.lapmarkings.length === 1) {
            theTip.push(['Ute på varv ' + (racer.lapmarkings.length)])
        } else {
            //let alllaps = racer.lapmarkings            
            theTip.push(['Gått i mål, totaltid ' + relativemilliSecondsToTimeStr(racerTotalRaceTime(racer))])
        }
        if (racer.lapmarkings.length === 1) {
            return theTip
        }
        else {
            theTip.push([<br />])
            theTip.push([<br />])
            theTip.push(['Varvtider'])

            let driveTimeInMilliSeconds = 0;
            let laps = racer.lapmarkings
            for (let i = 0; i < laps.length - 1; i++) {
                driveTimeInMilliSeconds = (laps[i + 1].time - laps[i].time)
                theTip.push([<br />])
                theTip.push([(i + 1) + ': ' + relativemilliSecondsToTimeStr(driveTimeInMilliSeconds, 'short')])
            }
            return theTip
        }
    }

    function createOneCard(racer, index) {
        return (
            <>
                <Grid item xs={3}>
                    <Card sx={{ maxHeight: 60 }}>
                        <CardActionArea disableRipple={racer.dnf || racer.dns || racer.finished} onClick={(event) => clickedCard(event, racer)}>
                            <CardHeader
                                sx={{
                                    opacity: racer.dns || racer.dnf ? 0.6 : 1,
                                    display: "flex",
                                    overflow: "hidden",
                                    "& .MuiCardHeader-content": {
                                        overflow: "hidden"
                                    }
                                }}
                                avatar={
                                    <>{(racer.dnf || racer.dns || racer.finished || racer.next > 59) ? "" :
                                        <><Tooltip title={'Beräknas ankomma inom ' + racer.next + ' minut' + (racer.next === 1 ? '' : 'er')}>
                                            <Badge
                                                overlap="rectangular"
                                                color={(racer.next === 0 ? "warning" : "info")}
                                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                badgeContent={(racer.next === 0 ? '!' : racer.next)}
                                            >
                                            </Badge>
                                        </Tooltip>
                                        </>
                                    }
                                        {racer.dnf || racer.dns ? <Avatar sx={{ bgcolor: red[500] }} aria-label="numbercircle">{'#' + racer.number}</Avatar> :
                                            racer.lapmarkings.length === 0 ?
                                                <Avatar sx={{ bgcolor: green[500] }}>{'#' + racer.number}</Avatar> :
                                                <Avatar sx={{ bgcolor: blue[500] }}>{'#' + racer.number}</Avatar>}
                                    </>
                                }
                                action={
                                    <IconButton
                                        id={'raceroptionicon' + racer.id}
                                        onTouchStart={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        //  onClick={(event) => { event.stopPropagation(); event.preventDefault();}}                 
                                        id={'raceroptionicon' + racer.id}
                                        aria-label={'raceroptionicon' + racer.id}
                                        //aria-controls={open ? 'racermenu' + racer.id : undefined}
                                        // aria-haspopup="true"
                                        // aria-expanded={open ? 'true' : undefined}
                                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); onClickRacerOptions(event, racer, index) }}
                                    >
                                        <MoreVertIcon
                                        />
                                    </IconButton>
                                }
                                title={<Tooltip title={createRacerTooltip(racer)}>{racer.name}</Tooltip>}
                                titleTypographyProps={{ noWrap: true }}
                                subheader={racer.lapmarkings.length === 0 || racer.dns ? createLapTimeInfoString(racer) :
                                    <>{racer.finished || racer.dnf ? <FaFlagCheckered /> : <FaStopwatch />} {createLapTimeInfoString(racer)}</>}
                                //subheader={racer.lapmarkings.length == 0 || racer.dnf || racer.dns || racer.finished? createLapTimeInfoString(racer) : <span><FontAwesomeIcon icon={faStopwatch}/> {createLapTimeInfoString(racer)}</span>}
                                //subheader={<FontAwesomeIcon icon={faClock} />(createLapTimeInfoString(racer) )}
                                subheaderTypographyProps={{ noWrap: true }}
                            />
                            <Menu
                                id={'racermenu' + racer.id}
                                key={'racermenu' + racer.id}
                                aria-labelledby={'raceroptionicon' + racer.id}
                                anchorEl={anchorRacerOptions[index]}
                                //open={Boolean(anchorRacerOptions)}
                                open={anchorRacerOptions[index] ? true : false}
                                onClose={onCloseRacerOptions}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                            >
                                <MenuItem key='racerop1' onClick={(event) => onCloseRacerOptions(event, racer, index, 'close')}>Stäng</MenuItem>
                                <MenuItem key='racerop2' onClick={(event) => onCloseRacerOptions(event, racer, index, 'view')}>Mer info</MenuItem>
                                <MenuItem key='racerop3' onClick={(event) => onCloseRacerOptions(event, racer, index, racer.dnf ? 'remove dnf' : 'dnf')}>{racer.dnf ? 'Ta bort DNF' : 'DNF'}</MenuItem>
                                <MenuItem key='racerop4' onClick={(event) => { event.preventDefault(); event.stopPropagation(); onCloseRacerOptions(event, racer, index, racer.dns ? 'remove dns' : 'dns') }}>{racer.dns ? 'Ta bort DNS' : 'DNS'}</MenuItem>
                            </Menu>
                        </CardActionArea>
                    </Card>
                </Grid>
            </>
        );
    }

    function sortComparator(a, b) {
        if (a[sortField] > b[sortField]) return sortDirection;
        if (a[sortField] < b[sortField]) return -sortDirection;
        return 0;
    }

    function setThesortField(how) {
        if (how === sortField) {
            setsortDirection(-sortDirection);
        } else {
            setsortField(how);
        }
    }

    function restartAllRacers() {

        let allRacers = props.racers;
        allRacers.map((racer) => {
            racer.lapmarkings = [];
            racer.dns = false;
            racer.dnf = false;
            racer.finished = false;
            racer.next = 999
        });

        props.setRacers(allRacers);
        props.setlogLaps([])

        let theRace = props.raceSettings;
        theRace.state = 'planning'
        props.setRaceSettings(theRace)

    }

    function masStart() {
        let allRacers = props.racers;
        let newLog = []

        const now = new Date();

        allRacers.map((racer) => {
            let eventID = uniqueID();
            let newEvent = { id: eventID, time: now };
            newLog.push({ id: eventID, time: now, racerID: racer.id, comment: 'Gemensam start' })
            racer.lapmarkings = [{ id: eventID, time: now }]
            racer.next = 20
            racer.dnf = false
            racer.dns = false
            racer.finished = false
        }
        );
        props.setRacers(allRacers);
        props.setlogLaps(newLog)

        let theRace = props.raceSettings;
        theRace.state = 'planning'
        props.setRaceSettings(theRace)
    }

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

        props.setRacers(parsedracers)
        props.setlogLaps(parsedlogLaps)
        props.setRaceSettings(parsedraceSettings)
    }
    function saveToLocalStorage() {
        return //FIXME
        localStorage.setItem("logLaps", JSON.stringify(props.logLaps));
        localStorage.setItem("racers", JSON.stringify(props.racers));
        localStorage.setItem("raceSettings", JSON.stringify(props.raceSettings));
    }

    function createCards(racers) {

        // Crashes unless I do this after opening racers in competitorlist
        // https://stackoverflow.com/questions/53420055/error-while-sorting-array-of-objects-cannot-assign-to-read-only-property-2-of
        const racerCards = racers.slice().sort((a, b) => sortComparator(a, b)).map((racer, index) => (((racer.dns || racer.dnf || racer.finished) && hideCards) || createOneCard(racer, index)))

        return (
            <>
                <Box sx={{ width: '100%' }}>
                    <Grid container rowSpacing={0.1} columnSpacing={0.1}>
                        {racerCards.map((racer) => (racer))}
                    </Grid>
                </Box>
            </>)
    }

    const columns = [
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <Tooltip title="Ta bort"><GridActionsCellItem icon={<FaTrash />} onClick={() => deleteEvent(params)} label="Delete" /></Tooltip>,
                <Tooltip title="Justera"><GridActionsCellItem icon={<FaEdit />} onClick={() => deleteEvent(params)} label="Edit" /></Tooltip>,
                <Tooltip title="Kopiera"><GridActionsCellItem icon={<FaCopy />} onClick={() => deleteEvent(params)} label="Copy" /></Tooltip>,],
        },
        {
            field: 'id',
            headerName: 'id',
            width: 100,
            editable: false,
            align: 'right',
            headerAlign: 'center',
        },
        {
            field: 'nummer',
            headerName: 'Nummer',
            width: 70,
            editable: false,
            align: 'right',
            headerAlign: 'center',
            valueGetter: (params) => { const theRacer = props.racers.find((racer) => racer.id === params.row.racerID); return (theRacer ? theRacer.number : 'Deleted?') }
        },
        //{
        //    field: 'racerID',
        //    headerName: 'Tävlande',
        //    width: 190,
        //    editable: false,
        //    align: 'right',
        //    headerAlign: 'center',
        //    valueGetter: (params) => { const theRacer = props.racers.find((racer) => racer.id == params.value); return (theRacer ? '#' + theRacer.number + ' ' + theRacer.name : 'Deleted?') }
        //},
        {
            field: 'racerID',
            headerName: 'Namn',
            width: 190,
            editable: false,
            align: 'right',
            headerAlign: 'center',
            valueGetter: (params) => { const theRacer = props.racers.find((racer) => racer.id === params.value); return (theRacer ? theRacer.name : 'Deleted?') }
        },
        {
            field: 'time',
            headerAlign: 'center',
            headerName: 'Tidpunkt',
            align: 'center',
            width: 120,
            editable: false,
            valueGetter: (params) => {
                //return params.value.toLocaleString('sv').slice(11, 19)
                return niceAbsoluteTimeFormat(params.value)
            }
        },
        {
            field: 'comment',
            headerAlign: 'center',
            headerName: 'Kommentar',
            align: 'left',
            width: 250,
            // flex: 1,
            editable: true
        },
    ];

    const [count, setCount] = useState(0);

    useEffect(() => {
        const cardTimer = setInterval(() => {
            if (count % 10 === 0) {
                updateNext();
                setCount((oldCount) => oldCount + 1)
            }
            else {
                setCount((oldCount) => oldCount + 1)
            }
        }, 1000);

        return () => { clearInterval(cardTimer) }
    },);


    console.log(props)

    return (
        <>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between" }}>

                    <ButtonGroup>
                        <Box>
                            <Tooltip onClick={clickViewModel} title="Byt vy"><Button color="inherit"> <FontAwesomeIcon icon={(viewModel.state === 0) ? faTableCells : (viewModel.state === 1) ? faHouseTsunami : faList} size="lg" /> </Button></Tooltip>
                            <Tooltip title="Sortera efter startnummer"><Button disabled={viewModel.state === 2} color="inherit" onClick={(event) => setThesortField("number")}> <FontAwesomeIcon icon={sortDirection === 1 ? faSortNumericAsc : faSortNumericDesc} size="lg" /> </Button></Tooltip>
                            <Tooltip title="Sortera efter beräknad varvning"><Button disabled={viewModel.state === 2} color="inherit" onClick={(event) => setThesortField("next")}><FontAwesomeIcon icon={faArrowDown} /><FontAwesomeIcon icon={faBinoculars} size="lg" /> </Button></Tooltip>
                            <Tooltip title="Sortera efter namn"><Button color="inherit" disabled={viewModel.state === 2} onClick={(event) => setThesortField("name")}><FontAwesomeIcon icon={sortDirection === 1 ? faSortAlphaAsc : faSortAlphaDesc} size="lg" /></Button></Tooltip>
                            <Tooltip onClick={changeHideMode} title={(hideCards ? 'Visa inaktiva' : 'Dölj inaktiva')}><Button color="inherit"> <FontAwesomeIcon icon={(hideCards) ? faEyeSlash : faEye} size="lg" /> </Button></Tooltip>
                        </Box>
                    </ButtonGroup>

                    <ButtonGroup>
                        <Box>
                            <Tooltip title="Nollställ"><Button color="inherit" onClick={restartAllRacers}>Nollställ</Button></Tooltip>
                            <Tooltip title="Masstart"><Button color="inherit" onClick={masStart}>Masstart</Button></Tooltip>
                            <Tooltip title="Spara"><Button color="inherit" onClick={saveToLocalStorage}>Spara</Button></Tooltip>
                            <Tooltip title="Ladda"><Button color="inherit" onClick={loadFromLocalStorage}>Ladda</Button></Tooltip>
                        </Box>
                    </ButtonGroup>
                    <Rightviewmenu />
                </Toolbar>
            </AppBar>
            {viewModel.state < 2 && props.racers.length > 0 && createCards(normalizeRacers(props.racers))}
            <div>
                {((viewModel.state > 0) && props.logLaps.length > 0) &&
                    <DataGrid
                        initialState={
                            {
                                sorting: { sortModel: [{ field: 'time', sort: 'desc' }] },
                                columns: { columnVisibilityModel: { id: false } }
                            }
                        }
                        editMode="row"
                        rows={props.logLaps}
                        columns={columns}
                    />}
            </div>
        </>
    );
}
