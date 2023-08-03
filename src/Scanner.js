import React, { useContext } from 'react';
import './Scanner.css'
import { ActionsContext } from './context';

const Scanner = () => {
  const { actions, setActions} = useContext(ActionsContext);
    return (
      <div className="scanner">
        <p className="scanner-exit" onClick={()=>setActions({...actions, scan: null})}>X</p>
        <div className="scanner-container">          
          <p className="scanner-text">
            Scanning...
          </p>
        </div>
      </div>
    );
};

export default Scanner;