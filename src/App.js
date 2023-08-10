import { collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { db } from './firebase';
import AdminRacerlist from './AdminRacerlist';
import AdminRaces from './AdminRaces';
import AdminUsers from './AdminUsers';
import Competitorlist from './Competitorlist';
import Createexamplerace from './Createexamplerace';
import Createrace from './Createrace';
import Createserie from './Createserie';
import FrontPage from './FrontPage';
import Importrace from './Importrace';
import ListRacesAsCards from './ListRacesAsCards';
import Menu from './Menu';
import NewResults from './NewResults';
import Profilepage from './Profilepage';
import Result from './Result';
import ScannerPage from './ScannerPage';
import Scoreboard from './Scoreboard';
import Series from './Series';
import Match from "./Match";


function App() {

  const [racers, setRacers] = useState([]);
 
  // Mock-up load of race
  const theRace = Createexamplerace();
  const [raceSettings, setRaceSettings] = useState(theRace);
  const [logLaps, setlogLaps] = useState([]);

  /*
 // const prevraceSettings = useRef(raceSettings);
  useEffect(() => {
    console.log('Entered useeffect')
    // Check if state of race has gone from running to finished, and if so save it
    if (raceSettings.state === 'finished' && prevraceSettings.current.state == 'running') {
      // Perform the database save operation here
      //console.log('Saving triggered')
      // let didWeManageTosSaveRace = saveRaceToDataBase(raceSettings)
      //console.log('Saving race done')
      //console.log(racers,raceSettings.racerlistid)
      //let didWeMana,geTosSaveRaceList = saveRacerListToDataBase(racers,raceSettings.racerlistid)
      //console.log('Useeffect saving done')
    } else { 
      //console.log('USEEFFECT called but nothing was done', raceSettings, prevraceSettings.current) 
    }
      prevraceSettings.current = raceSettings;
    }, [raceSettings]);
*/

  return (
    <>
      <HashRouter basename = '/' >      
         <Menu />
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/scoreboard" element={<Scoreboard logLaps={logLaps} setlogLaps={setlogLaps} racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} />} />          
          <Route path="/races" element={<ListRacesAsCards racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} />} />
          <Route path="/series" element={<Series  />} />
        
          <Route path="/competitorlist" element={<Competitorlist racers={racers} setRacers={setRacers} raceSettings={raceSettings} />} />          
          <Route path="/importrace" element={<Importrace />} />                    
          <Route path="/admin/users" element={<AdminUsers />} />                    
          <Route path="/admin/races" element={<AdminRaces />} />                    
          <Route path="/admin/racelist" element={<AdminRacerlist />} />  
          <Route path="/newresults/:raceid" element={<NewResults  />} />
          <Route path="/result/:raceid" element={<Result  />} />
          <Route path="/profile/:userid" element={<Profilepage />} />                              
          <Route path="/createserie/:serieid" element={<Createserie />} />    v          
          <Route path="/createserie/" element={<Createserie />} />    
          <Route path="/createserie" element={<Createserie />} />    
          <Route path="/match" element={<Match />} />    
          <Route path="/match/:id" element={<Match />} />    
          <Route path="/match/:id/:id" element={<Match />} />    

          <Route 
            path="/createrace"
            element={<Createrace racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSettings={setRaceSettings} showMenu={false} />} />          
          <Route path="/scanner" element={<ScannerPage/>} />          

        </Routes>
      </HashRouter>
    </>
  );
}

export default App;

//<Route path="/results" element={<Results logLaps={logLaps} setlogLaps={setlogLaps} racers={racers} setRacers={setRacers} raceSettings={raceSettings} setRaceSetting={setRaceSettings} />} />