import React from 'react';
import { Link } from 'react-router-dom';
import Maturity from './Maturity';
import AmountSlider from './AmountSlider';

class Nav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      x: 10,
      y: 0
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(pos) {
    console.log('..........pose',pos)
    this.setState({
      x: pos.x,
      y: pos.y
    });
  };

  render() {
	  return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">

            <div className="row">

              <div className="col-sm-7">
                <div className="navbar-header">
                    Portoflio Allocation
                </div>
              </div>

              <div className="col-sm-5">
                &nbsp;
                <AmountSlider/>
              </div>

            </div>

         </div>
        </nav>
      </div>
    );
  }
}


export default Nav;
