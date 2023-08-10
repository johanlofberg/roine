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
import { createResultsLink, createSeriesLink } from './myUtilities';
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
    const [theRace, setTheRace] = React.useState([]);
    const [theSeries, setTheSeries] = React.useState([]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    function createStringAboutPlace() {
      return ''
        if (theRace){
        for (let index = 0; index < theRace.results.length; index++) {
            const element = theRace.results[index]
            let pos = element.results.indexOf(props.userid)
            if (pos > -1) {
                console.log(element)
                return 'Resultat: Plats ' + pos + '/' + (element.results.length) + ' i ' + element.class
                break
            }
        }; 
        return ''       
    }}

    // This is a card, so we communicate with props currently
    const raceID = props.raceID
    
    useEffect(() => {
        
        if (raceID && raceID.length) {
            const fetchDataInSeries = async () => {              
                try {
                    // First load the race structure             
                    let raceData = []
                    const raceRef = doc(db, 'races', raceID);
                    const snapshot = await getDoc(raceRef);
                  
                    if (snapshot.exists) {
                        raceData = snapshot.data();
                    }
                    console.log(raceData)
                    console.log(raceID)
                    setTheRace(raceData)

                    if (raceData.seriesid) {
                        // This race is part of some races, so lets load them                                                
                          const seriesRef = doc(db, 'series', raceData.seriesid);
                          const snapshotSeries = await getDoc(seriesRef);
                          let seriesData = []
                          if (snapshotSeries.exists) {
                             seriesData = snapshotSeries.data();                            
                          }
                          console.log('Loaded series', seriesData)
                          setTheSeries(seriesData)  
                          console.log('SERIES',theSeries)                      
                    }                    
                }
                catch (error) { console.error('Error fetching data:', error); };
            }
            fetchDataInSeries();
        }
        return () => {}
    }, [])

    return (        
        <  React.Fragment key={theRace.id} >
            <Grid item xs={12} sm={6} md={4} >
                <Card key={'card' + raceID} sx={{ width: '100%', ':hover': { boxShadow: 15 } }}>
                    <CardActionArea component={Link} to={createResultsLink(theRace.id)}>
                        <CardHeader
                            avatar={<Avatar src={GMK} />}
                            title={theRace.name == undefined ? 'Okänt namn' : theRace.name + (theRace.date ? ' (' + theRace.date + ')' : '(datum ej satt)')}
                            subheader={theRace.state === 'planning'
                                ? 'Tävling under planering' 
                                : theRace.state === 'running'
                                    ? 'Tävling pågår'
                                    : theRace.state === 'finished'
                                        ? 'Tävling genomförd'
                                        : 'Okänd status'}
                        />
                        {theSeries? (<Chip 
                        component={Link} to={createSeriesLink(theSeries.id)} 
                        clickable                        
                        label = {theSeries.name}
                        onClick = {(e) => {}}                        
                        ></Chip>) : ''}
                        <Collapse key={'card2' + props.index} in={expanded} timeout="auto" unmountOnExit>
                            <CardContent key={'cardmore' + props.index}>
                                {createStringAboutPlace()}
                            </CardContent>
                        </Collapse>
                    </CardActionArea>
                </Card>
            </Grid>
        </React.Fragment> 
    )
}

export default CardSingleRaceNew;