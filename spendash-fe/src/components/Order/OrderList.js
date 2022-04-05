import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  FormControl,
  InputGroup,
  Table,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCut, faEraser } from '@fortawesome/free-solid-svg-icons';
import OrderDataService from './OrderDataService';
import Authentication from '../../authentication/Authentication';
import SiteDataService from '../Header-Footer/SiteDataService';
import SiteSelector from '../Header-Footer/SiteSelector';

class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      selectedSite: '',
      sites: []
    };
    this.refreshOrders = this.refreshOrders.bind(this);
  }

  componentDidMount() {
    this.refreshOrders();
  }

  handleChange = ({ target: input }) => {
    this.setState({
      [input.name]: input.value
    });
  };

  refreshOrders() {
    let formData = new FormData();
    formData.append('status', 'pending');

    if(Authentication.loggedAsSenior()){
      OrderDataService.getOrders("SArequired").then((response) => {
        this.setState({ orders: response.data });
      });
    }
    OrderDataService.getOrders(formData).then((response) => {
      this.setState({ orders: response.data });
    });
    console.log(this.state.orders);
  }
  handleNavCreate = () => {
    return this.props.history.push(`/createOrder`);
  };

  handleClick = (id) => {
    return this.props.history.push(`/orderDetailedView/${id}`);
  };

  onhandleClick2 = () => {
    return this.props.history.push('/creditNote');
  };

  onhandleClick = (id) => {
    return this.props.history.push(`/orderDetailedView/${id}`);
  };

  render() {
    const { orders, selectedSite } = this.state;
    const searchBox = {
      width: '250px',
      fontWeight: 'bold',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      borderColor: '#000'
    };

    const customBadge = (text) => {
      let color = text === 'pending' ? '#F9423D' : '#3DF970';
      return (
        <span style={{ backgroundColor: color, borderRadius: 4 }}>{text}</span>
      );
    };

    return (
      <React.Fragment>
            <SiteSelector
                handleChange={this.handleChange}
                selectedSite={selectedSite}
            />
              {Authentication.loggedAsSiteManager() &&
              <Button
                  variant="secondary"
                  style={{ marginBottom: 35 }}
                  onClick={this.handleNavCreate}
              >
                + Create New Order
              </Button>
              }

        <InputGroup size="sm" style={{ marginBottom: 40, width: '40%' }}>
          <FontAwesomeIcon
            style={{ marginTop: '8px', marginRight: 10 }}
            icon={faSearch}
          />
          <FormControl
            style={searchBox}
            autoComplete="off"
            placeholder="start typing..."
            name="search"
            value={this.state.search}
            className=""
          />
          &nbsp;
        </InputGroup>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Site</th>
              <th>Cost</th>
              <th>Expected Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders &&
              orders
                .filter(
                  (item) =>
                    selectedSite === item.site.name || selectedSite === ''
                )
                .map((order, id) => (
                  <tr key={id}>
                    <td>{order.id}</td>
                    <td>{order.supplier.name}</td>
                    <td>{order.site.name}</td>
                    <td>{order.cost}</td>
                    <td>{order.date}</td>
                    <td>{customBadge(order.status)}</td>
                    <td>
                          <Button
                            variant="secondary"
                            onClick={() => this.onhandleClick(order.id)}
                          >
                            View Order
                          </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}
export default withRouter(OrderList);
