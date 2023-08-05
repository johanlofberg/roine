import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink } from 'react-router-dom';

const myURL = {
  display:'block',
  width:'100%',
  height:'100%',
  padding:0,
  margin:0,
  zfdex:10,
};

/*
export default function Menu(props) {
  return (
    <header>      
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="p-3">    
      <container>
        <Navbar.Brand as={Link} to="/">RoinE</Navbar.Brand>
        <Navbar.Toggle />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">              
              <NavDropdown title="Races" id="race-nav-dropdown">
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all available races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all available races</NavDropdown.Item>                
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all my races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all my completed races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View my planned races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/createrace" >Create new race</NavDropdown.Item>
              </NavDropdown>

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
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/">
                  About
                </NavLink>
              </Nav.Link>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/">
                  Contact
                </NavLink>
              </Nav.Link>
            </Nav>
            <Nav className="gap-2">
              <Nav.Link className="btn btn-primary" href="#">Login</Nav.Link>
              <Nav.Link eventKey={2} className="btn btn-light text-black" href="#">
                Sign up
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>                  
          </container>
      </Navbar>
    </header>
  );
}
*/



















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
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all available races</NavDropdown.Item>                
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all my races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View all my completed races</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/races">View my planned races</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item state={{ view: 'new' }} className="text-decoration-none text-black" as={Link} to="/createrace" >Create new race</NavDropdown.Item>
                <NavDropdown.Item className="text-decoration-none text-black" as={Link} to="/importrace" >Import race</NavDropdown.Item>
              </NavDropdown>
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
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/">
                  About
                </NavLink>
              </Nav.Link>
              <Nav.Link>
                <NavLink className="text-decoration-none text-white" to="/">
                  Contact
                </NavLink>
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
    </header>
  );
}




/*
<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="p-3">                  
<Nav>
<NavDropdown title="Dropdown" id="collasible-nav-dropdown">
  <NavDropdown.Item as={Link} to="/races" className = "text-decoration-none text-black">Action</NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/races">
    Another action
  </NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/races">Something</NavDropdown.Item>
  <NavDropdown.Divider />
  <NavDropdown.Item>
    Separated link
  </NavDropdown.Item>
</NavDropdown>
  <Nav.Link>
    <Link className="text-decoration-none text-black" as={Link} to="/races">
      Races
    </Link>                            
    </Nav.Link>
</Nav>                              
</Navbar>*/