import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Papa from 'papaparse';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UpLoadIcon from '@mui/icons-material/Upload';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs } from "firebase/firestore";
import { stringSimilarity } from "string-similarity-js";
import { saveRaceToDataBase, saveRacerListToDataBase, saveUserToDataBase } from './Database';
import { db } from './firebase';
import { deepClone, uniqueID } from './myUtilities';

export default function Importrace() {

  //const [csvLink, setcsvLink] = useState('')

  const [csvLink, setcsvLink] = useState('');
  const [updated, setUpdated] = useState(csvLink);
  const [importedRace, setImportedRace] = useState([])
  const [defaultClub, setdefaultClub] = useState([])
  const [eventName, setEventName] = useState([])
  const [eventOrganizer, setEventOrginazier] = useState('')
  const [eventComment, setEventComment] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [racers, setRacers] = useState([])
  const [needsReload, setNeedsReload] = useState(true)
  const [selectionDetected, setSelectionDetected] = useState([])

  function onIconClick(e, params, index, indexinner) {
    const rowIndex = importedRace.findIndex((racer) => params.row.id == racer.id)
    const clonedRacers = deepClone(importedRace)
    const before = clonedRacers[rowIndex].recommended[indexinner]
    clonedRacers[rowIndex].recommended.fill(false)
    clonedRacers[rowIndex].recommended[indexinner] = !before
    setImportedRace(clonedRacers)
  }

  function matlabsort(arr) {
    const indices = [...arr.keys()];
    const sorted = [...arr].sort((a, b) => b - a)
    const sortedIndices = indices.sort((a, b) => arr[b] - arr[a]);  
    return [sorted, sortedIndices]
  }

  const handleChangeDefaultClub = (event) => {
    setdefaultClub(event.target.value);
  };

  const handleChangeURL = (event) => {
    setcsvLink(event.target.value);
    console.log(event)
  };
  const handleClickURL = () => {
    setUpdated(csvLink);

    //const url = csvLink
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGie44oQfCW96FNyD9COcIjJZwAD_n8Q2b7gv8QvNmF9MU2VkQD5-0CVOXLZ3DRbDH0XxosZTyIuTE/pub?gid=888716565&single=true&output=csv'
    const result = Papa.parse(url, {
      download: true,
      dynamicTyping: true,
      download: true,
      header: true,
      comments: "*=",
      complete: function (results) {
        {
          if (results) {
            let converted = cleanUpImportedRaceParticipantList(results);
            converted = createFakeLapTimesOnImported(converted)

            if (converted[0]?.id) {
              // Ok we seem to have a list of racers. Now perform a match against the user data base            
         /*      const nameSet = new Set(racers.map((obj) => obj.name));
              const indices = converted.map((objX) => (
                nameSet.has(objX.name) ? racers.findIndex((objY) => objX.name === objY.name) : -1
              )); */

              let closeIndex = converted.map(() => []);
              let metric = converted.map(() => []);
              converted.forEach((val, ind) => converted[ind].metric = []);
         
              for (let index1 = 0; index1 < converted.length; index1++) {
                const name1 = converted[index1].name//.replaceAll(' ','');
                for (let index2 = 0; index2 < racers.length; index2++) {
                  const name2 = racers[index2].name//.replaceAll(' ','');  
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
                m.forEach((s, j) => {
                  if ((s == 1 && m.length == 1)) {
                    mrecommended[j] = true
                    grade[j] = 'very likely'
                    color[j] = 'success'
                  } else {
                    if ((s > 0.75 && m.length == 1) || (s == 1 && m.length > 1)) {
                      mrecommended[j] = true
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
                  //converted[i].matchingid = [];
                  //converted[i].usematch = false;
                  //converted[i].similiarnames = []
                  //converted[i].metric = [];
                }
              }
              )                            
              //indices.forEach((index, i) => { if (index !== -1) { converted[i].match = racers[index].id; converted[i].usematch = true; converted[i].matched = racers[index].name } else { converted[i].match = ''; converted[i].usematch = false; converted[i].matchedname = '' } })
              setSelectionDetected(selectionDetected)
              setImportedRace(converted)
            }

          }
          else { console.log('Hmm', results) }
        }
      }
    })
  };




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

  function theClass(x) {
    return x.class
  }

  useEffect(() => { console.log('Useeffect in import'); if (needsReload) { fetchRacers() } }, [db, needsReload]);

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
  }

  function importToRoine() {

    // We now have a racing list and a race, let's give them identifiers
    const raceListID = uniqueID()
    const raceID = uniqueID()
    // First go through and check which are associated, and update ID on those
    const racingList = deepClone(importedRace)

    for (let index = 0; index < racingList.length; index++) {
      if (racingList[index].usematch) {       
        racingList[index].id = racingList[index].match
      } else {
        // Hello there, new person. First event ever....
        racingList[index].participatedin = [raceID]
      }
    }

    // Create classes for the race
    const theClassNames = [...new Set(racingList.map((x) => (theClass(x))))]

    // Create classes for the race  
    // FIXME compute laps
    let theClasses = []
    for (let index = 0; index < theClassNames.length; index++) {
      theClasses.push({ class: theClassNames[index], laps: 1 })
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
    }

    // FIXME Generate fake laps
    for (let index = 0; index < racingList.length; index++) {
      // Saving as 1970 + racetime...Important is delta
      let startEvent = { id: uniqueID(), time: new Date(0) }
      let finishEvent = { id: uniqueID(), time: new Date(0 + 1000 * racingList[index].totaltime) }
      racingList[index].lapmarkings = [startEvent, finishEvent]
    }

    saveRacerListToDataBase(racingList, raceListID)
    saveRaceToDataBase(race)

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
        if (saveUserToDataBase(theAlreadyAvailableRacer)) { console.log('Updated a user', racer) } else { console.log('updating failed') }
      } else {
        if (saveUserToDataBase(racer)) { console.log('saved a new a user', racer) } else { console.log('savings failed') }
      }
    })
    setNeedsReload(true)
  }





  function cleanUpImportedRaceParticipantList(results) {
    let converted = results.data.map(({ Nummer, ...rest }) => ({ number: Nummer, ...rest, }));
    converted = converted.map(({ Klass, ...rest }) => ({ class: Klass, ...rest, }));
    converted = converted.map(({ Klubb, ...rest }) => ({ club: (Klubb || ''), ...rest, }));
    converted = converted.map(({ RFID, ...rest }) => ({ rfid: (RFID || ''), ...rest, }));
    converted = converted.map(({ Namn, ...rest }) => ({ name: Namn, ...rest, }));
    converted = converted.map(({ Förare, ...rest }) => ({ name: Förare, ...rest, }));
    // Add a TEMPORARY id!
    converted = converted.map((e) => ({ id: uniqueID(), ...e }));
    converted.participatedin = []
    return converted;
  }

  function createFakeLapTimesOnImported(results) {
    let converted = results
    converted.forEach((element) => {
      const [hours, minutes, seconds] = element['Totaltid'].split(':').map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      element['averagelaptime'] = totalSeconds / element['Antal varv'];
      element['totaltime'] = totalSeconds;
      element['numberoflaps'] = element['Antal varv'];
    });
    return converted;
  }


  const columns = [
    /*
    {
      field: 'id',
      headerName: 'Temporary ID',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },*/
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
      field: 'totaltime',
      headerName: 'Totaltid (s)',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'averagelaptime',
      headerName: 'Snittvarv (s)',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'usematch',
      headerName: 'Link to database match',
      width: 100,
      type: 'boolean',
      editable: true,
      align: 'right',
      headerAlign: 'center',

      renderCell: (params) => {
        return params.value ? (
          <CheckIcon
            style={{
              color: '#00ff00',
            }}
          />
        ) : (
          <CloseIcon
            style={{
              color: '#eeeeee',
            }}
          />
        );
      }
    },
    {
      field: 'similiarnames',
      flex: 1,
      headerName: 'Liknande namn i databas',
      width: '100%',
      renderCell: (params, index) => (params.value.length > 0 ? params.value.map((aName, indexinner) => (<><Tooltip title={'Name match certainty ' + Math.round(params.row.metric[indexinner] * 100) + '%'}><Chip color={params.row.color[indexinner]} avatar={<Avatar> {params.row.recommended[indexinner] ? <CheckIcon /> : ''} </Avatar>} maxWidth={100} onClick={(e, v) => { onIconClick(e, params, index, indexinner) }} label={aName} as={Link} /></Tooltip></> : '') ) : ''),
    editable: false,
    align: 'left',
    headerAlign: 'center',
    },
    /*
    {
      field: 'match',
      headerName: 'match',
      width: 100,
      editable: false,
      align: 'right',
      headerAlign: 'center',
    },*/
  ]

function handleOnDelete(e) {
  console.log(e)
}















return (
  <>
    <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}>
      <InputBase
        onFocus={(e) => { e.target.select(); }}
        onChange={handleChangeURL}
        value={csvLink}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Link to google sheets CSV"
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton onClick={handleClickURL} color="primary" sx={{ p: '10px' }}>
        <UpLoadIcon />
      </IconButton>
      <InputBase
        onChange={handleChangeDefaultClub}
        value={defaultClub}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Default club if missing"
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton onClick={(e) => { setImportedRace(importedRace.map((x) => ({ ...x, club: (x.club || defaultClub) }))) }} color="primary" sx={{ p: '10px' }}>
        <CheckIcon />
      </IconButton>
    </Paper>
    <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}>      
      <TextField onChange={(e) => setEventName(e.target.value)} value={eventName} placeholder="Give this import a name" />
      <TextField type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)} />
      <Button onClick={importToRoine} disabled={importedRace.length == 0}>Import to Roine!</Button>
    </Paper>
    {importedRace.length > 0 ? <DataGrid columns={columns} rows={importedRace} processRowUpdate={processRowUpdate} /> : ''}
  </>
);








  
}

