import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
    Container,
    Col,
    Row,
    FormControl,
    InputGroup,
    Table,
    Badge,
    Button
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCut, faEraser } from '@fortawesome/free-solid-svg-icons';
import Authentication from "../../authentication/Authentication";
import AddReceiptDataService from "./AddReceiptDataService";

class ReceivedOrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id:Authentication.loggedUserName(),
            orders: [],
            status:'approved'
        };
        this.getOrderBySupplier = this.getOrderBySupplier.bind(this);
    }
    componentDidMount() {
        this.getOrderBySupplier();
    }

    handleClick = (id) => {
        return this.props.history.push(`/createReceipt/${id}`);
    };

    onhandleClick = (id) => {
        return this.props.history.push(`/supplierOrderView/${id}`);
    };

    getOrderBySupplier = async () => {
        const { status,id} = this.state
        let response = await AddReceiptDataService.getOrdersBySupplier(status,id)
        this.setState({orders: response.data});
        console.log(this.state.orders);
    }

    render() {
        const { orders } = this.state;
        const searchBox = {
            width: '250px',
            fontWeight: 'bold',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            borderColor: '#000'
        };

        const customBadge = (text) => {
            let color = text === 'Pending' ? '#F9423D' : '#3DF970';
            return (
                <span style={{ backgroundColor: color, borderRadius: 4 }}>{text}</span>
            );
        };

        return (
            <React.Fragment>
                <Container style={{ marginTop: 25 }}>
                    {/*<Button
                        variant="secondary"
                        style={{ marginBottom: 35 }}
                        onClick={this.handleClick}
                    >
                        + Create New Order
                    </Button>*/}
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
                            <th>Site</th>
                            <th>Cost</th>
                            <th>Expected Date</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr>
                                <td>{order.id}</td>
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
                                    {/*<Button
                                        variant="outline-success"
                                        style={{marginLeft:6}}
                                        onClick={() => this.handleClick(order.id)}
                                    >
                                        Create Receipt
                                    </Button>*/}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Container>
            </React.Fragment>
        );
    }
}
export default withRouter(ReceivedOrderList);
// - id: int
// - date: Date
// - item: List<Item>
// - expectedDate: Date
// - status: String
// - cost: double
// - comment: String
// - type: String
// - lastModifiedBy: String
// - supplier: String
// - siteId: int
