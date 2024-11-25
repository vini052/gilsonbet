import React, { Component } from "react";
import axios from "axios";
import './App.css'
import teamsData from './db/teams.json'

const teamLogos = {
  1: "https://static.wixstatic.com/media/29c778_f3d6773ce1634fc7b1c7e58ce9755b7e~mv2.png/v1/fit/w_500,h_500,q_90/29c778_f3d6773ce1634fc7b1c7e58ce9755b7e~mv2.webp",
  2: "https://static.wixstatic.com/media/29c778_57234607199b4ad8911a5bd42865b13d~mv2.png/v1/fit/w_500,h_500,q_90/29c778_57234607199b4ad8911a5bd42865b13d~mv2.png"
};

class Header extends Component {
  render() {
    const { depositar, toggleApostasCriadas } = this.props;

    return (
      <div className="header">
        <img className="logo" src={require("./assets/GilsonBet.png")} alt="Gilson Bet Logo" />
        <ul className="Scroll-Sports">
          <li><a>Futebol</a></li>
          <li><a>Basquete</a></li>
        </ul>
        <div className="deposito" onClick={depositar}><a>Depositar</a></div>
        <button className="apostas-criadas-btn" onClick={toggleApostasCriadas}>
          Ver Apostas Criadas
        </button>
        <Profile />
      </div>
    );
  }
}


class Profile extends Component {
  render() {
    return (
      <div className="profile">
        <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/FFFFFF/user--v1.png" alt="user--v1" />
        <a>R$ 1900.00</a>
      </div>
    );
  }
}

