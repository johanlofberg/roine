import React, { useState } from 'react';
import { useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import CardContent from "@mui/material/CardContent";
import Grid from '@mui/material/Grid';
import Card from 'react-bootstrap/Card';
import CardHeader from "@mui/material/CardHeader";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

//import Menu from "@material-ui/core/Menu";
//import MenuItem from "@material-ui/core/MenuItem";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { blue, green, red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from '@mui/material/Box';
import { CardActionArea } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import { faClock, faStopWatch, faBinoculars, faArrowDown, faHome, faSortAlphaAsc, faSortAlphaDesc, faSortAlphaDown, faSortAmountAsc, faSortNumericAsc, faSortNumericDesc, faSortNumericDown, faStopwatch, faBuildingCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { v4 as uuidv4 } from 'uuid';
import { FaCopy,FaFlagCheckered, FaEdit, FaTrash, FaUserPlus, FaStopwatch } from 'react-icons/fa';


export default function App(props) {

  const [sortField, setsortField] = useState('number');
  const [sortDirection, setsortDirection] = useState(1);
  const arr = new Array(props.racers.length).fill(null);
  const [anchorRacerOptions, setanchorRacerOptions] = useState(arr);
  //const open = Boolean(anchorRacerOptions)

  function computeRequiredLaps(racer) {
    //const racerClassProperties = props.raceSetting.classes.find( (raceClass) => raceClass.name == racer.class);   
    return props.raceSettings.classes.find((raceClass) => raceClass.name == racer.class).laps;
  }

  function deleteEvent(params) {

    let theRacerIndex = props.racers.findIndex((x) => (x.id == params.row.racerID));
    let theRacer = props.racers[theRacerIndex]
    let theRacers = props.racers

    if (params.row.eventtype == 'dns') {
      theRacers[theRacerIndex].dns = false
      theRacers[theRacerIndex].next = 0;
    } else if (params.row.eventtype == 'dnf') {
      theRacers[theRacerIndex].dnf = false
      theRacers[theRacerIndex].next = 20;
    } else {
      let theNewRacerLog = theRacer.lapmarkings.filter((x) => x.id != params.row.id)
      theRacers[theRacerIndex].lapmarkings = theNewRacerLog;
    }
    props.setRacers(theRacers)
    props.setlogLaps(props.logLaps.filter((x) => x.id != params.row.id))
  }

  function computeEstimatedArrival(racer, now) {
    if (racer.lapmarkings.length == 0) {
      return "x"
    } else {
      let now = new Date();
      let last = racer.lapmarkings.slice(-1);
      let timeSinceLappedInMinutes = (now - last[0].time) / (60 * 1000)

      let predictedLapTimeInMinutes = 20;
      if (racer.lapmarkings.length > 1) {
        let twoLast = racer.lapmarkings.slice(-2);
        predictedLapTimeInMinutes = (twoLast[1].time - twoLast[0].time) / (60 * 1000);
      } else {
      }

      let estimatedArrival = predictedLapTimeInMinutes - timeSinceLappedInMinutes;
      if (estimatedArrival < 1) { estimatedArrival = 1 }
      return Math.round(estimatedArrival)

    }
  }

  function clickedCard(event, racer) {

    if ((racer.dns || racer.dnf || racer.finished) == false) {
      let now = new Date();
      let eventID = uuidv4();

      let index = props.racers.findIndex(x => x.id === racer.id);
      let OldRacers = props.racers;
      let newEvent = { id: eventID, time: now };
      OldRacers[index].lapmarkings.push(newEvent)


      //const racerClassProperties = props.raceSetting.classes.find( (raceClass) => raceClass.name == racer.class);
      //const requiredLaps = racerClassProperties.laps//props.raceSetting.classes[racer.class].laps                           
      const requiredLaps = computeRequiredLaps(racer)

      const numberLaps = OldRacers[index].lapmarkings.length - 1
      if (numberLaps == requiredLaps) {
        OldRacers[index].next = 999
        OldRacers[index].finished = true
      } else {
        OldRacers[index].next = computeEstimatedArrival(racer, now)
      }
      props.setRacers(OldRacers)

      const theComment = (numberLaps === 0 ? 'Start' : 'Passering varv ' + numberLaps)
      const passageLog = { id: eventID, time: now, racerID: racer.id, eventtype: 'timecheck', comment: theComment };
      let newLog = null
      if (OldRacers[index].finished) {
        eventID = uuidv4();        
        now = new Date(Date.now() + 1000);        
        const goalLog = { id: eventID, time: now, racerID: racer.id, eventtype: 'finished', comment: 'Målgång' }
        newLog = [...props.logLaps, passageLog, goalLog];
      } else {
        newLog = [...props.logLaps, passageLog];
      }

      props.setlogLaps(newLog);
    }
  }

  function createLapTimeInfoString(racer) {

    let now = new Date();

    if (racer.dns) {
      return 'DNS'
    } else if (racer.dnf) {
      return 'DNF efter ' + (racer.lapmarkings.length - 1) + ' varv'
    } else if (racer.lapmarkings.length == 0) {
      return 'Ej startat'
    }
    else if (racer.finished) {      
      const driveTimeInMilliSeconds = (racer.lapmarkings.slice(-1)[0].time - racer.lapmarkings[0].time)
      let driveTimeString = ''
      if (driveTimeInMilliSeconds < 60 * 60 * 1000) {
        driveTimeString = new Date(driveTimeInMilliSeconds).toISOString().substring(14, 19);
      } else {
        driveTimeString = new Date(driveTimeInMilliSeconds).toISOString().substring(11, 19)
      }
      // We are not out on the (n+1)th, but have finished nth
      let numberOfLaps = racer.lapmarkings.length - 1

      //  const racerClassProperties = props.raceSetting.classes.find( (raceClass) => raceClass.name == racer.class);
      //  console.log(racerClassProperties)
      // const requiredLaps = racerClassProperties.laps//props.raceSetting.classes[racer.class].laps                           
      const requiredLaps = computeRequiredLaps(racer)

      return driveTimeString + ' (' + numberOfLaps + '/' + requiredLaps + ')';

    } else {     
      const driveTimeInMilliSeconds = (now - racer.lapmarkings[0].time)      
      let driveTimeString = ''
      if (driveTimeInMilliSeconds < 60 * 60 * 1000) {
        driveTimeString = new Date(driveTimeInMilliSeconds).toISOString().substring(14, 19);
      } else {
        driveTimeString = new Date(driveTimeInMilliSeconds).toISOString().substring(11, 19)
      }

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

      let theRacerIndex = props.racers.findIndex((x) => (x.id == racer.id));
      let allRacers = props.racers;
      let now = new Date();
      const eventID = uuidv4();
      switch (String(what)) {
        case 'close':
          break
        case 'dnf':
          if ((allRacers[theRacerIndex].lapmarkings.length > 0) && (allRacers[theRacerIndex].finished == false)) {
            allRacers[theRacerIndex].dnf = true
            allRacers[theRacerIndex].next = 999
            props.setRacers(allRacers)
            props.setlogLaps([...props.logLaps, { id: eventID, time: now, racerID: racer.id, eventtype: 'dnf', comment: 'DNF' }]);
          }
          break
        case 'dns':
          if (allRacers[theRacerIndex].lapmarkings.length == 0) {
            allRacers[theRacerIndex].dns = true
            allRacers[theRacerIndex].next = 999
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

  function createOneCard(racer, index) {
    return (
      <>
        <Grid item xs={3}>
          <Card sx={{ maxWidth: 290, maxHeight: 60 }}>
            <CardActionArea disableRipple={racer.dnf || racer.dns == true} onClick={(event) => clickedCard(event, racer)}>
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
                  <>{(racer.dnf || racer.dns || racer.finished || racer.next > 10) ? "" :
                    <><Tooltip title={'Beräknas ankomma inom ' + racer.next + ' minut' + (racer.next == 1 ? '' : 'er')}>
                      <Badge
                        overlap="rectangular"
                        color="warning"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={racer.next}
                      >
                      </Badge>
                    </Tooltip>
                    </>
                  }
                    {racer.dnf || racer.dns ? <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">{racer.number}</Avatar> :
                      racer.lapmarkings.length == 0 ?
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
                title={racer.name}
                titleTypographyProps={{ noWrap: true }}
                subheader={racer.lapmarkings.length == 0 || racer.dns ? createLapTimeInfoString(racer) :
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
                <MenuItem onClick={(event) => onCloseRacerOptions(event, racer, index, 'close')}>Stäng</MenuItem>
                <MenuItem onClick={(event) => onCloseRacerOptions(event, racer, index, racer.dnf ? 'remove dnf' : 'dnf')}>{racer.dnf ? 'Ta bort DNF' : 'DNF'}</MenuItem>
                <MenuItem onClick={(event) => { event.preventDefault(); event.stopPropagation(); onCloseRacerOptions(event, racer, index, racer.dns ? 'remove dns' : 'dns') }}>{racer.dns ? 'Ta bort DNS' : 'DNS'}</MenuItem>
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
    if (how == sortField) {
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
      racer.next = 0
    });
    props.setRacers(allRacers);
    props.setlogLaps([])
  }

  function masStart() {
    let allRacers = props.racers;
    let newLog = []

    const now = new Date();

    allRacers.map((racer) => {
      let eventID = uuidv4();
      let newEvent = { id: eventID, time: now };
      newLog.push({ id: eventID, time: now, racerID: racer.id, comment: '' })
      racer.lapmarkings = [{ id: eventID, time: now }]
      racer.next = 20
      racer.dnf = false
      racer.dns = false
      racer.finished = false
    }
    );
    props.setRacers(allRacers);
    props.setlogLaps(newLog)
  }

  function loadFromLocalStorage() {
      const savedracers = localStorage.getItem("racers");
      const savedlogLaps = localStorage.getItem("logLaps");
      const raceSettings = localStorage.getItem("raceSettings");
      let parsedracers = JSON.parse(savedracers);
      let parsedlogLaps = JSON.parse(savedlogLaps);
      const parsedraceSettings = JSON.parse(raceSettings);

      console.log(parsedlogLaps)

      parsedlogLaps.map((logItem) => ( logItem.time = new Date(logItem.time)))
      for (let i = 0; i < parsedracers.length; i++) {
        if (parsedracers[i].lapmarkings.length > 0) {
          parsedracers[i].lapmarkings.map((log) => (log.time = new Date(log.time)))
        }        
      }
      
      //parsedracers.map((racer) => {return (racer.lapmarkings.length> 0 ? racer.lapmarkings.map( (log) => (log.time = new Date(log.time)))
      console.log(parsedlogLaps)

      props.setRacers(parsedracers)
      props.setlogLaps(parsedlogLaps)
      props.setRaceSettings(parsedraceSettings)
   }
  function saveToLocalStorage() {
    localStorage.setItem("logLaps", JSON.stringify(props.logLaps));
    localStorage.setItem("racers", JSON.stringify(props.racers));
    localStorage.setItem("raceSettings", JSON.stringify(props.raceSettings));  
  }

  function createCards(racers) {
    const items = racers.sort((a, b) => sortComparator(a, b)).map((post, index) => createOneCard(post, index))

    return (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Tooltip title="Sortera efter startnummer"><Button color="inherit" onClick={(event) => setThesortField("number")}> <FontAwesomeIcon icon={sortDirection == 1 ? faSortNumericAsc : faSortNumericDesc} size="lg" /> </Button></Tooltip>
              <Tooltip title="Sortera efter beräknad varvning"><Button color="inherit" onClick={(event) => setThesortField("next")}><FontAwesomeIcon icon={faArrowDown} /><FontAwesomeIcon icon={faBinoculars} size="lg" /> </Button></Tooltip>
              <Tooltip title="Sortera efter namn"><Button color="inherit" onClick={(event) => setThesortField("name")}><FontAwesomeIcon icon={sortDirection == 1 ? faSortAlphaAsc : faSortAlphaDesc} size="lg" /></Button></Tooltip>
              <Tooltip title="Nollställ"><Button color="inherit" onClick={restartAllRacers}>Nollställ</Button></Tooltip>
              <Tooltip title="Masstart"><Button color="inherit" onClick={masStart}>Masstart</Button></Tooltip>
              <Tooltip title="Spara"><Button color="inherit" onClick={saveToLocalStorage}>Spara</Button></Tooltip>
              <Tooltip title="Ladda"><Button color="inherit" onClick={loadFromLocalStorage}>Ladda</Button></Tooltip>
            </Toolbar>
          </AppBar>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Grid container rowSpacing={0.2} columnSpacing={0.2}>
            {items}
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
  //  {
//      field: 'id',
      //headerName: 'id',
      //width: 100,
      //editable: false,
      //align: 'right',
      //headerAlign: 'center',
    //},
    {
      field: 'racerID',
      headerName: 'Tävlande',
      width: 190,
      editable: false,
      align: 'right',
      headerAlign: 'center',
      valueGetter: (params) => { const theRacer = props.racers.find((racer) => racer.id == params.value); return '#' + theRacer.number + ' ' + theRacer.name }
    },
    {
      field: 'time',
      headerAlign: 'center',
      headerName: 'Tidpunkt',
      align: 'center',
      width: 120,
      editable: false,
      valueGetter: (params) => { return params.value.toISOString().slice(11, 19) }
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
    const id = setInterval(() => (setCount((oldCount) => oldCount + 1)), 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <>
    DELTED!!!!!!!!!!!
      {createCards(props.racers)}
      <div>
        <DataGrid
          initialState={{            
            sorting: { sortModel: [{ field: 'time', sort: 'desc' }], },           
          }}
          editMode="row"
          rows={props.logLaps}
          columns={columns}
        />
      </div>
    </>
  );
}

