import { is } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component } from 'react';

import diagramXML from '../../diagram.bpmn';

import './PropertiesView.css';

/// CSS COMPONENTS
import '../components-global-styles/button.css';
import '../components-global-styles/input.css';

export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };
  }

  /// [WI15141] Evento proprio do reactJS.
  /// Depois do construtor, ele é o proximo da fila de execução.
  componentDidMount() {

    const {
      modeler
    } = this.props;

    /// [WI15141] Método do modeler provisionado pela bpmnjs
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

    /// [WI15141] Método do modeler provisionado pela bpmnjs
    /// O primeiro parametro é o evento que será executado
    /// O segundo parametro é o elemento retornado do evento
    modeler.on('element.changed', (pElemento) => {

      /// [WI15141] Esse atributo element é padrão do modeler, não alterar.
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

  /// [WI15141] Função que renderiza o html da página conforme funcionalidades
  render() {

    /// [WI15141] Importa o diagrama
    async function importDiagram() {   
      try {

        // Pega a referência do input pelo ID.
        var uploadedFile = document.getElementById('uploadFile');

        var file = uploadedFile.files[0], // Pega o dado "cru" do arquivo.
            reader = new FileReader(); // Cria um leitor de arquivos.
        
        // Faz o leitor carregar todo o arquivo e ao fim lê os dados do arquivo.
        reader.onloadend = function(event) {
          // captura o arquivo como texto
          var text = event.target.result;
          
          // Adiciona ele no modelador
          modeler.importXML(text);
        }

        // Lê o arquivo "cru" como texto.
        reader.readAsText(file);

      } catch (err) {
        alert("Não foi possível, salvar o diagrama BPMN 2.0, situação encontrada: ", err);
        console.error('could not save BPMN 2.0 diagram', err);
      }
    }

    /// [WI15141] Função para exportar o diagrama como xml.
    async function exportDiagram() {
      try {

        // [WI15141] Chama a função própria do modelador de bpmn, para montar o arquivo no padrão xml.
        var xml = await modeler.saveXML({ format: true });

        // Pega o Id do botão/link de download.
        var btnDownload = document.getElementById("btnDownload");

        // Converte o arquivo para xml.
        var file = new Blob([xml], {type: 'text/xml'});

        // Marca o botão como referência para baixar o xml.
        btnDownload.href = URL.createObjectURL(file);

        // Define o nome do arquivo que será baixado.
        btnDownload.download = 'diagram.bpmn';

      } catch (err) {
        alert("Não foi possível, salvar o diagrama BPMN 2.0, situação encontrada: ", err);
        console.error('could not save BPMN 2.0 diagram', err);
      }
    }

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    /// [WI15141] HTML retornado, com os demais components
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
                    <input  id="uploadFile"
                            className="input-file" type="file" name="my_file"
                            onChange={ () => {
                              importDiagram();
                            }} />
                  }

                  {
                    /// [WI15141] Não use exportDiagram() porque o reactjs não reconhece os ().
                    /// https://upmostly.com/tutorials/react-onclick-event-handling-with-examples#:~:text=In React%2C the onClick handler,Function After Clicking a Button
                    <a className="button" id="btnDownload" onClick={exportDiagram}>Download</a>
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

/// [WI15141] Component das propriedades do elemento
function ElementProperties(props) {
  let {
    element,
    modeler
  } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  /// [WI15141] Atualiza o nome do objeto selecionado
  function updateName(name) {
    const modeling = modeler.get('modeling');

    modeling.updateLabel(element, name);
  }

  /// [WI15141] Atualiza a descrição do objeto selecionado
  function updateDescription(description) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:description': description
    });
  }

  /// [WI15141] Atualiza o comando do objeto selecionado
  function updateBusinessRule(description) { 
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:businessrule': description
    });
  }

  
  /// [WI15141] Faz da tarefa selecionada uma tarefa de serviço
  function makeServiceTask(name) {
    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask'
    });
  }

  /// [WI15141] Não remover inicializadores, eles definem o tipo de dado original da variável.
  let txtName = '', txtDescription = '', txtBusinessRule = '';

  /// [WI15141] Salva os valores nos campos correspondentes, SE o tamanho da variável for maior que 0,
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

  /// [WI15141] Retorna o HTML do component
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
                    className="input"
                    placeholder={ element.businessObject.name }
                    onChange={ (event) => {
                      txtName = event.target.value;
                    }} />
          </div>
        </div>

        { /* [WI15141] Campo: descrição */
          is(element, 'custom:descriptionHolder') &&
            <div className='field'>
              <label>Descrição</label>
              <div>
                <input  input= { txtDescription } 
                        className="input" 
                        placeholder={ element.businessObject.get('custom:description') } 
                        onChange={ (event) => {
                          txtDescription = event.target.value;
                        }} />
              </div>
            </div>
        }

        { /* [WI15141] Campo: comando */
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

        {/* [WI15141] Evento que fecha o popup*/}
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