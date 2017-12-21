import React from 'react';
import { Link } from 'react-router-dom';
import Maturity from './Maturity';
import AmountSlider from './AmountSlider';
import MaturitySlider from './MaturitySlider';

class Nav extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
	  return (
    
        <nav className="navbar navbar-custom navbar-fixed-top">
            <div className="row">
			  <div className="col-sm-1">
				  <h5 style={{ marginLeft: '7px' }}><b><span style={{ fontSize: '18' }}>M</span>UNI <span style={{ fontSize: '18' }}>L</span>ADDER <span style={{ fontSize: '18' }}>A</span>LLOCATION</b></h5>
			  </div>
              <div className="col-sm-6">
                  <MaturitySlider filterMaturity = { this.props.filterMaturity }/>
              </div>

              <div className="col-sm-5">
                <AmountSlider generateLadder = { this.props.generateLadder }/>
              </div>

            </div>

        
        </nav>
    
    );
  }
}


export default Nav;
