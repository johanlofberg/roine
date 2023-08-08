import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { deleteDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import {deleteRace} from './Database'
import * as React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { db } from './firebase';
import GMK from './gmk.png';
import { normalizeRacer } from './myUtilities';

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

    async function handleClickDeleteRace(race) {
        deleteRace(race)
        props.setNeedsReload(true)
    }

    async function clickRace(e, race) {

        /*
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
        }*/
    }

    const [expanded, setExpanded] = React.useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (

        < React.Fragment key={props.race.id} >
            <Grid item xs={12} 
            <Card key={'card' + props.index} sx={{ width: '100%', ':hover': { boxShadow: 15 } }}>
                <CardActionArea component={RouterLink} to='/newresults' state={props.race.id}>
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
                            onClick={(event) => { event.stopPropagation(); event.preventDefault(); handleClickDeleteRace(props.race) }}
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