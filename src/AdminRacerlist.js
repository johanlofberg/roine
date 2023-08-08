import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { loadAllRacerList, deleteRacerListByID } from "./Database";
import { deepClone } from "./myUtilities";

export default function AdminRacerlist() {

    const [needsReload, setneedsReload] = useState(true)
    const [racerList, setRacerList] = useState([])
    const [selected, setSelected] = useState([])

    function handleDeleteClick() {
        const copyOfRacerList = deepClone(racerList)
        selected.forEach((id) => {
            console.log('deleting',id)
            deleteRacerListByID(id)
        })
        setRacerList(copyOfRacerList.filter((racerList) => { return !selected.includes(racerList.id) }))
    }

    useEffect(() => {
        if (needsReload) {
            loadAllRacerList().then((data) => {
                setRacerList(data)
                setneedsReload(false)
            }
            )
        }
    }, []);

    const columns = []

    if (racerList && racerList.length > 0) {
        Object.keys(racerList[0]).forEach((key,index) => {
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
            <Button onClick={(e) => handleDeleteClick(e)}>  Delete selected  </Button>
            {racerList && racerList.length > 0 ? <DataGrid
                checkboxSelection
                columns={columns}
                rows={racerList}
                onRowSelectionModelChange={(ids) => setSelected(ids)}
            />: ''}
        </React.Fragment>
    )
}