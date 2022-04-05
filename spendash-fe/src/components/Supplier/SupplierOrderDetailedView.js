import React, { Component } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';

import Authentication from '../../authentication/Authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faReceipt, faEye } from '@fortawesome/free-solid-svg-icons';
import AddReceiptDataService from "./AddReceiptDataService";
import AddOrderDataService from "../Order/AddOrderDataService";

class SupplierOrderDetailedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order: {
                id: this.props.match.params.id,
                comment: '',
                cost: '',
                // expect_date: new Date(),
                items: [],
                status: '',
                site_id: -1,
                lastModifiedBy: ''
            },
            loading: false
        };
        this.getOrderDetails = this.getOrderDetails.bind(this);
        this.checkForReceipt = this.checkForReceipt.bind(this);
        // this.submitBtnClicked = this.submitBtnClicked.bind(this);
        // this.deleteBtnClicked = this.deleteBtnClicked.bind(this);
    }

    componentDidMount() {
        this.getOrderDetails();
    }

    async checkForReceipt() {
        const {id} = this.state
        console.log(id)
        const response = await AddOrderDataService.checkForReceipt(id)
        this.setState({receiptStatus: response.data})
    }

    getOrderDetails() {
        const { order } = this.state;

        if (order.id != null) {
            AddReceiptDataService.getOrderDetailsByID(order.id).then((res) => {
                order['comment'] = res.data.comment;
                order['cost'] = res.data.cost;
                order['expect_date'] = res.data.expectedDate;
                order['items'] = res.data.items;
                order['status'] = res.data.status;
                order['site_id'] = res.data.site.id;
                order['supplier'] = res.data.supplier.name;
                order['lastModifiedBy'] = res.data.lastModifiedBy.name;

                this.setState({
                    order
                });
            });
        }
    }
    formChange = (event) => {
        this.setState(
            {
                [event.target.name]: event.target.value,
                error: null
            },
            () => console.log('form changed')
        );
    };

    getTotalCost = () => {
        let total = 0;
        this.state.order.items.map((item) => (total += item.qty * item.price));
        return total;
    };

    render() {
        const {
            id,
            lastModifiedBy,
            site_id,
            status,
            supplier,
            comment,
            expect_date,
            items
        } = this.state.order;
        return (
            <Container
                style={{
                    marginTop: '50px',
                    marginBottom: '50px'
                }}
            >
                <div
                    style={{
                        border: '1px solid black',
                        padding: 40
                    }}
                >
                    <Row>
                        <Col md={10}>
                            <h1>{id}</h1>
                        </Col>
                        <Col>
                            {status &&
                            <Button variant="secondary"
                                    className="my-1 mr-sm-2"
                                    onClick={()=>this.props.history.push(`/receiptList/${id}`)}>
                                <FontAwesomeIcon size="sm" icon={faEye} />
                                &nbsp; View Receipts
                            </Button>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col md={10}></Col>
                        <Col>
                            <Button className="my-1 mr-sm-2" variant="info"
                                    onClick={() => this.props.history.push(`/receipt/${id}`)}>
                                <FontAwesomeIcon size="sm" icon={faReceipt} />
                                &nbsp; Create Receipt
                            </Button>
                        </Col>
                    </Row>
                    <p>Lastly Modified By:{lastModifiedBy}</p>

                    <p style={{ marginBottom: '0px' }}>
                        <b>Site ID :</b>
                        {site_id}
                    </p>
                    <p style={{ marginBottom: '0px' }}>
                        <b>Status :</b>
                        {status}
                    </p>
                    <p style={{ marginBottom: '0px' }}>
                        <b>type :</b> Requistion
                    </p>
                    <p>
                        <b>Supplier:</b> {supplier}
                    </p>
                    <p>Comment:{comment}</p>
                    <p>Expected Delivery Date : {expect_date}</p>

                    <p>
                        <b>Ordered Items</b>
                    </p>
                    <Table striped bordered hover size="sm" style={{ width: '80%' }}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td>{item.price}</td>
                            </tr>
                        ))}

                        <tr style={{ backgroundColor: 'grey', color: 'white' }}>
                            <td colSpan="3"></td>
                            <td>
                                <b>Total Cost : {this.getTotalCost()} </b>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </div>
                {Authentication.loggedAsSupplier && (
                    <div style={{ marginLeft: '10px', marginTop: '40px' }}>
                        <hr />
                        <p>
                            <b>Comment On Order</b>
                        </p>
                        <Form autoComplete="off">
                            <Row>
                                <Col md={2}>
                                    <Form.Control
                                        as="select"
                                        className="my-1 mr-sm-2"
                                        custom
                                        onChange={this.formChange}
                                        name="status"
                                        // value={this.state.status}
                                        required
                                    >
                                        <option value="">Choose...</option>
                                        <option value="approved">Approve</option>
                                        <option value="rejected">Reject</option>
                                    </Form.Control>
                                    {/* <p style={{ margin: '5px 0px' }}>
                    {this.state.status === 'pending' && (
                      <Badge variant="warning">{this.state.status}</Badge>
                    )}
                    {this.state.status === 'approved' && (
                      <Badge variant="success">{this.state.status}</Badge>
                    )}
                    {this.state.status === 'rejected' && (
                      <Badge variant="danger">{this.state.status}</Badge>
                    )}
                  </p> */}
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Control
                                            className="my-1 mr-sm-2"
                                            onChange={this.formChange}
                                            name="comment"
                                            // value={this.state.comment}
                                            placeholder="your comment"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Button className="my-1 mr-sm-2" variant="outline-dark">
                                        <FontAwesomeIcon size="sm" icon={faEdit} />
                                        &nbsp; Submit
                                    </Button>
                                    <Button className="my-1 mr-sm-2" variant="outline-danger">
                                        <FontAwesomeIcon size="sm" icon={faTrash} />
                                        &nbsp; Delete
                                    </Button>

                                </Col>
                            </Row>
                        </Form>
                    </div>
                )}
            </Container>
        );
    }
}

export default SupplierOrderDetailedView;
