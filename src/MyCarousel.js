import React, { Component } from 'react'
import Image from 'react-bootstrap/Image'
import { Link } from 'react-router-dom';
import P1 from './A.jpg'
import P2 from './B.jpg'
import P3 from './C.jpg'
import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyCarousel() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };
  //activeIndex={index} onSelect={handleSelect}
  return (
    <Carousel axis="vertical" autoFocus={true} autoPlay={true} pause = {false}>
      <Carousel.Item axis="vertical" interval={2000}>        
        <Image className="d-block img-fluid" src={P1} />
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item interval={2000}>        
      <Image src={P2} className="d-block w-100"/>
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
       </Carousel.Item>        
       <Carousel.Item interval={2000}>        
      <Image src={P3} className="d-block w-100"/>
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default MyCarousel;

