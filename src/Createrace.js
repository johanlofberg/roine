import { useLocation } from 'react-router-dom';
import People from '@mui/icons-material/People';
import Person from '@mui/icons-material/Person';
import { Checkbox, List, ListItem, ListItemDecorator } from '@mui/joy';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { FaClock, FaDatabase, FaPlusSquare, FaRecycle, FaSave, FaUpload } from 'react-icons/fa';
import Competitorlist from './Competitorlist';
import { uniqueID, normalizeRacers, normalizeRacer } from './myUtilities';
import { saveRaceToDataBase, saveRacerListToDataBase } from './Database';
import { Link } from "react-router-dom";
import { useEffect } from 'react';
import { doc, getDocs, getDoc, collection } from "firebase/firestore";
import { db } from './firebase';
import Papa from 'papaparse';

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
    const [historyList, setHistoryList] = useState([])

    function handleSubmit(event) {
        event.preventDefault();
    }

    /*
    async function loadUsersFromPastRaces() {
        const docRefRace = doc(db, "races", race.id);
        try {
            const docSnap = await getDoc(docRefRace);
            console.log(docSnap.data())
            props.setRaceSettings(docSnap.data())
            console.log(docSnap.data());
        } catch (error) {
            console.log(error)
        }
    }
    */

    function importFromCSV()
    {        
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqgUYoZ9hsSOCuspxnZBsR9m5DTWGEigJWd8OiOgWdDG_f8IQ2USj19ZwaM34V6u7kT8zLX2furyZs/pub?gid=0&single=true&output=csv'
        const result = Papa.parse(url, {
            download: true,
            dynamicTyping: true,
            download: true,
            header: true,
            comments: "*=",
            complete: function(results) {
                console.log(results)
                setLocalRacers(normalizeRacers(results.data))
            }
        })        
        console.log(result)
    }

    const loadUsersFromPastRaces = async () => {
        await getDocs(collection(db, "races"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log('Loaded races!')
                console.log(newData);
                const theIDs = newData.map(({ name, racerlistid, ...rest }) => ({ racerlistid, label: name }));
                //map(({ id, name, ...rest }) => ({ id, HisName: name, ...rest }));
                console.log(theIDs)
                setHistoryList(theIDs)
                console.log(historyList)
            }
            )
    }

    async function userSelectedHistoryList(e, selectedRow) {
        console.log(e)
        console.log(selectedRow)
        if (selectedRow.racerlistid) {
            const docRefRacers = doc(db, "racerlist", selectedRow.racerlistid);
            const docSnapRacers = await getDoc(docRefRacers);
            let racers = Object.entries(docSnapRacers.data()).map(([id, values]) => ({ id, ...normalizeRacer(values, true) }))
            console.log(racers)
            setLocalRacers(racers)
        }
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
            console.log('We have a racer list')
            didWeManageTosSaveParticpants = saveRacerListToDataBase(normalizeRacers(localRacers), attachedRacerListID)
            setRacerListID(attachedRacerListID)
            console.log('And it was set to', attachedRacerListID)
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
    console.log(props, " props");
    console.log(location, " useLocation Hook");

    useEffect(() => {
        setLocalRacers([])
        //        if ((location.state.view == 'new') && !racersHaveBeenReset) {
        //          setRacersHaveBeenReset(true)
        //        setLocalRacers([])    
        console.log('Reset racers in createrace')
        //        }
        console.log('Useeffect in createrace')
        console.log(localRacers)

    }, []);

    return (
        <>
            <form onSubmit={handleSubmit}>

                <TextField
                    sx={{ marginTop: '1rem', marginBottom: '1rem' }}
                    type="text"
                    variant='outlined'
                    color='primary'
                    label="Namn på tävling"
                    onChange={e => setRaceName(e.target.value)}
                    value={raceName}
                    fullWidth
                    required
                />

                <TextField
                    InputLabelProps={{ style: { top: '-0.6rem' }, }}
                    type="date"
                    variant='outlined'
                    color='primary'
                    value={raceDate}
                    onChange={e => setRaceDate(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: '1rem' }}
                />

                <RadioGroup name="starttype" value={raceStart}>
                    <List style={{ display: 'flex', flexDirection: 'row', padding: 0, marginBottom: '1rem' }}
                        sx={{
                            //'--List-gap': '0.5rem',
                            '--ListItem-paddingY': '1rem',
                            '--ListItem-radius': '0px',
                            '--ListItemDecorator-size': '32px',
                        }}>
                        {possibleRaceStarts.map((item, index) => (
                            <><ListItem
                                width='20%'
                                variant="outlined"
                                key={item}
                                sx={{ width: '20%', boxShadow: 'sm', bgcolor: 'background.body', }}
                            >
                                <ListItemDecorator name={item + 'sdfs'} key={item + 'sdsfd'}>
                                    {possibleRaceStartsIcons[index]}
                                </ListItemDecorator>
                                <Radio
                                    overlay
                                    value={item}
                                    label={possibleRaceStarts[index]}
                                    sx={{ flexGrow: 1, }}

                                    onChange={(e) => (setRaceStart(item))}

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

                <RadioGroup name="racetype" value={raceType}>
                    <List style={{ display: 'flex', flexDirection: 'row', padding: 0, marginBottom: '1rem' }}
                        sx={{
                            //'--List-gap': '0.5rem',
                            '--ListItem-paddingY': '1rem',
                            '--ListItem-radius': '0px',
                            '--ListItemDecorator-size': '32px',
                        }}>
                        {possibleRaceType.map((item, index) => (
                            <><ListItem
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

                <List style={{ display: 'flex', flexDirection: 'row', padding: 0, marginBottom: '1rem' }}
                    sx={{
                        //                            '--List-gap': '0.5rem',
                        '--ListItem-paddingY': '1rem',
                        '--ListItem-radius': '0px',
                        '--ListItemDecorator-size': '32px',
                    }}>

                    {raceClasses.map((item, index) => (
                        <>
                            <ListItem variant="outlined" key={item} sx={{ boxShadow: 'sm', bgcolor: 'background.body', }}>
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
                    ))}
                </List>                
                <Button type="submit" variant="outlined" color="primary" startIcon={<FaSave />} sx={{ width: '50%' }} onClick={(e) => saveRace(e)}>{props.raceSettings.id ? 'Uppdatera data' : 'Spara tävling'}  </Button>
                <Button onClick={(e) => { setLocalRacers([]) }} hidden={!raceID || localRacers.length === 0} type="submit" variant="outlined" startIcon={<FaSave />} sx={{ width: '50%' }} as={Link} to='/scoreboard' state={{ raceid: raceID }} >Starta tävling  </Button>
                <Button hidden={!(props.raceSettings.state === 'planning')} variant="outlined" startIcon={<FaPlusSquare />} sx={{ width: '33.3%' }} onClick={(e) => createNewRacerList()}>Skapa ny deltagarlista  </Button>
                
                 <Autocomplete onChange={(e, index) => { userSelectedHistoryList(e, index) }}
                    disablePortal
                    disableClearable
                    hidden = {historyList.length==0}
                    key={historyList}
                    id="combo-box-demo"
                    options={historyList}
                    sx={{ width: 300 }}
                    renderInput={(race) => <TextField {...race} key={race.racerlistid} label="name" />}
                />
                
                <Button hidden={!(props.raceSettings.state === 'planning') || historyList.length>0} variant="outlined" startIcon={<FaDatabase />} sx={{ width: '33.3%' }} onClick={(e) => loadUsersFromPastRaces()}>Deltagarlista från tidigare tävling</Button>
                <Button hidden={!(props.raceSettings.state === 'planning')} variant="outlined" startIcon={<FaUpload />} sx={{ width: '33.3%' }} onClick={(e) => (importFromCSV())}>Importera deltagarlista</Button>
            </form>
            {(localRacers.length === 0 || (props.raceSettings.state === 'running') || (props.raceSettings.state === 'finished')) ? '' : <Competitorlist racers={localRacers} setRacers={setLocalRacers} showMenu={false} />}
        </>
    )
}

export default Createrace;