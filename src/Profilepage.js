import { CheckCircle } from '@mui/icons-material';
import Nfc from "@mui/icons-material/Nfc";
import { Button, Container, IconButton, Paper, Tooltip } from '@mui/material';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { doc, getDoc } from "firebase/firestore";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CardSingleRaceNew from './CardSingleRaceNew';
import { loadSingleRaceById, loadSingleRacerByID, saveUserToDataBase } from './Database';
import { db } from './firebase';
import { createResultsLink, deepClone, isValidSerial } from './myUtilities';
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import PhoneMissedIcon from '@mui/icons-material/PhoneMissed';
import ListIcon from '@mui/icons-material/List';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Link } from 'react-router-dom';

import { Tab } from '@mui/material';
import { Tabs } from '@mui/material';
export default function Profilepage() {

  function onClickSave() {
    const newRacer = deepClone(racer)
    newRacer.name = newRacer.givenname.trim() + ' ' + newRacer.familyname.trim()
    saveUserToDataBase(newRacer)
    setRacer(newRacer)
  }

  const [NFCReadMessage, setNFCReadMessage] = useState('')
  const [racer, setRacer] = useState(null)
  const [allAvailableRaces, setAllAvailableRaces] = useState([])
  const [nfcState, setnfcState] = useState('unavail');
  const [needsReload, setNeedsReload] = useState(true);
  const [dataWasLoaded, setDataWasLoaded] = useState(false);
  const [viewSelected, setViewSelected] = useState(0);
  const [anythingChanged, setAnythingChanged] = useState(false)

  async function ScannerWorker() {
    try {
      const ndef = new window.NDEFReader();
      setnfcState('scanning')
      await ndef.scan().then(() => {
        console.log("Scan started successfully.");
        ndef.onreadingerror = (event) => { console.log("Error! Cannot read data from the NFC tag.",); };
        ndef.onreading = async ({ message, serialNumber }) => { setAnythingChanged(true);setNFCReadMessage(serialNumber); setnfcState('free'); await new Promise((resolve) => setTimeout(resolve, 1000)); };
      }).catch((error) => {
        setnfcState('error');
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      setnfcState('error');
    }
  }

  const location = useLocation();
  const racerID = location.pathname.split('profile/').pop()

  useEffect(() => {
    console.log('Entering useeffect in profile page')
    let helper = []
    if (racerID && racerID.length) {
      const fetchDataInSeries = async () => {
        try {
          /*
            let userData = []
            const userRef = doc(db, 'racers', racerID);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists) {
              userData = snapshot.data();
            }
            */

          const userData = await loadSingleRacerByID(racerID)

          console.log('Loaded user info', userData)
          let raceList = []
          let raceData = []
          for (const docID of userData.participatedin) {
            raceData = await loadSingleRaceById(docID)
            if (raceData) { raceList = [...raceList, raceData] }
            /*const raceRef = doc(db, 'races', docID);
            const snapshot = await getDoc(raceRef);
            if (snapshot.exists) {
              const raceData = snapshot.data();
              raceList = [...raceList, raceData]
            }
            console.log('Loaded races', raceList)*/
          }
          setRacer(userData)
          setAllAvailableRaces(raceList);
          console.log(allAvailableRaces)
        }
        catch (error) { console.error('Error fetching data:', error); };
      }
      fetchDataInSeries();
    }

    if (('NDEFReader' in window)) {
      setnfcState('avail')
      ScannerWorker()
    }
    else {
      setnfcState('unavail')
      console.log('No NFC reader available')
    }
    return () => { setnfcState('free') }
  }, [NFCReadMessage, needsReload])



  function findResult(race, racer) {
    let pos = ''
    console.log(race,racer)
    for (let index = 0; index < race.results.length; index++) {
      pos = race.results[index].results.indexOf(racer.id)
      if (pos > -1) {
        return [pos+1, race.results[index].class]
        break
      }      
    }
    return [null, null]
  }

  function tableResults(races, racer) {

    console.clear()
    let results = []
    let place = 0
    let className = ''
    for (let index = 0; index < races.length; index++) {
        [place, className] = findResult(races[index], racer)
        results = [...results, {
          id: races[index].id,
          name:races[index].name, 
          date:races[index].date, 
          class: className, 
          place: place}]        
    }

    results.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    return (
      <TableContainer component={Paper}>
        <Table >
      <TableHead>
        <TableRow>
          <TableCell align="right">Tävling</TableCell>
          <TableCell align="right">Datum</TableCell>
          <TableCell align="right">Klass</TableCell>
          <TableCell align="right">Placering</TableCell>          
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map((row) =>  <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
          <TableCell component="th" scope="row" align="right">
         <Link style={{textDecoration: 'none'}} to={createResultsLink(row.id)} >{row.name}</Link>                      
            
            </TableCell>
          <TableCell align="right">{row.date}</TableCell>
          <TableCell align="right">{row.class}</TableCell>
          <TableCell align="right">{row.place}</TableCell>
        </TableRow>)}
      </TableBody>
    </Table></TableContainer>)
  }


  return (
    <>
      <Container >
        <Grid paddingTop={'0.9rem'} container spacing={1} justifyContent="center" alignItems="left">
          <Grid item xs={12} sm={6}>
            <Paper>
              <TextField
                key='givenname'
                onChange={(e) => {setAnythingChanged(true);setRacer({ ...racer, givenname: e.target.value })}}
                required
                value={(racer && racer.givenname) || ''}
                id="givenname"
                name="givenname"
                label="Förnamn"
                fullWidth
                autoComplete="given-name"
                variant="outlined"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper>
              <TextField
                key='familyname'
                onChange={(e) => {setAnythingChanged(true);setRacer({ ...racer, familyname: e.target.value })}}
                value={(racer && racer.familyname) || ''}
                id="familyname"
                name="familyname"
                label="Efternamn"
                fullWidth
                autoComplete="family-name"
                variant="outlined"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper>
              <TextField
                key='yearofbirth'
                onChange={(e) => {
                  if (e.target.value.match(/[^0-9]/)) {
                    e.preventDefault();
                  } else {
                    setRacer({ ...racer, yob: e.target.value })
                    setAnythingChanged(true);
                  }                  
                }}
                value={(racer && racer.yob) || ''}
                id="yearofbirt"
                name="yearofbirt"
                label="Födelseår"
                fullWidth
                autoComplete="year-of-birth"
                variant="outlined"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper>
              <Tooltip
                key='rfidtip'
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 500 }}
                title="Om du använder en NFC-kapabel telefon eller liknande kan du placera denna över en RFID-tag och läsa in serienumret"
              >
                <TextField
                  onChange={(e) =>{setAnythingChanged(true); setRacer({ ...racer, rfid: e.target.value })}}
                  id="nfc"
                  name="nfc"
                  label={(nfcState === 'unavail' ? 'NFC-läsare ej tillgänglig' : (nfcState === 'avail' || nfcState === 'free' || nfcState === 'scanning') ? 'Placera din tag vid din NFC-läsare' : 'Något gick snett i din NFC-läsare')}
                  value={(racer && racer.rfid) || ''}
                  //  onChange={(e) => setNFCReadMessage(e.target.value)}
                  placeholder={nfcState === 'unavail' ? 'NFC-läsare ej tillgänglig' : (nfcState === 'avail' || nfcState === 'free' || nfcState === 'scanning') ? 'Placera din tag vid din NFC-läsare' : 'Något gick snett i din NFC-läsare'}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        tabIndex={-1}
                        edge="end"
                      >
                        {isValidSerial((racer && racer.rfid) || '') ? <CheckCircle color='success' /> : <Nfc />}
                      </IconButton>
                    ),
                  }}
                />
              </Tooltip>
            </Paper>
          </Grid>

        
        { (anythingChanged==true) ?  
        <Grid item xs={12} sm={12}>
            <Paper>
              <Button onClick={onClickSave} variant="contained" fullWidth color='primary'>Spara</Button>
            </Paper>
          </Grid>: ''}
        </Grid> 

        <Grid item xs={12}>
          <Tabs value={viewSelected} onChange={(e, index) => setViewSelected(index)}>
            <Tab icon={<DashboardIcon />} label="" />
            <Tab icon={<ListIcon />} label="" />
          </Tabs>
        </Grid>

        <Grid container paddingTop={'1rem'} spacing={1} justifyContent="left" alignItems="left">
          {(viewSelected === 0) ? allAvailableRaces.map((aRace, index) => { return <CardSingleRaceNew raceID={aRace.id} /> }) : ''}

          {(viewSelected === 1) ? tableResults(allAvailableRaces, racer) : ''}
        </Grid>
      </Container>
    </>
  );
}
//{allAvailableRaces.map((aRace, index) => { return <CardSingleRaceNew  state={aRace.id || ''}/> })
// {(allAvailableRaces) ? allAvailableRaces.map((aRace, index) => { return <h1>{aRace.id}</h1> }) : ''}
// {allAvailableRaces.map((aRace, index) => { return <CardSingleRace needsReload = {false} setNeedsReload={null} racers={null} setRacers={[]} raceSettings={[]} setRaceSettings={[]} index={0} race={aRace} /> })}