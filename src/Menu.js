import React from 'react';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export default function Menu(props) {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="p-3">
      <Container >
        <Navbar.Brand href="/roine">RoinE</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link>
              {' '}
              <Link className="text-decoration-none text-white" to="/">
                Home
              </Link>
            </Nav.Link>
            <Nav.Link>
              {' '}
              <Link className="text-decoration-none text-white" to="/races">
                Races
              </Link>
            </Nav.Link>      
            <Nav.Link>
              {' '}
              <Link className="text-decoration-none text-white" to="/scoreboard">
                Tävlingsvy
              </Link>
            </Nav.Link>
            <Nav.Link>
              {' '}
              <Link className="text-decoration-none text-white" to="/results">
                Results
              </Link>
            </Nav.Link>                          
            <Nav.Link>
              {' '}
              <Link className="text-decoration-none text-white" to="/scanner">
                Scanner
              </Link>
            </Nav.Link>     
          </Nav>
          <Nav className="gap-2">
            <Nav.Link className="btn btn-primary" href="#">Login</Nav.Link>
            <Nav.Link eventKey={2} className="btn btn-light text-black" href="#">
              Sign up
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}