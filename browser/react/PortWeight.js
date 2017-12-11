import React, { Component } from 'react';
import Weight from './Weight';
import FixedAmount from './FixedAmount';

class PortWeight extends Component {
  constructor(props){
    super(props);

    this.state = {
      allocationChoice:[],
      fixedAmount:{}
    }

    this.handleSelect = this.handleSelect.bind(this);
    this.onFixedAmount = this.onFixedAmount.bind(this);
  }

  handleSelect(e){
    let allocationChoice = [];
    const methodChoice = e.target.value;
    const idx = e.target.id;
    allocationChoice =[...this.state.allocationChoice.slice(0, idx), methodChoice, ...this.state.allocationChoice.slice(idx+1)];

    this.setState( { allocationChoice });
  }

  onFixedAmount(e){
    const fixedAmount = e.target.value;
    this.setState( { fixedAmount })
  }

  render(){
    const { bonds, allocationPercents } = this.props;
    const choice = this.state.allocationChoice;

    return(
    <div className="panel panel-default">
        <div>&nbsp;</div>
        <table>
          <thead>
            <tr>
              <th className="company">Industry Exposure</th>
              <th className="alloc">Min Weight</th>
              <th className="alloc">Max Weight</th>
            </tr>

          </thead>

          <tbody>
            { bonds.length ?
              bonds.map((bond, index) => (
              <tr key={index} >
                <td className="item">
                  { bond.industry }
				</td>
              				
				<td id={index} className="item">
					<Weight />
				</td>
				<td id={index} className="item">
					<Weight/>
				</td>
              </tr>
                  ))
                : null }

          </tbody>
          { bonds.length ? (
            <tfoot>
              <tr>
                <td id="tdTotal" colSpan="3"><span className="pull-left"></span></td>

              </tr>
            </tfoot>
                )
                  : null }

        </table>
      </div>

    )
  }

}

export default PortWeight;
