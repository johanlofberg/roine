import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import { Image } from 'react-bootstrap';
import CardHeader from '@mui/material/CardHeader';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { where, onSnapshot, query, collection, getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { loadSingleDocument } from './Database';
import { normalizeRacer } from './myUtilities';
import { FaTrash } from 'react-icons/fa';
import { deleteDoc } from "firebase/firestore";
import GMK from './gmk.png'

const fetchDocument = async (id) => {
    const firestore = getFirestore()
    const docRef = doc(firestore, 'racerlist', id)
    const docSnap = await getDoc(docRef)
    const data = docSnap.exists() ? docSnap.data() : null
    if (data === null || data === undefined) return null
    return { id, ...data }
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));



const CardSingleRace = (props) => {

    async function deleteRace(race) {

        const raceid = race.id
        const racerlistid = race.racerlistid

        const raceRef = doc(db, 'races', raceid)
        deleteDoc(raceRef).then(() => { console.log("Entire race has been deleted successfully.") })

        if (racerlistid) {
            const listRef = doc(db, 'racerlist', racerlistid)
            deleteDoc(listRef).then(() => { console.log("Entire racer list has been deleted successfully.") })
        }
        props.setNeedsReload(true)

//        console.log(props.raceList.IndexOf(raceid))

    }


    async function clickRace(e, race) {

        if (race.racerlistid) {
            const docRefRacers = doc(db, "racerlist", race.racerlistid);
            try {
                const docSnap = await getDoc(docRefRacers);
                let racers = Object.entries(docSnap.data()).map(([id, values]) => ({ id, ...normalizeRacer(values, true) }))
                props.setRacers(racers)
            } catch (error) {
                console.log(error)
            }
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
    }

    const [expanded, setExpanded] = React.useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (

        < React.Fragment key={props.race.id} >
            <Card key={'card' + props.index} sx={{ width: '100%', ':hover': { boxShadow: 15 } }}>
                <CardActionArea component={RouterLink} to={'/Results'} onClick={(e) => clickRace(e, props.race)}>
                    <CardHeader
                        avatar={<Avatar alt="Apple" src={GMK} />}                                                                           
                        action={
                            <IconButton key={'cardicon' + props.index} aria-label="settings">
                                <MoreVertIcon key={'vert' + props.index} />
                            </IconButton>
                        }
                        title={props.race.name == undefined ? 'Okänt namn' : props.race.name + (props.race.date? ' (' + props.race.date + ')' : '(datum ej satt)' )}
                        subheader={props.race.state === 'planning'
                        ? 'Tävling under planering' + ', skapad ' + (new Date(props.race.datecreate))
                        : props.race.state === 'running'
                            ? 'Tävling pågår'
                            : props.race.state === 'finished'
                                ? 'Tävling genomförd'
                                : 'Okänd status'}
                    />                   
                    <CardActions disableSpacing>
                        <IconButton
                            onTouchStart={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                            // id={'roptionicon' + racer.id}                                
                            //aria-controls={open ? 'racermenu' + racer.id : undefined}
                            // aria-haspopup="true"
                            // aria-expanded={open ? 'true' : undefined}
                            onClick={(event) => { event.stopPropagation(); event.preventDefault(); deleteRace(props.race) }}
                            size='small'>
                            < FaTrash />
                        </IconButton>
                    </CardActions>
                    <Collapse key={'card2' + props.index} in={expanded} timeout="auto" unmountOnExit>
                        <CardContent key={'cardmore' + props.index}>
                            Heat 1/2 cup of the broth in a pot until simmering, add saffron and set
                            aside for 10 minutes.
                        </CardContent>
                    </Collapse>
                </CardActionArea>
            </Card>



        </React.Fragment>

    )
}

export default CardSingleRace;