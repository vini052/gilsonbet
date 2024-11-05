import React, { Component } from "react";
import './App.css'
import db from './db/db.json'
import teamsData from './db/teams.json'

const teamLogos = {
  1: "https://static.wixstatic.com/media/29c778_f3d6773ce1634fc7b1c7e58ce9755b7e~mv2.png/v1/fit/w_500,h_500,q_90/29c778_f3d6773ce1634fc7b1c7e58ce9755b7e~mv2.webp",
  2: "https://static.wixstatic.com/media/29c778_57234607199b4ad8911a5bd42865b13d~mv2.png/v1/fit/w_500,h_500,q_90/29c778_57234607199b4ad8911a5bd42865b13d~mv2.png"
};

class Header extends Component {
  render() {
    return (
      <div className="header">
        <img className="logo" src={require("./assets/GilsonBet.png")} alt="Gilson Bet Logo" />
        <ul className="Scroll-Sports">
          <li><a>Futebol</a></li>
          <li><a>Basquete</a></li>
          <li><a>Volei</a></li>
          <li><a>Tenis</a></li>
          <li><a>Handebol</a></li>
          <li><a>Baseball</a></li>
          <li><a>Tenis de Mesa</a></li>
          <li><a>Corrida de Cavalos</a></li>
          <li><a>E-games</a></li>
        </ul>
        <div className="deposito" onClick={this.props.depositar}><a>Depositar</a></div>
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
      jogos: db.jogos,
      equipes: teamsData.equipes
    };
  }

  getTeamInfo(codigo) {
    return this.state.equipes.find(team => team.codigo === codigo) || {};
  }

  render() {
    return (
      <div className="Matches">
        {this.state.jogos.map((jogo, index) => {
          const mandanteInfo = this.getTeamInfo(jogo.mandante);
          const visitanteInfo = this.getTeamInfo(jogo.visitante);

          return (
            <Game
              key={index}
              jogo={jogo}
              mandante={mandanteInfo}
              visitante={visitanteInfo}
              exibirAposta={this.props.exibirAposta}
            />
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
            <img width="16" height="16" src="https://img.icons8.com/ios-glyphs/30/969696/football2--v1.png" alt="football2--v1" />
            <h2>{campeonato}</h2>
          </div>
          <h2>{data} / {hora}</h2>
        </div>
        <div className="vs-icons">
          <div className="time">
            <h3>{mandante.nome || 'Time Mandante'}</h3>
            <img src={mandante.escudo} alt="escudo mandante" />
          </div>
          <span>1 - 0</span>
          <div className="time">
            <img src={visitante.escudo} alt="escudo visitante" />
            <h3>{visitante.nome || 'Time Visitante'}</h3>
          </div>
        </div>
        <div className="result"><span className="line-span"/><span className="resultado-partida">Resultado da Partida</span><span className="line-span"/></div>
        <div className="odds">
          <div className="odd" onClick={() => this.props.exibirAposta()}><div>1</div> {oddCasa}</div>
          <div className="odd" onClick={() => this.props.exibirAposta()}><div>X</div> {oddEmpate}</div>
          <div className="odd" onClick={() => this.props.exibirAposta()}><div>2</div> {oddFora}</div>
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
  render() {
    const { show, toggleAposta, cupomSelecionado } = this.props;

    return (
      <div className={`Aposta ${show ? "show" : ""}`}>
        <div className="header-aposta">
          {cupomSelecionado && (<img width="16" height="16" src="https://img.icons8.com/material-rounded/24/FFFFFF/trash.png" alt="trash" className="trash-icon"/>)}
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
        <div className="compartilha-aposta"><img width="16" height="16" src="https://img.icons8.com/ios-filled/50/1B3573/forward-arrow.png" alt="forward-arrow"/><a>Compartilhar</a></div>
        <div className="resultado-aposta"><div className="mercado-deposito"><div className="mercado-aposta"><b>Fortaleza</b><p>Resultado Final</p></div><div className="deposito-aposta"><div className="options"><b>2.28</b><img width="16" height="16" src="https://img.icons8.com/material-rounded/24/969696/trash.png" alt="trash" className="trash-icon"/></div><input placeholder="0.00" className="input" type="number"/></div></div><div className="jogo-aposta">Juventude - Fortaleza</div></div>
        <div className="confirmar-aposta">Aposte já</div>
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
      cupomSelecionado: false
    };
  }

  depositar = () => {
    this.setState({ showDeposito: true });
  };

  fecharDeposito = () => {
    this.setState({ showDeposito: false });
  };

  exibirAposta = () => {
    this.setState({ showAposta: true, cupomSelecionado: true });
  };

  fecharAposta = () => {
    this.setState({ showAposta: false, cupomSelecionado: false });
  };

  toggleAposta = () => {
    if (this.state.cupomSelecionado) {
      this.setState((prevState) => ({ showAposta: !prevState.showAposta }));
    }
  };

  selecionarCupom = () => {
    this.setState({ cupomSelecionado: true, showAposta: true });
  };

  render() {
    return (
      <div className="container">
        <Header depositar={this.depositar} />
        <Matches exibirAposta={this.exibirAposta}/>
        <Deposito show={this.state.showDeposito} fecharDeposito={this.fecharDeposito} />
        <Aposta
          show={this.state.showAposta}
          toggleAposta={this.toggleAposta}
          cupomSelecionado={this.state.cupomSelecionado}
        />
      </div>
    );
  }
}


export default App;