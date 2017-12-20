import React from 'react';
import { Link } from 'react-router-dom';
import Maturity from './Maturity';

class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
	  return (
  <div>
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
	
  		  <div className="row">
			<div className="col-sm-8">
				<div className="navbar-header">
					<div className="navbar-brand">Portoflio Allocation</div>
	     		</div>
			</div>
			<div className="col-sm-4">
				&nbsp;
					
			</div>

		 </div>

	
      </div>
    </nav>
  </div>
    );
  }
}


export default Nav;
