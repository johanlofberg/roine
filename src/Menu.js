import React from 'react';
import { Nav, Container, Navbar, NavDropdown } from 'react-bootstrap';
//import Container from 'react-bootstrap/Container';
//import Nav from 'react-bootstrap/Nav';
//import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink } from 'react-router-dom';

export default function Menu(props) {
  return (
    <header>
      <Navbar collapseOnSelect expand="md" bg="dark" variant="dark" className="p-3">
        <Container>
          <Navbar.Brand as={Link} to="/">RoinE</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse id="responsive-navbar-nav" >
            <Nav className="me-auto" >
              <NavDropdown title="Races" id="race-nav-dropdown">
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all available races</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item state={{ view: 'new' }} className="text-decoration-none text-black" as={Link} to="/createrace" >Create new race</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/importrace" >Import race</NavDropdown.Item>
              </NavDropdown>
             
              <Nav.Link key = 'profilepg' eventkey="21" className="text-decoration-none text-white" as={Link} to="/profile">Profile</Nav.Link>

              <Nav.Link  eventkey="22" className="text-decoration-none text-white" as={Link} to="/races">Races</Nav.Link>

              <Nav.Link  eventkey="23" className="text-decoration-none text-white" as={Link} to="/scoreboard">Scoreboard</Nav.Link>           

            </Nav>
            
            <Nav className="gap-2">

            <NavDropdown eventKey = '/' title="Admin" id="admin-nav-dropdown">
                <NavDropdown.Item  eventkey = '11' className="text-decoration-none text-black" as={Link} to="/admin/races">Races</NavDropdown.Item>
                <NavDropdown.Item  eventkey = '12' className="text-decoration-none text-black" as={Link} to="/admin/users">Users</NavDropdown.Item>
                <NavDropdown.Item  eventkey = '13' className="text-decoration-none text-black" as={Link} to="/admin/racelist">Race lists</NavDropdown.Item>
              </NavDropdown>
              
              <Nav.Link eventkey = 'L1' className="btn btn-primary" as={Link} to="/login">Login   </Nav.Link>
              <Nav.Link eventkey = 'L2' as={Link}  className="btn btn-primary" to="/login">Sign up</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}


export function Menuold(props) {
  return (
    <header>
      <Navbar collapseOnSelect expand="md" bg="dark" variant="dark" className="p-3">
        <Container>
          <Navbar.Brand as={Link} to="/">RoinE</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse id="responsive-navbar-nav" >
            <Nav className="me-auto" >
              <NavDropdown title="Races" id="race-nav-dropdown">
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all available races</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item state={{ view: 'new' }} className="text-decoration-none text-black" as={Link} to="/createrace" >Create new race</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/importrace" >Import race</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Admin" id="race-nav-dropdown">
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/admin/races">Races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/admin/users">Users</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/profile">
                  Profile
                </NavLink>
              </Nav.Link>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/races">
                  Races
                </NavLink>
              </Nav.Link>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/scoreboard">
                  Scoreboard
                </NavLink>
              </Nav.Link>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/scanner">
                  Scanner
                </NavLink>
              </Nav.Link>
            </Nav>
            <Nav className="gap-2">
              <Nav.Link eventkey='loginbutton' className="btn btn-primary" href="#">Login</Nav.Link>
              <Nav.Link eventkey='signbutton' className="btn btn-light text-black" href="#">
                Sign up
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

