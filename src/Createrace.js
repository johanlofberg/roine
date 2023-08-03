import People from '@mui/icons-material/People';
import Person from '@mui/icons-material/Person';
import { Checkbox, List, ListItem, ListItemDecorator } from '@mui/joy';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { FaClock, FaDatabase, FaPlusSquare, FaRecycle, FaSave, FaUpload } from 'react-icons/fa';
import Competitorlist from './Competitorlist';
import { uniqueID, normalizeRacers } from './myUtilities';
import { saveRaceToDataBase, saveRacerListToDataBase } from './Database';
import { Link } from "react-router-dom";
import Createexampleusers from './Createexampleusers';

const Createrace = (props) => {

    function createNewRacerList() {
        const defaultRacer = { id: uniqueID(), 'name': '?', number: 1, 'class': raceClasses[0].name, club: '?' }
        props.setRacers([defaultRacer]) 
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

    const [raceName, setRaceName] = useState(props.raceSettings?.name || 'Ny tävling')
    const [raceStart, setRaceStart] = useState(props.raceSettings?.start || possibleRaceStarts[0])    
    const [raceType, setRaceType] = useState(props.raceSettings?.type || possibleRaceType[0])
    const [raceDate, setRaceDate] = useState(props.raceSettings?.date || '')

    if (props.raceSettings?.classes) {
        possibleClasses = props.raceSettings.classes
    }
    const [raceClasses, setRaceClasses] = useState(props.raceSettings?.classes || possibleClasses)

    function handleSubmit(event) {
        event.preventDefault();
    }

    function saveRace(event) {
        event.preventDefault();
        // Create a new race from data in form        
        let racerlistid = ''
        let didWeManageTosSaveParticpants = false
        if (props.raceSettings.racerlistid || props.racers.length > 0) {
            // We have a racer list, so first create an id for this, and save it           
            if (props.raceSettings.racerlistid) {         
                racerlistid = props.raceSettings.racerlistid
            }
            else {                
                racerlistid = uniqueID()
            }
            didWeManageTosSaveParticpants = saveRacerListToDataBase(normalizeRacers(props.racers), racerlistid)
        }        
        const theRace = {
            // Importantly, only create a new when built from scratch
            id: props.raceSettings.id || uniqueID(),
            datecreate: props.raceSettings.datecreated || (new Date()).toISOString(),
            state: props.raceSettings.state || 'planning',
            // These can be updated
            name: raceName,
            classes: raceClasses,
            type: raceType,
            start: raceStart,
            date: raceDate,          
            racerlistid: racerlistid,
        };
        console.log(theRace)
        console.log('Fixed race')
        let didWeManageTosSaveRace = saveRaceToDataBase(theRace)
        if (didWeManageTosSaveParticpants && didWeManageTosSaveRace) {
            props.setRaceSettings(theRace)           
            props.setRacers(normalizeRacers(props.racers))
        }
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
                    label={raceDate ? '' : 'Datum'}
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
                                    disabled = {(props.raceSettings.state === 'running') || (props.raceSettings.state === 'finished')}
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
                                    disabled = {(props.raceSettings.state === 'running') || (props.raceSettings.state === 'finished')}
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
                <Button hidden={!(props.raceSettings.state === 'planning')} type="submit" variant="outlined" startIcon={<FaSave />} sx={{ width: '50%' }} as={Link} to='/'>Starta tävling  </Button>
                <Button hidden = {!(props.raceSettings.state === 'planning') } variant="outlined" startIcon={<FaPlusSquare />} sx={{ width: '33.3%' }} onClick={(e) => createNewRacerList()}>Skapa ny deltagarlista  </Button>
                <Button hidden = {!(props.raceSettings.state === 'planning') } variant="outlined" startIcon={<FaDatabase />} sx={{ width: '33.3%' }} onClick={(e) => (props.setRacers('asdas'))}>Deltagarlista från tidigare tävling</Button>
                <Button hidden = {!(props.raceSettings.state === 'planning') } variant="outlined" startIcon={<FaUpload />} sx={{ width: '33.3%' }} onClick={(e) => (props.setRacers('asdas'))}>Importera deltagarlista</Button>
            </form>
            {(props.racers.length === 0 || (props.raceSettings.state === 'running') || (props.raceSettings.state === 'finished')) ? '' : <Competitorlist racers={props.racers} setRacers={props.setRacers} showMenu={false} />}
        </>
    )
}

export default Createrace;