import React from 'react';
import { Link } from 'react-router-dom';
import Maturity from './Maturity';
import AmountSlider from './AmountSlider';
import MaturitySlider from './MaturitySlider';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: true
    }
    this.toggleNavbar = this.toggleNavbar.bind(this);
  }

  toggleNavbar(){

    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  render() {

    const collapsed = this.state.collapsed;
    const classOne = collapsed ? 'collapse navbar-collapse' : 'collapse navbar-collapse show';
    const classTwo = collapsed ? 'navbar-toggle navbar-toggle-right collapsed' : 'navbar-toggle navbar-togler-right';

	  return (

      <div>
        <nav className="navbar navbar-default navbar-custom navbar-fixed-top">
          <div className="container-fluid">
            <div className="row">

              <div className='col-sm-1'>
                <div className="navbar-header">
                    <button  onClick={ this.toggleNavbar } className={ `${classTwo}` } type="button" data-toggle="collapse" data-target="#navbarResponsive">
                      <span className="icon-bar" />
                      <span className="icon-bar" />
                      <span className="icon-bar" />
                    </button>
                    <h5 style={{ marginLeft: '7px' }}><b><span style={{ fontSize: '18' }}>M</span>UNI <span style={{ fontSize: '18' }}>L</span>ADDER <span style={{ fontSize: '18' }}>A</span>LLOCATION</b></h5>
                </div>
              </div>

              <div className={ `${ classOne }` } id="navbarResponsive">

                <div className="col-sm-6">
                    <MaturitySlider filterMaturity = { this.props.filterMaturity }/>
                </div>

                <div className="col-sm-5">
                  <AmountSlider generateLadder = { this.props.generateLadder }/>
                </div>
              </div>

            </div>
          </div>
        </nav>
      </div>

    );
  }
}


export default Nav;
