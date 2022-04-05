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
import Authentication from "../../authentication/Authentication";
import AddOrderDataService from "../Order/AddOrderDataService";


class ViewAllSuppliers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: Authentication.loggedUserId(),
            suppliers: [],
        };
        this.getSuppliers = this.getSuppliers.bind(this);

    }

    componentDidMount() {
        this.getSuppliers();
    }

    async getSuppliers() {
        const response = await AddOrderDataService.getAllSuppliers()
        this.setState({suppliers:response.data})
    }

    render() {
        const { suppliers } = this.state;
        const searchBox = {
            width: '250px',
            fontWeight: 'bold',
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            borderColor: '#000'
        };

        return (
            <React.Fragment>
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
                        <th>Supplier Name</th>
                        <th>Address</th>
                        <th>Contact</th>
                    </tr>
                    </thead>
                    <tbody>
                    {suppliers && suppliers
                        .map((supplier, index) => (
                            <tr key={index}>
                                <td>{supplier.name}</td>
                                <td>{supplier.address}</td>
                                <td>{supplier.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </React.Fragment>
        );
    }
}
export default withRouter(ViewAllSuppliers);
