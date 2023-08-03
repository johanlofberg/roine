import Scan from './Scan';
import { useState } from 'react';
import { ActionsContext } from './context';

export default function ScannerPage() {

  const [actions, setActions] = useState(null);
  const {scan, write} = actions || {};

  const actionsValue = {actions,setActions};

  const onHandleAction = (actions) =>{
    setActions({...actions});
  }

  return (
      <div className="App">        
        <h1>NFC Tool</h1>
        <div className="App-container">
          <button onClick={()=>onHandleAction({scan: 'scanning', write: null})} className="btn">Scan</button>
      
        </div>
        <ActionsContext.Provider value={actionsValue}>
          {scan && <Scan/>}      
        </ActionsContext.Provider>
      </div>
  );
}
