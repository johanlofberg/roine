import People from '@mui/icons-material/People';
import Person from '@mui/icons-material/Person';
import { Checkbox, List, ListItem, ListItemDecorator } from '@mui/joy';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import { FormControlLabel, Button, IconButton, TextField, Container } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { FaClock, FaDatabase, FaPlusSquare, FaRecycle, FaSave, FaUpload } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import Competitorlist from './Competitorlist';
import { loadAllRacerList, loadAllRaces, saveRaceToDataBase, saveRacerListToDataBase } from './Database';
import { db } from './firebase';
import { normalizeRacer, normalizeRacers, uniqueID, deepClone } from './myUtilities';
import { loadSingleRacerListByID } from './Database';
import { Grid, Paper } from '@mui/material';
import { FormControl } from '@mui/material';

const Createrace = (props) => {


    function createNewRacerList() {
        const defaultRacer = { id: uniqueID(), 'name': '?', number: 1, 'class': raceClasses[0].name, club: '?' }
        setLocalRacers([defaultRacer])
    }

    let possibleClasses = [
        { name: 'Bredd', laps: 1, active: true },
        { name: 'Motion', laps: 1, active: true },
        { name: 'Dam', laps: 1, active: true },
    ]

    const possibleRaceStarts = ['Individual', 'Individual (seeded)', 'Mass', 'Wave', 'Wave (seeded)']
    const possibleRaceStartsIcons = [<Person />, <Person />, <People />, <People />, <People />]

    const possibleRaceType = ['Lap', 'Time']
    const possibleRaceTypeIcons = [<FaRecycle />, <FaClock />]

    const [raceName, setRaceName] = useState('Ny tävling')
    const [raceID, setRaceID] = useState('')
    const [racerListID, setRacerListID] = useState('')
    const [raceStart, setRaceStart] = useState(possibleRaceStarts[0])
    const [raceType, setRaceType] = useState(possibleRaceType[0])
    const [raceDate, setRaceDate] = useState(new Date().toISOString().slice(0, 10))
    const [raceCreateDate, setRaceCreateDate] = useState('')
    const [raceClasses, setRaceClasses] = useState(possibleClasses)
    const [racersHaveBeenReset, setRacersHaveBeenReset] = useState(false)
    const [localRacers, setLocalRacers] = useState([])
    const [oldRacerList, setOldRacerList] = useState([])
    const [oldRace, setOldRace] = useState([])
    const [selectedOldRacerList, setSelectedOldRacerList] = useState(null);
    const [selectedOldRace, setSelectedOldRace] = useState(null);

    function handleSubmit(event) {
        event.preventDefault();
    }

    function importRacersFromCSV() {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqgUYoZ9hsSOCuspxnZBsR9m5DTWGEigJWd8OiOgWdDG_f8IQ2USj19ZwaM34V6u7kT8zLX2furyZs/pub?gid=0&single=true&output=csv'
        const result = Papa.parse(url, {
            download: true,
            dynamicTyping: true,
            download: true,
            header: true,
            comments: "*=",
            complete: function (results) {
                //console.log(results)
                setLocalRacers(normalizeRacers(results.data))
            }
        })
        //console.log(result)
    }
   
    function saveRace(event) {
        event.preventDefault();
        // Create a new race from data in form        
        let didWeManageTosSaveParticpants = false
        let attachedRacerListID = ''
        if (racerListID || localRacers.length > 0) {
            // We have a racer list, so first create an id for this, and save
            // this list of racers as a list coupled to this race                    
            attachedRacerListID = racerListID || uniqueID()
            //console.log('We have a racer list')
            didWeManageTosSaveParticpants = saveRacerListToDataBase(normalizeRacers(localRacers), attachedRacerListID)
            setRacerListID(attachedRacerListID)
            //console.log('And it was set to', attachedRacerListID)
        }
        const theRace = {
            // Importantly, only create a new when built from scratch
            id: raceID || uniqueID(),
            datecreate: raceCreateDate || (new Date()).toISOString(),
            state: 'planning',
            // These are controlled in the form
            name: raceName,
            classes: raceClasses,
            type: raceType,
            start: raceStart,
            date: raceDate,
            racerlistid: attachedRacerListID,
            logid: uniqueID(),
        };

        let didWeManageTosSaveRace = saveRaceToDataBase(theRace)
        if (didWeManageTosSaveParticpants && didWeManageTosSaveRace) {
            //props.setRaceSettings(theRace)           
            //setLocalRacers(normalizeRacers(localRacers))
        }
        setRaceID(theRace.id)
    }

    function switchActiveClass(e, index) {
        const newRaceClasses = [...raceClasses];
        newRaceClasses[index].active = e.target.checked;
        setRaceClasses(newRaceClasses);
    }

    function updateLapNumber(value, index) {
        let items = [...raceClasses];
        let item = { ...items[index] };
        item.laps = value;
        items[index] = item;
        setRaceClasses(items)
    }


    const location = useLocation();
    ////console.log(props, " props");
    ////console.log(location, " useLocation Hook");

    useEffect(() => {
        loadAllRaces().then((races) => {            
            const cleanedUp = races.filter((aRace) => (aRace.name !==''))          
            setOldRace(cleanedUp)
            //setOldRacerList(races.map((race) => ({ ...race, name: ((race.name && race.name.length > 0) ? race.name : 'Ej namngiven tävling') })))
        }
        )
    }, []);


    // Autocomplet for loading old lists
    const getOldRacerListLabel = (option) => option.name;
    const getOldRacerListSelected = (option, value) => option.id == value.id;
    const handleOnChangeRacerList = (event, value) => {
        setSelectedOldRacerList(value);
        if (value) {
            console.clear()
            const racerListID = value.racerlistid
            if (racerListID && racerListID.length > 0) {
                //console.log(`Selected ${racerListID}`)
                loadSingleRacerListByID(racerListID)
                    .then((data) => {
                        // Convert to an array, and clean away garbage regarding old laptimes etc
                        let dataArray = Object.values(data)
                        dataArray = dataArray.map(({ id, name, class: className, number }) => ({ id, name, class: className }));
                        setLocalRacers(dataArray);
                        //console.log(dataArray)
                    })
            }
        } else {
            // Handle case when no option is selected (optional)
            //console.log('No option selected');
        }
    }

    // Autocomplet for loading old race settings
    const getOldRaceLabel = (option) => option.name;
    const getOldRaceSelected = (option, value) => option.id === value.id;
    const handleOnChangeRace = (event, value) => {
        setSelectedOldRace(value);
        if (value) {                        
           if (value?.classes && value.classes.length > 0){
                console.log(raceClasses)
                console.log(value.classes)             
                setRaceClasses(value.classes.map((aClass) => ({...aClass, active: true})))
           }

        } else {            
        }
    }    

    return (
        <Container>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} justifyContent="left" alignItems="left">
                    {/*Race name*/}
                    <Grid item xs={12} sm={6}>
                        <Paper>
                            <TextField
                                key='eventname'
                                required
                                sx={{ marginTop: '0.5rem' }}
                                type="text"
                                variant='outlined'
                                color='primary'
                                label="Namn på tävling"
                                onChange={e => setRaceName(e.target.value)}
                                value={raceName}
                                fullWidth
                            />
                        </Paper>
                    </Grid>

                    {/*Race date*/}
                    <Grid item xs={12} sm={6}>
                        <Paper>
                            <TextField
                                key='eventdate'
                                sx={{ marginTop: '0.5rem' }}
                                label="Datum"
                                InputLabelProps={{ style: { top: '-0.1rem' }, }}
                                type="date"
                                variant='outlined'
                                color='primary'
                                value={raceDate}
                                onChange={e => setRaceDate(e.target.value)}
                                fullWidth
                            />
                        </Paper>
                    </Grid>

                                            
                    <Grid item xs={12}>
                        <Paper >
                            <Autocomplete
                                key="autocompletesetupasprevious"
                                id="autocomplesetupasprevious"
                                fullWidth
                                options={oldRace}
                                getOptionLabel={getOldRaceLabel}
                                //getOptionSelected={getOldRaceSelected}
                                isOptionEqualToValue={getOldRaceSelected}
                                value={selectedOldRace}
                                onChange={handleOnChangeRace}
                                freeSolo={false}
                                autoComplete={true}
                                autoHighlight={true}
                                blurOnSelect={true}                                                        
                                renderInput={(params) => { return <TextField  {...params} label="Använd inställningar från tidigare tävling" /> }}
                            />
                        </Paper>
                    </Grid>


                    {/*Start type*/}
                    <Grid item xs={12}>
                        <Paper>
                            <RadioGroup name="starttype" value={raceStart}>
                                <List style={{ display: 'flex', flexDirection: 'row', padding: 0 }}
                                    key='eventstartlist'
                                    sx={{
                                        '--ListItem-radius': '0px',
                                    }}>
                                    {possibleRaceStarts.map((item, index) => (
                                        <><ListItem
                                            key={'eventstartlist' + index}
                                            width='20%'
                                            variant="outlined"
                                            key={item}
                                            sx={{ width: '20%' }}
                                        > <ListItemDecorator>{possibleRaceStartsIcons[index]}</ListItemDecorator>
                                            <Radio
                                                overlay
                                                value={item}
                                                label={possibleRaceStarts[index]}
                                                onChange={(e) => (setRaceStart(item))}

                                                slotProps={{
                                                    action: ({ checked }) => ({
                                                        sx: (theme) => ({
                                                            ...(checked && {
                                                                inset: -1,
                                                                border: '2px solid',
                                                                borderColor: theme.vars.palette.primary[1000],
                                                            }),
                                                        }),
                                                    }),
                                                }}

                                            />
                                        </ListItem>
                                        </>
                                    ))}
                                </List>
                            </RadioGroup>
                        </Paper>
                    </Grid>

                    {/*Race type*/}
                    <Grid item xs={12}>
                        <Paper>
                            <RadioGroup name="racetype" value={raceType}>
                                <List style={{ display: 'flex', flexDirection: 'row', padding: 0 }}
                                    key={'eventlaptypelist'}
                                    sx={{
                                        //'--List-gap': '0.5rem',
                                        '--ListItem-paddingY': '1rem',
                                        '--ListItem-radius': '0px',
                                        '--ListItemDecorator-size': '32px',
                                    }}>
                                    {possibleRaceType.map((item, index) => (
                                        <><ListItem
                                            key={'eventlaptypelist' + index}
                                            variant="outlined"
                                            key={item}
                                            sx={{ width: '50%', boxShadow: 'sm', bgcolor: 'background.body', }}
                                        >
                                            <ListItemDecorator name={item + 'sdfs'} key={item + 'sdsfd'}>
                                                {possibleRaceTypeIcons[index]}
                                            </ListItemDecorator>
                                            <Radio
                                                overlay
                                                value={item}
                                                label={possibleRaceType[index]}
                                                sx={{ flexGrow: 1, }}
                                                onChange={(e) => (setRaceType(item))}
                                                slotProps={{
                                                    action: ({ checked }) => ({
                                                        sx: (theme) => ({
                                                            ...(checked && {
                                                                inset: -1,
                                                                border: '2px solid',
                                                                borderColor: theme.vars.palette.primary[500],
                                                            }),
                                                        }),
                                                    }),
                                                }}

                                            />
                                        </ListItem>
                                        </>
                                    ))}
                                </List>
                            </RadioGroup>
                        </Paper>
                    </Grid>

                    {/*Classes type*/}
                    <Grid item xs={12}>
                        <Paper>
                            <List style={{ display: 'flex', flexDirection: 'row', padding: 0, marginBottom: '1rem' }}
                                sx={{
                                    //                            '--List-gap': '0.5rem',
                                    '--ListItem-paddingY': '1rem',
                                    '--ListItem-radius': '0px',
                                    '--ListItemDecorator-size': '32px',
                                }}>

                                {raceClasses.map((item, index) => (
                                    <>
                                        <ListItem key={'eventclasses' + index} variant="outlined" key={item} sx={{ boxShadow: 'sm', bgcolor: 'background.body', }}>
                                            <Checkbox
                                                overlay
                                                checked={item.active}
                                                label={item.name}
                                                sx={{ flexGrow: 1, }}
                                                onChange={(e) => switchActiveClass(e, index)}

                                                slotProps={{
                                                    action: ({ checked }) => ({
                                                        sx: (theme) => ({
                                                            ...(checked && {
                                                                inset: -1,
                                                                border: '2px solid',
                                                                borderColor: theme.vars.palette.primary[500],
                                                            }),
                                                        }),
                                                    }),
                                                }}
                                            />
                                        </ListItem>
                                        <TextField sx={{ width: '120px' }}
                                            label={(raceType === 'Time') ? 'Tävlingstid' : "Antal varv"}
                                            onFocus={(e) => { e.target.select(); }}
                                            onChange={(e) => updateLapNumber(parseInt(e.target.value), index)}
                                            hidden={!item.active}
                                            placeholder={(raceType === 'Time') ? 'Tävlingstid' : "Antal varv"}
                                            type="number"
                                            value={item.laps}
                                        >
                                        </TextField>
                                    </>
                                ))} <IconButton><FaPlusSquare /></IconButton>
                            </List>
                        </Paper>
                    </Grid>

                    {/*Save race */}
                    <Grid item xs={12}>
                        <Paper>
                            <Button type="submit" variant="outlined" color="primary" startIcon={<FaSave />} sx={{ width: '100%' }} onClick={(e) => saveRace(e)}>{props.raceSettings.id ? 'Uppdatera data' : 'Spara tävling'}  </Button>
                        </Paper>
                    </Grid>


                    {/*Start race button*/}
                    <Grid item xs={12}>
                        <Paper>
                            <Button onClick={(e) => { setLocalRacers([]) }} hidden={!raceID || localRacers.length === 0} type="submit" variant="outlined" startIcon={<FaSave />} sx={{ width: '100%' }} as={Link} to='/scoreboard' state={{ raceid: raceID }} >Starta tävling  </Button>
                        </Paper>
                    </Grid>
                     
                                      
                    <Grid item xs={12} md={4}>
                        <Paper >
                            <Autocomplete
                                key="autocompletepreviousraces"
                                id="autocompletepreviousraces"
                                fullWidth
                                options={oldRace}
                                getOptionLabel={getOldRacerListLabel}
                               isOptionEqualToValue={getOldRacerListSelected}
                                value={selectedOldRacerList}
                                onChange={handleOnChangeRacerList}
                                freeSolo={false}                                
                                autoComplete={true}
                                autoHighlight={true}
                                blurOnSelect={true}                                                                                                 
                                renderInput={(params) => { return <TextField  {...params} label="Använd startlista från tidigare tävling" /> }}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper >
                            <Button fullWidth hidden={!(props.raceSettings.state === 'planning')} variant="outlined" startIcon={<FaPlusSquare />} onClick={(e) => createNewRacerList()}>Skapa ny deltagarlista  </Button>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper >
                            <Button fullWidth variant="outlined" startIcon={<FaUpload />} onClick={(e) => (importRacersFromCSV())}>Importera deltagarlista</Button>
                        </Paper>
                    </Grid>
                    
                </Grid>
            </form >

            <Grid item xs={12}>
                <Paper sx={{paddingTop:'10px'}}>
                    {(localRacers.length === 0 || (props.raceSettings.state === 'running') || (props.raceSettings.state === 'finished')) ? '' : 
                    <Competitorlist racers={localRacers} setRacers={setLocalRacers} showMenu={false} />}
                </Paper>
            </Grid>

        </Container >
    )



}

export default Createrace;








