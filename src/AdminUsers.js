import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { loadAllUsers, deleteUserByID } from "./Database";
import { deepClone, proposeCSVDownload } from "./myUtilities";


export default function AdminUsers() {

    const [needsReload, setneedsReload] = useState(true)
    const [racers, setRacers] = useState([])
    const [selected, setSelected] = useState([])

    function handleDeleteClick() {
        const copyOfUser = deepClone(racers)
        selected.forEach((id) => {
            deleteUserByID(id)
        })
        setRacers(copyOfUser.filter((user) => { return !selected.includes(user.id) }))
    }

    useEffect(() => {
        if (needsReload) {
            loadAllUsers().then((data) => {
                setRacers(data)
                setneedsReload(false)
            }
            )
        }
    }, []);

    const columns = []

    if (racers && racers.length > 0) {
        Object.keys(racers[0]).forEach((key, index) => {
            if (key === 'id') {
                columns.push({
                    field: key,
                    key: key + index,
                    headername: key,
                    width: 100,
                    renderCell: (params) => (
                        <Link to={`/profile/${params.value}`}>{params.value}</Link>
                    )
                })
            } else {
                columns.push({
                    field: key,
                    key: key + index,
                    headername: key,
                    width: 100,
                    editable: key == 'id' ? false : true
                })
            }
        })
    }


    return (
        <React.Fragment>              
            {(racers && racers.length > 0) ? <Button onClick = {()=>proposeCSVDownload(racers,'races')}>Download</Button> : ''}                     
            <Button onClick={(e) => handleDeleteClick(e)}>  Delete all  </Button>
            {racers && racers.length > 0 ? <DataGrid
                checkboxSelection
                columns={columns}
                rows={racers}
                onRowSelectionModelChange={(ids) => setSelected(ids)}
            /> : ''}
        </React.Fragment>
    )
}