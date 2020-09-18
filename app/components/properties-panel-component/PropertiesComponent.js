import { is } from "bpmn-js/lib/util/ModelUtil";
import KeyboardEventHandler from "react-keyboard-event-handler";

import React, { Component } from "react";

import "./PropertiesComponent.css";

/// CSS COMPONENTS
import "../components-global-styles/button.css";
import "../components-global-styles/input.css";
import "../components-global-styles/popup.css";
import "../components-global-styles/snackbar.css";

export default class PropertiesComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blnAbrirPropriedades: false,
      lstElementosSelecionados: [],
      objElemento: null,
    };
  }

  /**
   * ## componentDidMount
   * ReactJS Life-Cycle Functions.
   * Função que executa sempre que o component for carregado.
   * Depois do construtor, ele é o proximo da fila de execução.
   */
  componentDidMount() {
    const { modeler } = this.props;

    /**
     * ## ON
     * BPMNJS 2.0 Life-Cycle Functions.
     *
     * Evento chamado pelo modeler,
     * que possibilita executar comandos enquanto o elemento é manipulado na tela.
     *
     * Sempre que o usuário mudar de objeto selecionado,
     * é mudado o status dos atributos globais lstElementosSelecionados e elemento.
     *
     * @param {String} [pTipoEvento] Tipo de evento a ser executado.
     * @param {Object} [pRespostaEvento] Resposta do evento executado.
     */
    modeler.on("selection.changed", (pEvento) => {
      const { objElemento } = this.state;

      this.setState({
        lstElementosSelecionados: pEvento.newSelection,
        objElemento: pEvento.newSelection[0],
      });
    });

    /**
     * ## ON
     * BPMNJS 2.0 Life-Cycle Functions.
     *
     * Evento chamado pelo modelador,
     * que possibilita executar comandos enquanto o elemento é manipulado na tela.
     *
     * Sempre que o usuário mudar de objeto ou o objeto
     * é mudado o status dos atributos globais lstElementosSelecionados e elemento.
     *
     * @param {String} [pTipoEvento] Tipo de evento a ser executado.
     * @param {Object} [pRespostaEvento] Resposta do evento executado.
     */
    modeler.on("element.changed", (pElemento) => {
      // Esse atributo element é padrão do pElemento, não alterar.
      const { element } = pElemento;

      const { objElemento: currentElement } = this.state;

      if (!currentElement) {
        return;
      }

      /// Atualiza o panel, se o elemento selecionado atualmente mudar.
      if (element.id === currentElement.id) {
        this.setState({
          element,
        });
      }
    });
  }

  /**
   * ## render
   * ReactJS Life-Cycle Functions.
   *
   * Função que renderiza o html da página conforme funcionalidades.
   *
   * @return {Object} Retorna o HTML para o frontend.
   */
  render() {
    /**
     * ## importarDiagrama
     * Função que importa o diagrama,
     * lê o arquivo selecionado pelo usuário e atribui ao modeler.
     */
    async function importarDiagrama() {
      try {
        // Pega a referência do input pelo ID.
        var uploadedFile = document.getElementById("btnUpload");

        var file = uploadedFile.files[0], // Pega o dado "cru" do arquivo.
          reader = new FileReader(); // Cria um leitor de arquivos.

        // Faz o leitor carregar todo o arquivo e ao fim lê os dados do arquivo.
        reader.onloadend = function (event) {
          // captura o arquivo como texto.
          var text = event.target.result;

          // Adiciona ele no modelador.
          modeler.importXML(text);
        };

        // Lê o arquivo "cru" como texto.
        reader.readAsText(file);
      } catch (pErro) {
        alert(
          "Não foi possível, importar o diagrama BPMN 2.0, situação encontrada: ",
          pErro
        );
        console.error(
          "Não pudemos importar o seu BPMN 2.0. Situação encontrada: ",
          pErro
        );
      }
    }

    /**
     * ## importarDiagrama
     * Função para exportar o diagrama para o XML do BPMNJS,
     * captura todos os elementos do modeler e converte em xml.
     * @Referência https://upmostly.com/tutorials/react-onclick-event-handling-with-examples#:~:text=In React%2C the onClick handler,Function After Clicking a Button
     */
    async function exportarDiagrama() {
      try {
        // Chama a função própria do modelador de bpmn, para montar o arquivo no padrão xml.
        var xml = await modeler.saveXML({ format: true });

        // Pega o Id do botão/link de download.
        var btnDownload = document.getElementById("btnDownload");

        // Converte o arquivo para xml.
        var file = new Blob([xml], { type: "text/xml" });

        // Marca o botão como referência para baixar o xml.
        btnDownload.href = URL.createObjectURL(file);

        // Define o nome do arquivo que será baixado.
        btnDownload.download = "diagram.bpmn";
      } catch (pErro) {
        alert(
          "Não foi possível, exportar o diagrama BPMN 2.0, situação encontrada: ",
          pErro
        );
        console.error(
          "Não pudemos exportar o seu BPMN 2.0. Situação encontrada: ",
          pErro
        );
      }
    }

    const { modeler } = this.props;

    const {
      blnAbrirPropriedades,
      lstElementosSelecionados,
      objElemento,
    } = this.state;

    // HTML retornado, com os demais components.
    return (
      <div>
        {
          lstElementosSelecionados.length === 1 &&
          /* Detecta as teclas precionadas. */
          <KeyboardEventHandler
            handleKeys={["ctrl + space"]}
            onKeyEvent={(key, e) => {
              // Ativa ou desativa a
              if (
                !blnAbrirPropriedades
              ) {
                this.setState({ blnAbrirPropriedades: true });
              } else {
                this.setState({ blnAbrirPropriedades: false });
              }
            }}
          />
        }

        {
          /* Abre as propriedades do elemento. */
          blnAbrirPropriedades && (
            <ElementProperties modeler={modeler} objElemento={objElemento} />
          )
        }

        {
          /* Instruções para o usuário. */
          lstElementosSelecionados.length === 1 && (
            <span>
              Pressione: <b>ctrl + espaço</b> para <b>entrar</b> e <b>sair</b> do modo de edição.
            </span>
          )
        }

        {
          /* Instruções para o usuário + import e export de diagramas. */
          lstElementosSelecionados.length === 0 && (
            <div>
              {
                <input
                  id="btnUpload"
                  className="input-file btnAbrirBPMN"
                  type="file"
                  name="my_file"
                  onChange={() => {
                    importarDiagrama();
                  }}
                />
              }

              {
                <a
                  className="button btnDownload"
                  id="btnDownload"
                  onClick={exportarDiagrama}
                >
                  Download
                </a>
              }
              <span>
                Selecione um elemento e pressione: <b>ctrl + espaço</b> para
                edita-lo.
              </span>
            </div>
          )
        }

        {
          /* Instruções para o usuário. */
          lstElementosSelecionados.length > 1 &&
            <div>
              <span>Selecione apenas <b>um elemento</b> por vez.</span>
            </div>
        }
      </div>
    );
  }
}