class Matches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jogos: [],
      equipes: teamsData.equipes,
      jogoSelecionado: null,
    };
  }

  componentDidMount() {
    axios
      .get('http://localhost:8080')
      .then(response => {
        this.setState({ jogos: response.data });
        this.props.carregarJogos(response.data); // Passa os jogos para o estado do App
        console.log("Jogos carregados do backend:", this.state.jogos);
      })
      .catch(error => {
        console.error('Erro ao buscar os jogos do backend:', error.message);

        // Fallback para carregar JSON local
        import('./db/jogos.json')
          .then(localData => {
            this.setState({ jogos: localData.default });
            this.props.carregarJogos(localData.default); // Passa os jogos para o estado do App
            console.log("Jogos carregados do arquivo local:", this.state.jogos);
          })
          .catch(err => console.error("Erro ao carregar JSON local:", err.message));
      });
  }

  getTeamInfo(teamId) {
    return this.state.equipes.find(team => team.codigo === teamId) || {};
  }

  selecionarJogo(jogo) {
    this.setState({ jogoSelecionado: jogo });
  }

  voltarParaLista() {
    this.setState({ jogoSelecionado: null });
  }

  adicionarAposta(jogo, mercado, odd, dinheiro) {
    const ganhos = (odd * dinheiro).toFixed(2); // Calcula os ganhos possíveis
    const aposta = {
      idJogo: jogo.eventId,
      mercado,
      odd,
      dinheiro,
      ganhos,
    };
    this.props.adicionarAposta(aposta); // Adiciona a aposta no estado do App
    this.voltarParaLista(); // Retorna à lista de jogos
  }

  render() {
    const { jogos, equipes, jogoSelecionado } = this.state;

    if (jogoSelecionado) {
      const mandante = this.getTeamInfo(jogoSelecionado.participant1);
      const visitante = this.getTeamInfo(jogoSelecionado.participant2);

      return (
        <Jogo
          id={jogoSelecionado.eventId}
          jogo={jogoSelecionado}
          mandante={mandante}
          visitante={visitante}
          voltar={() => this.voltarParaLista()}
          exibirAposta={this.props.exibirAposta}
          adicionarAposta={(mercado, odd, dinheiro) => this.adicionarAposta(jogoSelecionado, mercado, odd, dinheiro)}
        />
      );
    }

    return (
      <div className="Matches">
        {jogos.map((jogo, index) => {
          const mandanteInfo = this.getTeamInfo(jogo.participant1);
          const visitanteInfo = this.getTeamInfo(jogo.participant2);

          return (
            <div
              key={index}
              className="Game-Card"
              onClick={() => this.selecionarJogo(jogo)}
            >
              <Game
                jogo={{
                  campeonato: "Brasileirão Série A",
                  data: jogo.date,
                  hora: jogo.time,
                  "odd-casa": jogo.odds.results[0],
                  "odd-empate": jogo.odds.results[1],
                  "odd-fora": jogo.odds.results[2]
                }}
                mandante={mandanteInfo}
                visitante={visitanteInfo}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends Component {
  render() {
    const { campeonato, data, hora, ["odd-casa"]: oddCasa, ["odd-empate"]: oddEmpate, ["odd-fora"]: oddFora } = this.props.jogo;
    const { mandante, visitante } = this.props;

    return (
      <div className="info-game">
        <div className="header-game">
          <div>
            <img width="16" height="16" src="https://img.icons8.com/ios-glyphs/30/969696/football2--v1.png" alt="football icon" />
            <h2>{campeonato}</h2>
          </div>
          <h2>{data} / {hora}</h2>
        </div>
        <div className="vs-icons">
          <div className="time">
            <h3>{mandante.nome || 'Time Mandante'}</h3>
            <img src={mandante.escudo || ''} alt="escudo mandante" />
          </div>
          <span>VS</span>
          <div className="time">
            <img src={visitante.escudo || ''} alt="escudo visitante" />
            <h3>{visitante.nome || 'Time Visitante'}</h3>
          </div>
        </div>
        <div className="odds">
          <div className="odd"><div>1</div> {oddCasa}</div>
          <div className="odd"><div>X</div> {oddEmpate}</div>
          <div className="odd"><div>2</div> {oddFora}</div>
        </div>
      </div>
    );
  }
}

class Deposito extends Component {
  constructor(props) {
    super(props);
    this.state = { valorDeposito: 0 };

    this.mudaValor = this.mudaValor.bind(this)
  }

  mudaValor = (e) => {
    this.setState({ valorDeposito: e.target.value });
  };

  render() {
    return (
      <div className="Banca" style={{ display: this.props.show ? "flex" : "none" }}>
        <h2>Qual a quantia que você quer depositar?</h2>
        <div className="result"><span className="line-span"/></div>
        <div className="input-valor">
          <input type="number" placeholder="Valor" onChange={this.mudaValor} />
          <div><p>R$</p></div>
        </div>
        <div className="span-valores"><span className="line-span"/><span className="valor-span">Digite ou clique em um valor para adicionar</span><span className="line-span"/></div>
        <div className="valores-padrao"><a>10</a><a>50</a><a>100</a><a>200</a><a>500</a><a>1000</a></div>
        <div className="deposito-actions">
          <div className="deposit">Depositar</div>
          <div className="cancel" onClick={this.props.fecharDeposito}>Cancelar</div>
        </div>
      </div>
    );
  }
}

class Aposta extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valorAposta: "", // Valor inserido pelo usuário
    };
  }

  handleInputChange = (event) => {
    const valor = event.target.value;
    // Atualiza o estado com o valor inserido
    this.setState({ valorAposta: valor });
  };

  enviarAposta = () => {
    const { cupomSelecionado } = this.props;
    const { valorAposta } = this.state;

    if (!valorAposta || valorAposta <= 0) {
      alert("Por favor, insira um valor válido para a aposta.");
      return;
    }

    const dadosAposta = {
      idJogo: cupomSelecionado.jogo.id, // ID do jogo
      mercado: cupomSelecionado.mercado, // Mercado escolhido
      odd: cupomSelecionado.odd, // Odd selecionada
      valorApostado: parseFloat(valorAposta), // Valor inserido pelo usuário
      retornos: (parseFloat(valorAposta) * parseFloat(cupomSelecionado.odd)).toFixed(2), // Retorno calculado
    };

    // Faz a requisição POST para o localhost
    axios
      .post("http://localhost:5000/aposta", dadosAposta)
      .then((response) => {
        console.log("Aposta enviada com sucesso:", response.data);
        alert("Aposta registrada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao enviar a aposta:", error);
        alert("Erro ao registrar a aposta. Tente novamente.");
      });
  };

  render() {
    const { show, toggleAposta, cupomSelecionado, removerAposta } = this.props;
    const { valorAposta } = this.state;

    // Calcula os ganhos
    const ganhos =
      valorAposta && cupomSelecionado
        ? (parseFloat(valorAposta) * parseFloat(cupomSelecionado.odd)).toFixed(2)
        : 0;

    return (
      <div className={`Aposta ${show ? "show" : ""}`}>
        <div className="header-aposta">
          {cupomSelecionado && (
            <img
              width="16"
              height="16"
              src="https://img.icons8.com/material-rounded/24/FFFFFF/trash.png"
              alt="trash"
              className="trash-icon"
              onClick={removerAposta} // Remove o cupom
            />
          )}
          <div className="header-title">
            <div>Cupom</div>
            <span>{cupomSelecionado ? 1 : 0}</span>
          </div>
          <img
            width="12"
            height="12"
            src="https://img.icons8.com/metro/26/FFFFFF/expand-arrow.png"
            alt="expand-arrow"
            className="expand-arrow"
            onClick={toggleAposta}
          />
        </div>
        {cupomSelecionado && (
          <div className="resultado-aposta">
            <div className="mercado-deposito">
              <div className="mercado-aposta">
                <b>{cupomSelecionado.tipo}</b>
                <p>{cupomSelecionado.mercado}</p>
              </div>
              <div className="deposito-aposta">
                <div className="options">
                  <b>{cupomSelecionado.odd}</b>
                  <img
                    width="16"
                    height="16"
                    src="https://img.icons8.com/material-rounded/24/969696/trash.png"
                    alt="trash"
                    className="trash-icon"
                    onClick={removerAposta}
                  />
                </div>
                {/* Input para o valor da aposta */}
                <input
                  placeholder="0.00"
                  className="input"
                  type="number"
                  value={valorAposta}
                  onChange={this.handleInputChange} // Monitora alterações no input
                />
              </div>
            </div>
            <div className="jogo-ganhos">
              <div className="jogo-aposta">
                {cupomSelecionado.jogo.mandante} - {cupomSelecionado.jogo.visitante}
              </div>
              {/* Mostra os ganhos se o valor da aposta for maior que 0 */}
              {valorAposta > 0 && (
                <div className="ganhos">
                  Retornos: R$ {ganhos}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Botão para confirmar a aposta */}
        <div className="confirmar-aposta" onClick={this.enviarAposta}>
          Aposte já
        </div>
      </div>
    );
  }
}

class Jogo extends Component {
  handleSelecionarOdd = (mercado, odd, tipo) => {
    const { jogo, mandante, visitante } = this.props;

    const cupom = {
      mercado,
      odd,
      tipo,
      jogo: {
        id: jogo.eventId,
        mandante: mandante.nome,
        visitante: visitante.nome,
        data: jogo.date,
        hora: jogo.time
      }
    };

    this.props.exibirAposta(cupom); // Passa os dados selecionados para o componente pai
  };

  render() {
    const { jogo, mandante, visitante, voltar } = this.props;
    const { date, time, odds } = jogo;

    return (
      <div className="Jogo-Tela">
        <h1 className="Titulo-Tela">Selecione sua Aposta</h1>
        <div className="Info-Tela">
          <div className="Header-Tela">
            <button onClick={voltar}>Voltar</button>
            <a>{`${date} | ${time}`}</a>
          </div>
          <div className="Times-Tela">
            <img src={mandante.escudo} alt="Mandante" />
            <h4>
              {mandante.nome || "Mandante"} - {visitante.nome || "Visitante"}
            </h4>
            <img src={visitante.escudo} alt="Visitante" />
          </div>
        </div>
        <div className="Texto-Separador">
          <div className="Linha-Tela"></div>
          <div className="Mercado">Mercados</div>
          <div className="Linha-Tela"></div>
        </div>
        <div className="Resultado-Tela">
          <h4>Resultado Final</h4>
          <div className="Odds-Resultado">
            <div
              className="oddResult"
              onClick={() => this.handleSelecionarOdd("Resultado Final", odds.results[0], mandante.nome)}
            >
              <div>1</div> {odds.results[0]}
            </div>
            <div
              className="oddResult"
              onClick={() => this.handleSelecionarOdd("Resultado Final", odds.results[1], "Empate")}
            >
              <div>X</div> {odds.results[1]}
            </div>
            <div
              className="oddResult"
              onClick={() => this.handleSelecionarOdd("Resultado Final", odds.results[2], visitante.nome)}
            >
              <div>2</div> {odds.results[2]}
            </div>
          </div>
        </div>
        <div className="Ambos-Tela">
          <h4>Ambos Times Marcam</h4>
          <div className="Odds-BTTS">
            <div
              className="oddBTTS"
              onClick={() => this.handleSelecionarOdd("Ambos Marcam", odds.btts[0], "Sim")}
            >
              <div>Sim</div> {odds.btts[0]}
            </div>
            <div
              className="oddBTTS"
              onClick={() => this.handleSelecionarOdd("Ambos Marcam", odds.btts[1], "Não")}
            >
              <div>Não</div> {odds.btts[1]}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ApostasCriadas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apostas: [], // Apostas carregadas do backend
      apostasComDetalhes: [], // Apostas com os detalhes cruzados dos jogos
    };
  }

  componentDidMount() {
    // Faz o GET no endpoint para buscar as apostas
    axios
      .get("http://localhost:5000/apostas")
      .then((response) => {
        const apostas = response.data;
        const { jogos } = this.props; // Jogos vindos do estado de App via props

        // Cruza as apostas com os jogos usando o idJogo
        const apostasComDetalhes = apostas.map((aposta) => {
          const jogoRelacionado = jogos.find(
            (jogo) => jogo.eventId === aposta.idJogo
          );

          return {
            ...aposta,
            jogo: jogoRelacionado || null, // Adiciona os detalhes do jogo ou null se não encontrar
          };
        });

        this.setState({ apostas, apostasComDetalhes });
      })
      .catch((error) => {
        console.error("Erro ao buscar as apostas do backend:", error.message);
      });
  }

  render() {
    const { apostasComDetalhes } = this.state;

    return (
      <div className="ApostasCriadas">
        <button onClick={this.props.voltar}>Voltar</button>
        <h2>Apostas Criadas</h2>
        {apostasComDetalhes.length === 0 ? (
          <p>Nenhuma aposta encontrada.</p>
        ) : (
          <div className="Apostas-Criadas">
            {apostasComDetalhes.map((aposta, index) => {
              const {
                mercado,
                odd,
                valorApostado, // Corrigido para acessar valorApostado
                retornos, // Corrigido para acessar retornos
                jogo,
                id,
              } = aposta;

              if (!jogo) {
                return (
                  <div key={id} className="Apostas-Card">
                    <p>Evento ID: {aposta.idJogo}</p>
                    <p>Mercado: {mercado}</p>
                    <p>Odd: {odd}</p>
                    <p>Dinheiro Apostado: {valorApostado}</p>
                    <p>Ganhos Potenciais: {retornos}</p>
                    <p>Detalhes do jogo não encontrados.</p>
                  </div>
                );
              }

              const mandante = jogo.participant1;
              const visitante = jogo.participant2;

              return (
                <div key={id} className="Apostas-Card">
                  <div className="Aposta-Info">
                    <div className="Data-Hora">
                      <p>Data: {jogo.date}</p>
                      <p>Hora: {jogo.time}</p></div>
                    <p>{mandante} vs {visitante}</p>
                  </div>
                  <div>
                  <p>São Paulo</p>
                  <p>Mercado: {mercado}</p>
                  </div>
                  <p>Odd: {odd}</p>
                  <p>Dinheiro Apostado: {valorApostado}</p>
                  <p>Ganhos Potenciais: {retornos}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}





class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      showDeposito: false, 
      showAposta: false, 
      showApostasCriadas: false, // Novo estado para controlar a tela de apostas criadas
      cupomSelecionado: null, // Armazena os dados do cupom selecionado
      apostas: [], // Lista de apostas criadas
      jogos: [] // Lista de jogos carregados
    };
  }

  depositar = () => {
    this.setState({ showDeposito: true });
  };

  fecharDeposito = () => {
    this.setState({ showDeposito: false });
  };

  exibirAposta = (cupom) => {
    this.setState({ 
      showAposta: true, 
      cupomSelecionado: cupom // Define os dados do cupom selecionado
    });
  };

  fecharAposta = () => {
    this.setState({ 
      showAposta: false, 
      cupomSelecionado: null 
    });
  };

  toggleAposta = () => {
    if (this.state.cupomSelecionado) {
      this.setState((prevState) => ({ showAposta: !prevState.showAposta }));
    }
  };

  // Novo método para alternar a exibição da tela de Apostas Criadas
  toggleApostasCriadas = () => {
    this.setState((prevState) => ({
      showApostasCriadas: !prevState.showApostasCriadas,
    }));
  };

  // Método para salvar uma nova aposta
  adicionarAposta = (aposta) => {
    this.setState((prevState) => ({
      apostas: [...prevState.apostas, aposta],
    }));
  };

  // Método para carregar jogos na inicialização
  carregarJogos = (jogos) => {
    this.setState({ jogos });
  };

  render() {
    const { showDeposito, showAposta, showApostasCriadas, cupomSelecionado, apostas, jogos } = this.state;

    return (
      <div className="container">
        <Header 
          depositar={this.depositar} 
          toggleApostasCriadas={this.toggleApostasCriadas} // Passa o método para o Header
        />
        {!showApostasCriadas ? (
          <>
            <Matches 
              exibirAposta={this.exibirAposta} 
              adicionarAposta={this.adicionarAposta}
              carregarJogos={this.carregarJogos}
            />
            <Deposito show={showDeposito} fecharDeposito={this.fecharDeposito} />
            <Aposta
              show={showAposta}
              toggleAposta={this.toggleAposta}
              cupomSelecionado={cupomSelecionado}
              removerAposta={this.fecharAposta}
            />
          </>
        ) : (
          <ApostasCriadas 
            voltar={this.toggleApostasCriadas} 
            jogos={jogos} // Passa os jogos carregados no estado do App
          />// Mostra a tela de apostas criadas
        )}
      </div>
    );
  }
}

export default App;