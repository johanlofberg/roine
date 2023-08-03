import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, BrowserRouter, useLocation} from 'react-router-dom';
import Home from './Home';
import Results from './Results';
import Scoreboard from './Scoreboard';
import About from './About';
import Menu from './Menu';
import Contact from './Contact';
import Createrace from './Createrace';
import Competitorlist from './Competitorlist';
import Createexampleusers from './Createexampleusers';
import ListRacesAsCards from './ListRacesAsCards';
import Createexamplerace from './Createexamplerace';
import { getFirestore, collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { saveRaceToDataBase,saveRacerListToDataBase } from './Database'
import FrontPage from './FrontPage';

function App() {

  const fetchRaces = async () => {
    await getDocs(collection(db, "races"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log('Loaded races!');
        //setRaceList(newData)
        console.log(newData);
      })
  }

  // Load users
  console.log('Loading users')

  //let localracers = Createexampleusers();
  // Set them ready to race
  //localracers.map((x) => { x.next = 999; x.lapmarkings = [] });
  //localracers.map((x) => { x.next = 999; x.dnf = false; x.dns = false; x.finished = false; x.lapmarkings = [] });
  //const [racers, setRacers] = useState(localracers);
  const [racers, setRacers] = useState([]);
  
  console.log('App init')
  console.log(racers)

  // Mock-up load of race
  const theRace = Createexamplerace();
  const [raceSettings, setRaceSettings] = useState(theRace);
  const [logLaps, setlogLaps] = useState([]);

  const prevraceSettings = useRef(raceSettings);
  useEffect(() => {
    console.log('Entered useeffect')
    // Check if state of race has gone from running to finished, and if so save it
    if (raceSettings.state === 'finished' && prevraceSettings.current.state == 'running') {
      // Perform the database save operation here
      //console.log('Saving triggered')
      let didWeManageTosSaveRace = saveRaceToDataBase(raceSettings)
      //console.log('Saving race done')
      //console.log(racers,raceSettings.racerlistid)
      let didWeMana,geTosSaveRaceList = saveRacerListToDataBase(racers,raceSettings.racerlistid)
      //console.log('Useeffect saving done')
    } else { 
      //console.log('USEEFFECT called but nothing was done', raceSettings, prevraceSettings.current) 
    }
      prevraceSettings.current = raceSettings;
    }, [raceSettings]);

  return (
    <>
      <BrowserRouter basename = '/roine' >      
        {raceSettings.state == 'running' ? '' : <Menu />}
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="//scoreboard" element={<Scoreboard logLaps={logLaps} setlogLaps={setlogLaps} racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} />} />          
          <Route path="/races" element={<ListRacesAsCards racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} />} />
          <Route path="/results" element={<Results logLaps={logLaps} setlogLaps={setlogLaps} racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSetting={setRaceSettings} />} />
          <Route path="/competitorlist" element={<Competitorlist racers={racers} setRacers={setRacers} raceSettings={raceSettings} />} />          
          <Route path="/createrace" element={<Createrace racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} showMenu={false} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;