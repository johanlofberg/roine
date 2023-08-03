import React from "react";
import { Link } from 'react-router-dom';
import { ButtonGroup } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGears, faTrophy, faUserGroup, faStopwatch20 } from "@fortawesome/free-solid-svg-icons";

export default function Competitorlist(props) {

    return (
        <ButtonGroup>
            <container align='right'>
                <Tooltip title="Racevy"><Button color="inherit" as={Link} to='/createrace'><FontAwesomeIcon icon={faGears} /></Button></Tooltip>
                <Tooltip title="Tävlandevy"><Button color="inherit" as={Link} to='/competitorlist'><FontAwesomeIcon icon={faUserGroup} /></Button></Tooltip>
                <Tooltip title="Tidtagningsvy"><Button color="inherit" as={Link} to='/scoreboard'><FontAwesomeIcon icon={faStopwatch20} /></Button></Tooltip>
                <Tooltip title="Resultatvy" ><Button color="inherit" as={Link} to='/results'><FontAwesomeIcon icon={faTrophy} /></Button></Tooltip>
            </container>
        </ButtonGroup>);
}