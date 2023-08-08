import CheckIcon from '@mui/icons-material/Check';
import UpLoadIcon from '@mui/icons-material/Upload';
import Checkbox from '@mui/joy/Checkbox';
import { Container } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs } from "firebase/firestore";
import Papa from 'papaparse';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { stringSimilarity } from "string-similarity-js";
import { saveRaceToDataBase, saveSeriesToDataBase, saveRacerListToDataBase, saveUserToDataBase } from './Database';
import { db } from './firebase';
import { capitalizeFirstLetter, deepClone, matlabsort, normalizeRace, uniqueID } from './myUtilities';
import { Grid } from '@mui/material';
import { Autocomplete } from '@mui/material';


export default function Importrace() {

  const [csvLink, setcsvLink] = useState('');
  const [importedRace, setImportedRace] = useState([])
  const [defaultClub, setdefaultClub] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventOrganizer, setEventOrginazier] = useState('')
  const [eventComment, setEventComment] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [racers, setRacers] = useState([])
  const [oldSeries, setOldSeries] = useState('')
  const [selectedOldSeries, setSelectedOldSeries] = useState([])

  const [needsReload, setNeedsReload] = useState(true)
  const [selectionDetected, setSelectionDetected] = useState([])
  const [raceSeriesHistory, setSetSeriesHistory] = useState([])
  const [createNewUsers, setCreateNewUsers] = useState(true)
  const [matchUsers, setMatchUsers] = useState(true)

  // User clicks on a racer chip to select/deselect
  function onIconClick(e, params, index, indexinner) {
    const rowIndex = importedRace.findIndex((racer) => params.row.id == racer.id)
    const clonedRacers = deepClone(importedRace)
    const before = clonedRacers[rowIndex].recommended[indexinner]
    // At most one can be check so clear everything
    clonedRacers[rowIndex].recommended.fill(false)
    // And flip this choice 
    clonedRacers[rowIndex].recommended[indexinner] = !before
    setImportedRace(clonedRacers)
  }


  const handleChangeDefaultClub = (event) => {
    setdefaultClub(event.target.value);
  };

  const handleChangeURL = (event) => {
    setcsvLink(event.target.value);
    console.log(event)
  };

  const getOldSeriesLabel = (option) => option.name || '';
  const getOldSeriesSelected = (option, value) => option.id === value.id;
  const handleOnChangeOldSeries = (event, value) => {
    setSelectedOldSeries(value)
    if (value) {
      // Do!
    } else {
    }
  }







  const handleClickURL = () => {

    // setUpdated(csvLink);
    const url = csvLink
    //const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGie44oQfCW96FNyD9COcIjJZwAD_n8Q2b7gv8QvNmF9MU2VkQD5-0CVOXLZ3DRbDH0XxosZTyIuTE/pub?gid=888716565&single=true&output=csv'
    const result = Papa.parse(url, {
      download: true,
      dynamicTyping: true,
      download: true,
      header: true,
      comments: "*=",
      skipEmptyLines: true,
      complete: function (results) {
        {
          if (results) {
            console.clear()
            console.log('Coming in', results)
            let converted = cleanUpImportedRaceParticipantList(results);

            console.log('Cleaned up', converted)
            converted = createFakeLapTimesOnImported(converted)

            console.log('Faked up', converted)
            if (converted[0]?.id) {

              let closeIndex = converted.map(() => []);
              let metric = converted.map(() => []);
              converted.forEach((val, ind) => converted[ind].metric = []);

              for (let index1 = 0; index1 < converted.length; index1++) {
                const name1 = converted[index1].name.replaceAll('é', 'e');
                for (let index2 = 0; index2 < racers.length; index2++) {
                  const name2 = racers[index2].name.replaceAll('é', 'e');
                  let s = stringSimilarity(name1, name2)
                  if (s > 0.6) {
                    closeIndex[index1].push(index2)
                    metric[index1].push(s)
                    converted[index1].metric.push(s)
                  }
                }
                if (metric[index1].length > 1) {
                  let indexOfOnes = metric[index1].reduce((acc, x, index) => {
                    if (x == 1) {
                      acc.push(index);
                    }
                    return acc;
                  }, []);
                  if (indexOfOnes.length > 0) {
                    closeIndex[index1] = indexOfOnes.map((v, i) => closeIndex[index1][v])
                    metric[index1] = indexOfOnes.map((v, i) => metric[index1][v])
                  }
                }
              }

              // Now sort according to metric            
              metric.forEach((m, index) => {

                const [sorted, perms] = matlabsort(m)
                metric[index] = [...sorted]
                let vv = [...closeIndex[index]].slice()
                closeIndex[index] = vv.map((v, i) => vv[perms[i]])
              })

              let recommended = Array(metric.length).fill([])
              metric.forEach((m, i) => {
                let mrecommended = Array(m.length).fill(false)
                let grade = Array(m.length).fill('')
                let color = Array(m.length).fill('')
                let alreadySet = false
                m.forEach((s, j) => {
                  if ((s == 1 && m.length == 1)) {
                    mrecommended[j] = true && !alreadySet
                    alreadySet = true
                    grade[j] = 'very likely'
                    color[j] = 'success'
                  } else {
                    if (((s > 0.75 && m.length == 1) || (s == 1 && m.length > 1))) {
                      mrecommended[j] = true && !alreadySet
                      alreadySet = true
                      grade[j] = 'likely'
                      color[j] = 'info'
                    } else { mrecommended[j] = false; grade[j] = 'confused'; color[j] = 'warning' }
                  }
                })
                converted[i].recommended = mrecommended
                converted[i].grade = grade
                converted[i].color = color
                recommended[i] = mrecommended
              })
              converted = deepClone(converted)
              closeIndex.forEach((index, i) => {
                if (index !== []) {
                  converted[i].matchingid = index.map((close) => racers[close].id);
                  converted[i].usesimilar = true;
                  converted[i].similiarnames = index.map((close) => racers[close].name);
                  converted[i].metric = metric[i]
                } else {
                }
              }
              )
              setSelectionDetected(selectionDetected)
              setImportedRace(converted)
            }

          }
          else { console.log('Hmm', results) }
        }
      }
    })
  };


  function clearPage() {
    setImportedRace([])
    setSelectionDetected([])
    setRaceDate('')
    setEventComment('')
    setEventName('')
    setEventOrginazier([])
  }

  const processRowUpdate = (newRow: any) => {

    if (newRow.matchedname === '' && newRow.match === '') {
      // Nono, cannot edit that one. Show be stopped earlier....
      newRow.usematch = false
      return newRow
    }
    console.log(newRow)
    const updatedRow = { ...newRow, isNew: false };
    let newData = deepClone(importedRace);
    var index = newData.map(function (e) { return e.id; }).indexOf(newRow.id);
    for (const key in newRow) {
      if (newRow.hasOwnProperty(key)) {
        newData[index][key] = newRow[key];
      }
    }
    setImportedRace(newData)
    return updatedRow;
  };

  // Some point where it is tricky to write x.class as class is restricted
  // I.e x is a racer, and we are asking about its racing class
  function theClass(x) {
    return x.class
  }

  useEffect(() => {
    console.log('Useeffect in import');
    if (needsReload) { fetchRacers() }
  },
    [db, needsReload]);

  const fetchRacers = async () => {
    await getDocs(collection(db, "racers"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log('Loaded racers!');
        setRacers(newData)
        console.log(newData);
        setNeedsReload(false)
      }
      )
    await getDocs(collection(db, "series"))
      .then((querySnapshot) => {
        console.log('sdfs')
        const newDataSeries = querySnapshot.docs.map((doc) => { console.log(doc); return ({ ...doc.data(), id: doc.id }) });
        console.log('Loaded series!');
        setOldSeries(newDataSeries)
        console.log(newDataSeries);
        setNeedsReload(false)

      }
      )
  }

  function importToRoine() {

    console.clear()
    console.log(importedRace)
    // We now have a racing list and a race, let's give them identifiers
    const raceListID = uniqueID()
    const raceID = uniqueID()

    // First go through and check which are associated, and update ID on those
    const racingList = deepClone(importedRace)
    for (let index = 0; index < racingList.length; index++) {
      let wantedUser = racingList[index].recommended.findIndex((x) => x == true)
      if (wantedUser > -1) {
        racingList[index].id = racingList[index].matchingid[wantedUser]
        racingList[index].matched = true
      } else {
        // Hello there, new person. First event ever....
        racingList[index].participatedin = [raceID]
        racingList[index].matched = false
      }
    }
    console.log('After updating match info', racingList)

    // Find out given and family name  
    racingList.forEach((racer, index) => {
      const nameParts = racer.name.split(/\s+/);
      const givenName = capitalizeFirstLetter(nameParts[0]);
      const familyName = capitalizeFirstLetter(nameParts[1] || '');
      racingList[index].givenname = givenName
      racingList[index].familyname = familyName
    })

    // Create classes for the race
    const theClassNames = [...new Set(racingList.map((x) => (theClass(x))))]

    // Create classes for the race  
    // FIXME compute laps
    let theClasses = []
    if (theClassNames.length === 0) {
      theClasses.push({ name: '', laps: 1 })
    } else {
      for (let index = 0; index < theClassNames.length; index++) {
        theClasses.push({ name: theClassNames[index], laps: 1 })
      }
    }


    // Time to setup a race too
    const race = {
      id: raceID,
      racerlistid: raceListID,
      name: eventName,
      date: raceDate,
      state: 'finished',
      type: 'Lap',
      start: 'Individual',
      datecreate: (new Date()).toISOString(),
      eventComment: '',
      classes: theClasses,
      seriesid: (selectedOldSeries ? selectedOldSeries.id : '')
    }

    // FIXME Generate fake laps
    for (let index = 0; index < racingList.length; index++) {
      racingList[index].lapmarkings = ''
    }

    let theseMembers = []
    let temp = []
    let resultList = []
    let classResults = []
    if (!racingList[0].numberoflaps && racingList[0].place) {
      // This is a race without any detailed info. All we have is the position
      race.classes.forEach((theClass) => {
        theseMembers = racingList.filter((racer) => racer.class === theClass.name)
        console.log(theseMembers)
        temp = [...theseMembers]
        temp.sort((racer1, racer2) => (racer1.place - racer2.place))
        console.log(temp)
        resultList = temp.map((racer) => racer.id)
        classResults.push({ class: theClass.name, results: resultList })
      })
    } else {
      // Compute results list and save in race. This is a derived property but things
      // get a lot easier if we have this precomputed on stored races  
      //temp.sort((racer1,racer2) => (racer2.numberoflaps-racer1.numberoflaps) || (racer1.totaltimeinmilliseconds-racer2.totaltimeinmilliseconds));
      //const resultList = temp.map((racer) => racer.id)
      console.log('Computing results ************************')
      race.classes.forEach((theClass) => {
        theseMembers = racingList.filter((racer) => racer.class === theClass.name)
        temp = [...theseMembers]
        temp.sort((racer1, racer2) => (racer2.numberoflaps - racer1.numberoflaps) || (racer1.totaltimeinmilliseconds - racer2.totaltimeinmilliseconds));
        resultList = temp.map((racer) => racer.id)
        classResults.push({ class: theClass.name, results: resultList })
      })
    }
    console.log(classResults)
    race.results = classResults

    // Some cleaning refactor this
    racingList.forEach((element) => {
      element['number'] = (element['number'] || [])
    })


    saveRacerListToDataBase(racingList, raceListID)
    saveRaceToDataBase(normalizeRace(race))

    // If we added the race to a series, we must update the seris
    if (selectedOldSeries) {
      if (selectedOldSeries?.eventid) {
        console.log('ADDED')
        selectedOldSeries.eventid = [...selectedOldSeries.eventid, raceID];
      } else {
        console.log('CREATED')
        selectedOldSeries.eventid = [raceID];
      }
      saveSeriesToDataBase(selectedOldSeries)
    }

    racingList.forEach((racer, index) => {
      if (racer.matched) {
        let theAlreadyAvailableRacer = deepClone(racers.filter((x) => (x.id == racer.id))[0])
        if (theAlreadyAvailableRacer.participatedin) {
          theAlreadyAvailableRacer.participatedin = [...theAlreadyAvailableRacer.participatedin, raceID]
        }
        else {
          // Should not be possible
          theAlreadyAvailableRacer.participatedin = [raceID]
        }
        if (saveUserToDataBase(theAlreadyAvailableRacer)) {
          //  console.log('Updated a user', racer)
        } else {
          // console.log('updating failed')
        }
      } else {
        if (saveUserToDataBase(racer)) {
          //  console.log('saved a new a user', racer)
        }
        else {
          console.log('savings failed')
        }
      }
    })

    setNeedsReload(true)
    clearPage()

  }







  function cleanUpImportedRaceParticipantList(results) {

    let converted = results

    converted = converted.data.map(({ Nummer, ...rest }) => ({ number: Nummer, ...rest, }));
    converted = converted.map(({ Klass, ...rest }) => ({ class: Klass, ...rest, }));
    converted = converted.map(({ Klubb, ...rest }) => ({ club: (Klubb || ''), ...rest, }));
    converted = converted.map(({ RFID, ...rest }) => ({ rfid: (RFID || ''), ...rest, }));
    converted = converted.map(({ Namn, ...rest }) => ({ name: Namn, ...rest, }));
    converted = converted.map(({ Förare, ...rest }) => ({ name: Förare, ...rest, }));
    converted = converted.map(({ Plats, ...rest }) => ({ place: Plats || '', ...rest, }));

    // This is embarrsing but I just can't get it. Papaparse adds columns with headers ''  
    let newone = []
    let element = []
    for (let index = 0; index < converted.length; index++) {
      element = converted[index]
      delete element[""]
      newone.push(element)
    }
    converted = newone

    // Add a TEMPORARY id (which will be permanent if new person)
    converted = converted.map((e) => ({ id: uniqueID(), ...e }));
    return converted;
  }

  function createFakeLapTimesOnImported(results) {
    let converted = results
    let totalMilliSeconds = 0; // Declare the variables outside the if...else block
    let numberOfLaps = 0; // Declare the variables outside the if...else block
    converted.forEach((element) => {
      if (element['Totaltid']) {
        const [hours, minutes, seconds] = element['Totaltid'].split(':').map(Number);
        totalMilliSeconds = 1000 * (hours * 3600 + minutes * 60 + seconds);
        numberOfLaps = element['Antal varv']
      } else {

      }
      element['averagelaptimeinmilliseconds'] = (totalMilliSeconds / element['Antal varv'] || []);
      element['totaltimeinmilliseconds'] = (totalMilliSeconds || []);
      element['numberoflaps'] = (element['Antal varv'] || [])
    })

    return converted;
  }


  const columns = [
    {
      field: 'number',
      headerName: 'Nummer',
      width: 70,
      editable: true,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Namn',
      width: 200,
      editable: true,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'class',
      headerName: 'Klass',
      width: 100,
      editable: true,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'club',
      headerName: 'Klubb',
      width: 100,
      editable: true,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'numberoflaps',
      headerName: 'Antal varv',
      width: 80,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'totaltimeinmilliseconds',
      headerName: 'Totaltid (s)',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'averagelaptimeinmilliseconds',
      headerName: 'Snittvarv (s)',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'similiarnames',
      flex: 1,
      headerName: 'Möjliga matchningar i Roine',
      width: '100%',
      renderCell: (params, index) => (params.value.length > 0 ? params.value.map((aName, indexinner) => (<>
        <Tooltip title={'Name match certainty ' + Math.round(params.row.metric[indexinner] * 100) + '%'}>
          <Chip size={'small'} clickable={true} color={params.row.color[indexinner]} avatar={
            <Avatar onClick={(e, v) => {
              onIconClick(e, params, index, indexinner)
              e.preventDefault()
              e.stopPropagation()
            }} >   {params.row.recommended[indexinner] ?
              <CheckIcon /> : ''}
            </Avatar>} onClick={(e) => {
              alert('Will show more details');
              e.preventDefault()
              e.stopPropagation()
            }
            } maxWidth={100} label={aName} as={Link} /><
          /Tooltip></> : '') ) : 'Ingen matchning'),

        editable: false,
        align: 'left',
        headerAlign: 'center',
    },
        ]

        return (
        <Container>
          <Grid paddingTop={'0.9rem'} container spacing={1} justifyContent="left" alignItems="left">

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}>
                <InputBase
                  onFocus={(e) => { e.target.select(); }}
                  onChange={handleChangeURL}
                  value={csvLink}
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Download public google sheets CSV (supply link)"
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton onClick={handleClickURL} color="primary" sx={{ p: '10px' }}>
                  <UpLoadIcon />
                </IconButton>
              </Paper>
            </Grid>





            <Grid item xs={12}>
              <Paper >
                <Autocomplete
                  key="connecttoseries"
                  id="connecttoseries"
                  fullWidth
                  getOptionLabel={getOldSeriesLabel}
                  isOptionEqualToValue={getOldSeriesSelected}
                  value={selectedOldSeries}
                  onChange={handleOnChangeOldSeries}
                  freeSolo={false}
                  autoComplete={true}
                  autoHighlight={true}
                  blurOnSelect={true}
                  options={oldSeries}
                  renderInput={(params) => { return <TextField  {...params} label="Koppla som del i serie" /> }}
                />
              </Paper>
            </Grid>



            <Grid item xs={12} md={6}>
              <Paper>
                <TextField width='100%' onChange={(e) => setEventName(e.target.value)} value={eventName} placeholder="Namn på tävling" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper >
                <TextField type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper>
                <Button onClick={importToRoine} disabled={importedRace.length == 0}>Import to Roine!</Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper>
                {importedRace.length > 0 ?
                  <DataGrid
                    columns={columns}
                    rows={importedRace}
                    processRowUpdate={processRowUpdate}
                    initialState={{
                      sorting: { sortModel: [{ field: 'number', sort: 'asc' }], },
                      columns: { columnVisibilityModel: { totaltimeinmilliseconds: false, averagelaptimeinmilliseconds: false }, }
                    }}
                  /> : ''
                }
              </Paper>
            </Grid>
          </Grid >
        </Container >
        );
}


        {/*
<Grid item xs={12} md={6}>
          <Paper>
            <InputBase
              onChange={handleChangeDefaultClub}
              value={defaultClub}
              placeholder="Default club if missing"
            />          
          </Paper>
        </Grid>
*/}