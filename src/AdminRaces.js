import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { loadAllRaces, deleteRaceByID } from "./Database";
import { deepClone,proposeCSVDownload } from "./myUtilities";

export default function AdminRaces() {

    const [needsReload, setneedsReload] = useState(true)
    const [race, setRace] = useState([])
    const [selected, setSelected] = useState([])

    function handleDeleteClick() {
        const copyOfRace = deepClone(race)
        selected.forEach((id) => {
            deleteRaceByID(id)
        })
        setRace(copyOfRace.filter((race) => { return !selected.includes(race.id) }))
    }

    useEffect(() => {
        if (needsReload) {
            loadAllRaces().then((data) => {
                setRace(data)
                setneedsReload(false)
            }
            )
        }
    }, []);

    const columns = []

    if (race && race.length > 0) {
        Object.keys(race[0]).forEach((key,index) => {
            columns.push({
                field: key,
                key: key + index,
                headername: key,
                width: 100,
                editable: key=='id' ? false: true
            })

        })
    }

    return (
        <React.Fragment>
            {(race && race.length > 0) ? <Button onClick = {()=>proposeCSVDownload(race,'races')}>Download</Button> : ''}
            <Button onClick={(e) => handleDeleteClick(e)}>  Delete all  </Button>
            {race && race.length > 0 ? <DataGrid
                checkboxSelection
                columns={columns}
                rows={race}
                onRowSelectionModelChange={(ids) => setSelected(ids)}
            />: ''}
        </React.Fragment>
    )
}