/**
 * ## ElementProperties
 * Component das propriedades do elemento.
 * captura todos os elementos do modeler e converte em xml.
 * @param {Object} [props] Paramêtros do component principal agrupados em um objeto.
 * @param {Var} [objElemento] props.objElemento selecionado pelo usuário.
 * @param {Var} [modeler] props.Modeler do BPMNJS.
 */
function ElementProperties(props) {
  let { objElemento, modeler } = props;

  if (objElemento.labelTarget) {
    objElemento = objElemento.labelTarget;
  }

  /**
   * ## atualizarNome
   * Atualiza o nome do objeto selecionado.
   * @param {String} [name] Nome do objElemento.
   */
  function atualizarNome(name) {
    const modeling = modeler.get("modeling");
    modeling.updateLabel(objElemento, name);
  }

  /**
   * ## atualizarDescricao
   * Atualiza a descrição do objeto selecionado.
   * @param {String} [pDescricao] Nome do elemento.
   */
  function atualizarDescricao(pDescricao) {
    const modeling = modeler.get("modeling");

    // Atualiza as propriedades individuais do elemento, com base no campo editado.
    modeling.updateProperties(objElemento, {
      "custom:descricao": pDescricao,
    });
  }

  /**
   * ## atualizarRegraNegocio
   * Atualiza a regra negócio do objeto selecionado.
   * @param {String} [pRegraNegocio] Nome do elemento.
   */
  function atualizarRegraNegocio(pRegraNegocio) {
    const modeling = modeler.get("modeling");

    // Atualiza as propriedades individuais do elemento, com base no campo editado.
    modeling.updateProperties(objElemento, {
      "custom:regraNegocio": pRegraNegocio,
    });
  }

  /**
   * ## makeServiceTask
   * Faz da tarefa selecionada uma tarefa de serviço.
   */
  function makeServiceTask() {
    const bpmnReplace = modeler.get("bpmnReplace");

    // Atualiza as propriedades individuais do elemento, com base no campo editado.
    bpmnReplace.replaceElement(objElemento, {
      type: "bpmn:ServiceTask",
    });
  }

  // Não remover inicializadores, eles definem o tipo de dado original da variável.
  let txtNome = "",
    txtDescricao = "",
    txtRegraNegocio = "";

  /**
   * ## salvarAlteracoes
   * Salva os valores nos campos correspondentes, SE o tamanho da variável for maior que 0,
   * o que simboliza uma edição no campo.
   */
  function salvarAlteracoes() {
    if (txtNome.length > 0) {
      atualizarNome(txtNome);
    }

    if (txtDescricao.length > 0) {
      atualizarDescricao(txtDescricao);
    }

    if (txtRegraNegocio.length > 0) {
      atualizarRegraNegocio(txtRegraNegocio);
    }
  }

  // Retorna o HTML do component.
  return (
    <div
      id="propriedadesDoElemento"
      className="elemento-properties popup"
      key={objElemento.id}
    >
      <div className="popup_inner">
        {/*<div>
          <label>id</label>
          <span>{ objElemento.id }</span>
        </div>*/}

        {/* Campo: titulo da tarefa. */}
        <div className="field">
          <label>Tarefa</label>
          <div>
            <input
              input={txtNome}
              className="input"
              placeholder={objElemento.businessObject.name}
              onChange={(event) => {
                txtNome = event.target.value;
              }}
            />
          </div>
        </div>

        {
          /* Campo: descrição. */
          is(objElemento, "custom:descricaoHolder") && (
            <div className="field">
              <label>Descrição</label>
              <div>
                <input
                  input={txtDescricao}
                  className="input"
                  placeholder={objElemento.businessObject.get(
                    "custom:descricao"
                  )}
                  onChange={(event) => {
                    txtDescricao = event.target.value;
                  }}
                />
              </div>
            </div>
          )
        }

        {
          /* Campo: comando. */
          is(objElemento, "custom:regraNegocioHolder") && (
            <div className="field">
              <label>Comando</label>
              <div>
                <textarea
                  input={txtRegraNegocio}
                  placeholder={objElemento.businessObject.get(
                    "custom:regraNegocio"
                  )}
                  onChange={(event) => {
                    txtRegraNegocio = event.target.value;
                  }}
                />
              </div>
            </div>
          )
        }

        <div className="field">
          <label>Ações</label>
          {is(objElemento, "bpmn:Task") &&
            !is(objElemento, "bpmn:ServiceTask") && (
              <button
                className="btnTarefaParaServico"
                onClick={makeServiceTask}
              >
                Fazer desta tarefa um serviço
              </button>
            )}
        </div>

        {/* Evento que fecha o popup. */}
        <button
          className="btnSalvar"
          onClick={() => {
            salvarAlteracoes();
            var x = document.getElementById("snackbar");

            // Adiciona a classe Show na Snackbar.
            x.className = "show";

            // Adiciona o texto desejado á Snackbar.
            x.textContent = 'Alterações salvas com sucesso!';

            // Após 3 segundos, é removida a classe Show da Snackbar.
            setTimeout(function () { x.className = x.className.replace("show", ""); }, 1500);
          }}
        >
          <b>Salvar</b>
        </button>

        {/* Snackbar */}
        <div id="snackbar"></div>

      </div>
    </div>
  );
}