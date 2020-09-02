import { is } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component } from 'react';

import './PropertiesView.css';

/// CSS COMPONENTS
import '../css-components/button.css';
import '../css-components/input.css';

export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };
  }

  /// Evento proprio do reactJS.
  /// Depois do construtor, ele é o proximo da fila de execução.
  componentDidMount() {

    const {
      modeler
    } = this.props;

    /// Método do modeler provisionado pela bpmnjs
    /// O primeiro parametro é o evento que será executado
    /// O segundo parametro é o elemento retornado do evento
    modeler.on('selection.changed', (pElemento) => {

      /// Esse atributo element é padrão do modeler, não alterar.
      const {
        element
      } = this.state;

      this.setState({
        selectedElements: pElemento.newSelection,
        element: pElemento.newSelection[0]
      });
    });

    /// Método do modeler provisionado pela bpmnjs
    /// O primeiro parametro é o evento que será executado
    /// O segundo parametro é o elemento retornado do evento
    modeler.on('element.changed', (pElemento) => {

      /// Esse atributo element é padrão do modeler, não alterar.
      const {
        element
      } = pElemento;

      const {
        element: currentElement
      } = this.state;

      if (!currentElement) {
        return;
      }

      /// Atualiza o panel, se o elemento selecionado atualmente mudar
      if (element.id === currentElement.id) {
        this.setState({
          element
        });
      }

    });
  }

  /// Função que renderiza o html da página conforme funcionalidades
  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    /// HTML retornado, com os demais components
    return (
      <div>
        {
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length === 0
            &&  <div>
                  {
                    //button onClick={ exportDiagram(modeler) }>Download</button>
                  }
                  <span>Selecione um elemento para edita-lo.</span>
                </div>
        }

        {
          selectedElements.length > 1
            && <span>Selecione apenas um elemento por vez.</span>
        }

      </div>
    );
  }
}

/// Component das propriedades do elemento
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

  
  /// Faz da tarefa selecionada uma tarefa de serviço
  function makeServiceTask(name) {
    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask'
    });
  }

  /// Não remover inicializadores, eles definem o tipo de dado original da variável.
  let txtName = '', txtDescription = '', txtBusinessRule = '';

  /// Salva os valores nos campos correspondentes, SE o tamanho da variável for maior que 0,
  /// o que simboliza uma edição no campo.
  function salvar() {
    if (txtName.length > 0) {
      updateName(txtName);
    }

    if (txtDescription.length > 0) {
      updateDescription(txtDescription);
    }

    if (txtBusinessRule.length > 0) {
      updateBusinessRule(txtBusinessRule);
    }
  }

  /// Retorna o HTML do component
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
            <input input={ txtName } 
                    placeholder={ element.businessObject.name }
                    onChange={ (event) => {
                      txtName = event.target.value;
                    }} />
          </div>
        </div>

        { /* Campo: descrição */
          is(element, 'custom:descriptionHolder') &&
            <div className='field'>
              <label>Descrição</label>
              <div>
                <input  input= { txtDescription } 
                        placeholder={ element.businessObject.get('custom:description') } 
                        onChange={ (event) => {
                          txtDescription = event.target.value;
                        }} />
              </div>
            </div>
        }

        { /* Campo: comando */
          is(element, 'custom:businessRuleHolder') &&
            <div className='field'>
              <label>Comando</label>
              <div>
                  <textarea input= { txtBusinessRule } 
                            placeholder={ element.businessObject.get('custom:businessrule') } 
                            onChange={ (event) => {
                              txtBusinessRule = event.target.value;
                            }} />
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
            salvar();
          }}> Salvar
        </button>

        <button
          onClick={() => {
            var x = document.getElementById("elementProperties");
            x.style.display = "none";
          }}> Fechar
        </button>
      </div>
    </div>
  );
}