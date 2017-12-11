import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Nav from './Nav';
import MuniList from './MuniList';
import Maturity from './Maturity';
import initialState from './initialState';
import PortWeight from './PortWeight';
import Priority from './Priority';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
		munis:[]
	};
  }



  componentDidMount() {
    axios.get('/api/munis')
      .then(response => response.data)
      .then( munis  => {
		console.log('.............munis', munis);
  	  	this.setState({ munis })
	  })
      .catch(err => console.log(err));
  }

   render() {
    // console.log('.....in App.js, state, props',this.state, this.props)
    const munis = [...this.state.munis];
    return (
      <div className="container-fluid">
        <Nav />
        <div style={{ marginTop: '65px' }}>
          <div className="row">

            <div className="col-sm-5">
            	<MuniList munis={ munis }/>
            </div>
			
			<div className="col-sm-2">
				<Maturity />
			</div>

            <div className="col-sm-3">
            	PORFOLIO WEIGHTS 
            </div>

          </div>
        </div>
      </div>
    );
  }
}


export default App;
