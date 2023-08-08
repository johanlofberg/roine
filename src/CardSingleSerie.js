import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { doc, getDoc } from 'firebase/firestore';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { db } from './firebase';
import GMK from './gmk.png';
import Grid from '@mui/material/Grid';
import { Link } from "react-router-dom";
import { createResultsLink } from './myUtilities';
import { Chip } from '@mui/material';

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

const CardSingleRaceNew = (props) => {

    const [expanded, setExpanded] = React.useState(true);
    const [theRaces, setTheRaces] = React.useState([]);
    const [theSerie, setTheSerie] = React.useState([]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // This is a card, so we communicate with props currently
    const serieID = props.serieID
    
    useEffect(() => {
        
        if (serieID && serieID.length) {
            const fetchData = async () => {              
                try {
                    // First load the race structure             
                    let serieData = []
                    const serieRef = doc(db, 'series', serieID);
                    const snapshot = await getDoc(serieRef);
                  
                    if (snapshot.exists) {
                        serieData = snapshot.data();
                    }
                    console.log(serieData)
                    console.log(serieID)
                    setTheSerie(serieData)

                    let raceList = []
                    if (serieData.eventid) {                        
                        for (const docId of serieData.eventid) {
                          const raceRef = doc(db, 'races', docId);
                          const snapshot = await getDoc(raceRef);
                          if (snapshot.exists) {
                            const raceData = snapshot.data();
                            raceList = [...raceList, raceData]
                          }
                          console.log('Loaded races', raceList)
                        }                                            
                    }       
                    setTheSerie(serieData)
                    setTheRaces(raceList)
                }
                catch (error) { console.error('Error fetching data:', error); };
            }
            fetchData();
        }
        return () => {}
    }, [])

    return (        
        <  React.Fragment key={theSerie.id} >
            <Grid item xs={12} sm={6} md={4} >
                <Card key={'card' + serieID} sx={{ width: '100%', ':hover': { boxShadow: 15 } }}>
                    <CardActionArea component={Link} to={createResultsLink(theSerie.id)}>
                        <CardHeader
                            avatar={<Avatar src={GMK} />}
                            title={theSerie.name == undefined ? 'Okänt namn' : theSerie.name}
                            subheader=''
                        />
                        {theRaces.map( (aRace) => (<Chip 
                        component={Link} to='/profile' clickable                        
                        label = {aRace.name}
                        onClick = {(e) => {}}                        
                        ></Chip>))}
                        <Collapse key={'card2'} in={expanded} timeout="auto" unmountOnExit>
                            <CardContent key={'cardmore' + props.index}>
                                {''}
                            </CardContent>
                        </Collapse>
                    </CardActionArea>
                </Card>
            </Grid>
        </React.Fragment> 
    )
}

export default CardSingleRaceNew;