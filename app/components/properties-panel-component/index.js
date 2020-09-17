import ReactDOM from 'react-dom';
import React from 'react';

import PropertiesComponent from './PropertiesComponent';

export default class PropertiesPanel {

  constructor(options) {

    const {
      modeler,
      container
    } = options;

    ReactDOM.render(
      <PropertiesComponent modeler={modeler} />,
      container
    );
  }
}