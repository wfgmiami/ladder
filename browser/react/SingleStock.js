import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class SingleStock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quote: {}
    };
  }

  componentDidMount() {
    const symbol = this.props.router.match.params.symbol;

    axios.get(`/api/quote/${symbol}`)
      .then(response => response.data)
      .then(quote => this.setState({ quote }))
      .catch(err => console.log(err));
  }

  componentDidUpdate() {
    const symbol = this.props.router.match.params.symbol;

    axios.get(`/api/quote/${symbol}`)
      .then(response => response.data)
      .then(quote => this.setState({ quote }))
      .catch(err => console.log(err));
  }

  render() {
    const quote = this.state.quote;
    // console.log('....in singleStock- quote',quote)
    return (
      <div>
        { Object.keys(quote).length > 0 && (quote.summaryDetail) ?
          <div className="panel panel-default">
            <div className="panel-heading">{ quote.price.shortName } ( { quote.price.symbol } )
          <span className="pull-right">${ quote.price.regularMarketPrice}
            <div>{ parseFloat(quote.price.regularMarketChange).toFixed(2) } {''}
              ({(`${parseFloat((quote.price.regularMarketChangePercent * 100).toFixed(2))}%`)})
            </div>
          </span>
              <div>&nbsp;</div>
            </div>

            <div className="panel-body">
              <div>Ask:{ quote.summaryDetail.ask } &nbsp; x &nbsp; { quote.summaryDetail.askSize }</div>
              <div>Bid: { quote.summaryDetail.bid } &nbsp; x &nbsp; { quote.summaryDetail.bidSize }</div>
              <span className="pull-right"><button className="btn btn-primary"><Link to="/">Back</Link></button></span>
            </div>
          </div>
          :
          <div className="panel panel-default">
            <div className="panel-heading">NO DATA AVAILABLE
            </div>
            <span className="pull-right"><button className="btn btn-primary"><Link to="/">Back</Link></button></span>
          </div>
 		}
      </div>
    );
  }
}


export default SingleStock;
