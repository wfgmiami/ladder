import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Nav from './Nav';
import BondList from './BondList';
import Maturity from './Maturity';
import initialState from './initialState';
import PortWeight from './PortWeight';
import Priority from './Priority';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
	this.selectAllocationPercent = this.selectAllocationPercent.bind(this);
  }



  componentDidMount() {
    axios.get('/api/transactions')
      .then(response => response.data)
      .then(transactions => this.setState({ transactions }))
      .catch(err => console.log(err));
  }

  selectAllocationPercent(ev) {
    const selectedAllocation = ev.target.value;
    this.setState({ selectedAllocation });
  }

  render() {
    // console.log('.....in App.js, state, props',this.state, this.props)
    const transactions = [...this.state.transactions];
    return (
      <div className="container-fluid">
        <Nav />
        <div style={{ marginTop: '65px' }}>
          <div className="row">

            <div className="col-sm-5">
            	<BondList bonds={this.state.bonds}/>
            </div>
			
			<div className="col-sm-2">
				<Maturity />
			</div>

			

            <div className="col-sm-3">
              <PortWeight bonds={this.state.bonds} allocationPercents={this.state.allocationPercents} />
            </div>

          </div>
        </div>
      </div>
    );
  }
}


export default App;
