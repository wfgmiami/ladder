import React from 'react';

import axios from 'axios';


class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchedStock: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  inputChange(e) {
    this.setState({ searchedStock: e.target.value });
  }

  handleSubmit(ev) {
    this.props.searchActive(this.state.searchedStock);
    ev.preventDefault();
    this.setState({ searchedStock: '' });
  }

  render() {
    return (
      <div>
        <form className="navbar-form" >
          <div className="input-group">
            <input className="form-control" placeholder="Enter Company Name" type="text" value={this.state.searchedStock} onChange={this.inputChange} />
            <span className="input-group-btn">
              <button className="btn btn-default" type="submit" onClick={this.handleSubmit} >
                <span className="glyphicon glyphicon-search" />
              </button>
            </span>
          </div>
        </form>
      </div>
    );
  }
}


export default SearchBar;
