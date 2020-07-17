import Modeler from 'bpmn-js/lib/Modeler';

import PropertiesPanel from './components/properties-panel';
import SideMenu from './components/side-menu';

import customModdleExtension from './moddle/custom.json';

import diagramXML from './diagram.bpmn';

const $menuContainer = document.querySelector('#menu-container');
const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');

const sideMenu = new SideMenu({
  container: $menuContainer
});

const modeler = new Modeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension
  },
  keyboard: {
    bindTo: document.body
  }
});

const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);