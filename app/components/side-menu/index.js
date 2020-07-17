import ReactDOM from 'react-dom';
import React from 'react';

import SideMenu from './SideMenu';


export default class SideMenuPanel {

  constructor(options) {
    const {
      container
    } = options;

    ReactDOM.render(
      <SideMenu />,
      container
    );
  }
}


