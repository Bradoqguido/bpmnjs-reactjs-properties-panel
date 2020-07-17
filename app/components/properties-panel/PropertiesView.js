import { is } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component } from 'react';

import './PropertiesView.css';

export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };
  }

  componentDidMount() {

    const {
      modeler
    } = this.props;

    modeler.on('selection.changed', (e) => {

      const {
        element
      } = this.state;

      this.setState({
        selectedElements: e.newSelection,
        element: e.newSelection[0]
      });
    });


    modeler.on('element.changed', (e) => {

      const {
        element
      } = e;

      const {
        element: currentElement
      } = this.state;

      if (!currentElement) {
        return;
      }

      // update panel, if currently selected element changed
      if (element.id === currentElement.id) {
        this.setState({
          element
        });
      }

    });
  }

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>
        {
          /* inserir o popup aqui*/
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length === 0
            && <span>Selecione um elemento para edita-lo.</span>
        }

        {
          selectedElements.length > 1
            && <span>Selecione apenas um elemento por vez.</span>
        }

      </div>
    );
  }

}


function ElementProperties(props) {
  let {
    element,
    modeler
  } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  /// Atualiza o nome do objeto selecionado
  function updateName(name) {
    const modeling = modeler.get('modeling');

    modeling.updateLabel(element, name);
  }

  /// Atualiza a descrição do objeto selecionado
  function updateDescription(description) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:description': description
    });
  }

  /// Atualiza o comando do objeto selecionado
  function updateBusinessRule(description) { 
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:businessrule': description
    });
  }

  
  /// Faz do serviço selecionado uma tarefa de serviço
  function makeServiceTask(name) {
    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask'
    });
  }

  let txtName, txtDescription, txtBusinessRule;

  return (
    <div id="elementProperties" className="element-properties popup" key={ element.id }>    
      <div className="popup_inner">
        {/*<div>
          <label>id</label>
          <span>{ element.id }</span>
        </div>*/}

        { /* Campo: titulo da tarefa */ }
        <div className="field">
          <label>Tarefa</label>
          <div>
            <input value={ element.businessObject.name || '' } 
                      onChange={ (event) => {
                        updateName(event.target.value)
                      } 
                    } />
          </div>
        </div>

        { /* Campo: descrição */
          is(element, 'custom:descriptionHolder') &&
            <div className='field'>
              <label>Descrição</label>
              <div>
                <input value={ element.businessObject.get('custom:description') } 
                          onChange={ (event) => {
                            updateDescription(event.target.value)
                          } 
                        } />
              </div>
            </div>
        }

        { /* Campo: comando */
          is(element, 'custom:businessRuleHolder') &&
            <div className='field'>
              <label>Comando</label>
              <div>
                  <textarea value={ element.businessObject.get('custom:businessrule') } 
                              onChange={ (event) => {
                                updateBusinessRule(event.target.value)
                              } 
                            } />
              </div>
            </div>
        }

        <div className='field'>
          <label>Ações</label>
          {
            is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') &&
              <button className="btnTarefaParaServico" 
                      onClick={ makeServiceTask }>Fazer desta tarefa um serviço</button>
          }
        </div>

        {/* Evento que fecha o popup*/}
        <button
          className="btnSalvar"
          onClick={() => {
            var x = document.getElementById("elementProperties");
            x.style.display = "none";
          }}> Salvar
        </button>

      </div>
    </div>
  );
}