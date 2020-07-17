import React, { Component } from 'react';

import './SideMenu.css';

export default class SideMenu extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <nav id="mySidenav" className="sidenav">
        <a href="#">About</a>
        <a href="#">Services</a>
        <a href="#">Clients</a>
        <a href="#">Contact</a>
      </nav>
    );
  }

}