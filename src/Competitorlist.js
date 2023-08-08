import React from "react";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { FaTrash, FaUserPlus } from 'react-icons/fa';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { ButtonGroup } from "@mui/material";
import Rightviewmenu from './Rightviewmenu'
import { doc, setDoc } from "firebase/firestore";
import { db } from './firebase';
import {uniqueID} from './myUtilities';

export default function Competitorlist(props) {

    const saveRacerList = async (e) => {
        try {
            console.log(props)

            // Save as a racer list connected to this race
            const convertedObject = props.racers.reduce((acc, current) => {
                const { id, ...rest } = current;
                acc[id] = rest;
                return acc;
              }, {});
              console.log(convertedObject);
              
            const docRef = doc(db, "racerlist", props.raceSettings.id);
            await setDoc(docRef, convertedObject)
                .then(() => {
                    console.log('Document has been added successfully');
                })
        }
        catch (e) {
            console.log(e.message);
        }
    };

    function addNewRacer(e, params) {

        if (params === undefined) {
            const maxStartNumber = Math.max(...props.racers.map(racer => racer.number), 0);
            props.setRacers([...props.racers, {
                id: uniqueID(),
                name: "Okänd",
                number: maxStartNumber + 1,
                class: "",
                club: "",
            }])
            // Create from scratch
        } else {
            // Copy from participant
            props.setRacers([...props.racers, {
                id: uniqueID(),
                name: "",
                number: params.row.number + 1,
                class: params.row.class,
                club: params.row.club,
            }])
        }
    }

    // https://github.com/mui/mui-x/issues/2714
    const deleteUser = React.useCallback(
        (params) => {
            setTimeout(() => {
                let temp = props.racers;
                props.setRacers((temp) => temp.filter((row) => row.id !== params.id));
            });
        },
        [],
    );

    const processRowUpdate = (newRow: any) => {
        const updatedRow = { ...newRow, isNew: false };
        //console.log(updatedRow);
        //handle send data to api

        var index = props.racers.map(function (e) { return e.id; }).indexOf(newRow.id);
        let newData = props.racers;
        for (const key in newRow) {
            if (newRow.hasOwnProperty(key)) {
                newData[index][key] = newRow[key];
            }
        }
        props.setRacers(newData)
        saveRacerList()
        return updatedRow;
    };


    const columns = [
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [<GridActionsCellItem icon={<FaTrash />} onClick={() => deleteUser(params)} label="Delete" />,
            <GridActionsCellItem icon={<FaUserPlus />} onClick={(e) => addNewRacer(e, params)} label="Add" />,],
        },
        {
            field: 'id',
            headerName: 'id',
            type: 'number',
            width: 310,
            editable: false,
            align: 'right',
            headerAlign: 'center',
        },       
        {
            field: 'name',
            headerAlign: 'center',
            headerName: 'Namn',
            align: 'right',
            width: 180,
            editable: true
        },
        {
            field: 'number',
            headerName: 'Nummer',
            type: 'number',
            width: 90,
            editable: true,
            align: 'right',
            headerAlign: 'center',
        },
        {
            field: 'class',
            type: 'singleSelect',
            valueOptions: ['Bredd', 'Motion', 'Dam'],
            headerName: 'Klass',
            width: 90,
            editable: true
        },
        { field: 'club', headerName: 'Klubb', width: 90, editable: true },       
    ];

    const {showMenu = true} = props;

    return (
        <div>
          {(showMenu) ? <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <ButtonGroup>
                    </ButtonGroup>
                    <Rightviewmenu />
                </Toolbar>
            </AppBar> : ''}

            <div style={{ height: '100%', width: '100%'}}>
                <DataGrid
                checkboxSelection
                    editMode="row"
                    disableRowSelectionOnClick
                    rows={props.racers}
                    columns={columns}
                    processRowUpdate={processRowUpdate}
                    initialState={{
                        sorting: { sortModel: [{ field: 'number', sort: 'asc' }], },
                        columns: { columnVisibilityModel: { id: false }, }
                      }}
                />
                <button onClick={addNewRacer}>Ny förare</button>
                <button onClick={saveRacerList}>Spara lista</button>
            </div>
        </div>
    );
}