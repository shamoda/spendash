import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Container,
  Button,
  Modal,
  Spinner,
  Col,
  Row,
  InputGroup,
  FormControl, Card
} from 'react-bootstrap';
import swal from 'sweetalert';
import Joi from 'joi-browser';

import InputField from '../../asset/commons/InputField';
import AddOrderDataService from './AddOrderDataService';
import { Link } from 'react-router-dom';
import CreateOrderStep2 from './CreateOrderStep2';
import OrderDataService from './OrderDataService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import ItemCard from '../Items/ItemCard';
import SelectedItems from '../Items/SelectedItems';
import Authentication from "../../authentication/Authentication";

class CreateOrder extends Component {
  constructor(props) {
    super(props);
    //controlled inputs, should not be null as well..[ERR-LOG 01]
    this.state = {
      order: {
        // id: this.props.match.params.id,
        selectedSite: '',
        expectedDate: '',
        type: '',
        selectedSupplier: '',
        deliveryAddress: '',
        items: [],
        status:'',
        cost:'',
        comment:'',
        lastlyModifiedBy: Authentication.loggedUserId(),

        sites: [],
        suppliers: [],

      },
      selectedItems: [],
      sites: [],
      suppliers: [],
      prevSupplier: '',
      loading: false,
      buttonError: '',
      errors: {},
      filteredSuppliers: [],
      items: []
    };

    this.createOrder = this.createOrder.bind(this);
    // this.getOrderById = this.getOrderById.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.validate = this.validate.bind(this);
    this.refreshItems = this.refreshItems.bind(this);
    this.addSelected = this.addSelected.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.getSuppliers = this.getSuppliers.bind(this);
    this.getSites = this.getSites.bind(this);
  }

  componentDidMount() {
    // this.getOrderById();
    this.refreshItems();
    this.getSuppliers();
    this.getSites();
  }

  refreshItems() {
    AddOrderDataService.getItems().then((response) => {
      this.setState({ items: response.data.map((item) => {return {...item,qty:1}}) });
    });
  }

  /*getSuppliers() {
    AddOrderDataService.getAllSuppliers()
        .then(response => {
          return response.json();
        })
        .then(data => {
          let SupplierFromAPI = data.map(supplier => {
            return {value: supplier, display: supplier}
          });
          this.setState({
            suppliers: [{value:'', display:'(Select Supplier)'}].concat(SupplierFromAPI)
          });
        }).catch(error => {
          console.log(error);
    })
  }*/

  getSites() {
    AddOrderDataService.getAllSites().then((response) => {
      this.setState({ sites: response.data }, () => {
        console.log('Sites', this.state.sites);
      });
    });
  }

  getSuppliers() {
    // let formdata = new FormData();
    // formdata.append('');
    AddOrderDataService.getAllSuppliers().then((response) => {
      this.setState({ suppliers: response.data }, () => {
        console.log('Suppliers', this.state.suppliers);
      });
    });
  }

  addSelected(item) {
    const { selectedItems } = this.state;
    let prevSelected = selectedItems;
    console.log(item);
    let exist = selectedItems.find((val) => val.id === item.id);
    if (!exist) {
      this.setState({ selectedItems: [...prevSelected, item] });
    } else {
      return;
    }
  }
  deleteSelected(id) {
    const { selectedItems } = this.state;

    let newSelected = selectedItems.filter((item) => {
      if (item.id !== id) {
        return item;
      }
    });

    this.setState({ selectedItems: newSelected });
  }

  handleChange = ({ target: input }) => {
    let order = { ...this.state.order };
    const errors = { ...this.state.errors };
    const errorMessage = this.validateField(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];
    order[input.name] = input.value;

    this.setState(
      {
        order,
        errors
      },
      () => console.log(this.state)
    );
  };

  handleSupplierChange = ({ target: input }) => {
    let order = { ...this.state.order };
    const errors = { ...this.state.errors };
    const errorMessage = this.validateField(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];
    order[input.name] = input.value;
    let prevSupplier = order.selectedSupplier;
    this.setState(
      {
        prevSupplier,
        order,
        errors
      },
      () => console.log(this.state)
    );
  };

  // Joi.ref('password')
  //Joi@13.4 Schema [Validation Library]
  Schema = {
    id: Joi,
    type: Joi.string().required().label('Type Should Be Selected'),
    selectedSite: Joi.string().required().label('Site Should Be Selected'),
    selectedSupplier: Joi.string()
      .required()
      .label('Supplier Should Be Selected'),
    expectedDate: Joi.string().required().label('Date Should Be Selected'),
    deliveryAddress: Joi.string().required().label('Delivery Address'),
    items: Joi,
    status:Joi,
    cost:Joi,
    comment: Joi,
    lastlyModifiedBy: Joi,

    sites: Joi,
    suppliers: Joi,
  };

  validate() {
    const abortEarly = { abortEarly: false }; //1st Error priority disabled
    const { error } = Joi.validate(this.state.order, this.Schema, abortEarly);
    if (!error) return null; //if no result error return null
    const errors = {};
    for (let item of error.details) {
      //traversing in Joi error
      errors[item.path[0]] = item.message; //target input is given priority or first object [0]
    }
    return errors;
  }

  validateField({ name, value }) {
    const miniOrder = { [name]: value }; //Computed operators used [ES6]
    const miniSchema = { [name]: this.Schema[name] }; //Extracted property from Schema
    const { error } = Joi.validate(miniOrder, miniSchema);
    return error ? error.details[0].message : null;
  }

  createOrder(event) {
    event.preventDefault();
    const { order } = this.state;

    this.setState({ loading: true });
    //Object was used, Code 400 err, [ERR-LOG-02]
    // It uses the same format a form would use if the encoding type were set to "multipart/form-data".
    let formData = new FormData();
    formData.append('site', order.selectedSite);
    formData.append('expectedDate', order.expectedDate);
    formData.append('type', order.type);
    formData.append('supplier', order.selectedSupplier);
    formData.append('deliveryAddress', order.deliveryAddress);
    formData.append('lastModifiedBy','SiteManager1');
    formData.append('status', 'pending');
    formData.append('cost',localStorage.getItem('cost'));
    formData.append('items',JSON.stringify(this.state.selectedItems));

    AddOrderDataService.createOrder(formData)
        .then((res) => {
          setTimeout(() => {
            this.setState({ loading: false });
            swal({
              title: 'Order Created successfully !!!',
              icon: 'success',
              button: 'Ok'
            }).then((result) => {
              return this.props.history.push(`/orderList`);
            });
          }, 1000);
        })
        .catch((err) => {
          this.setState({ loading: false });
          swal({
            title: 'Oops!!',
            text: 'Something went wrong,please try again later.',
            error: 'error',
            button: 'ok',
            icon: 'error'
          });
        });
  }

  updateOrder(event) {
    event.preventDefault();
    const { order } = this.state;

    this.setState({ loading: true });
    //Object was used, Code 400 err, [ERR-LOG-02]
    // It uses the same format a form would use if the encoding type were set to "multipart/form-data".
    let formData = new FormData();
    formData.append('selectedSite', order.selectedSite);
    formData.append('expectedDate', order.expectedDate);
    formData.append('type', order.type);
    formData.append('selectedSupplier', order.selectedSupplier);
    formData.append('deliveryAddress', order.deliveryAddress);
    formData.append('lastModifiedBy', order.lastModifiedBy);

    AddOrderDataService.updateOrder(order.id, formData)
      .then((res) => {
        setTimeout(() => {
          this.setState({ loading: false });
          swal({
            title: 'Order updated successfully !!!',
            icon: 'success',
            button: 'Ok'
          }).then((result) => {
            return this.props.history.push(`/step2`);
          });
        }, 1000);
      })
      .catch((err) => {
        this.setState({ loading: false });
        swal({
          title: 'Oops!!',
          text: 'Something went wrong,please try again later.',
          error: 'error',
          button: 'ok',
          icon: 'error'
        });
      });
  }

  onAdd = (item) => {

    const {selectedItems}= this.state
    const exist = selectedItems.find(x => x.id === item.id)
    if (exist) {
      this.setState({selectedItems: selectedItems.map(x => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x)})
    } else {
      this.setState({selectedItems : [...selectedItems,{item,qty:1}]})
    }
  }

 onRemove = (item) => {

   const {selectedItems}= this.state
    const exist = selectedItems.find(x => x.id === item.id)
    if (exist.qty === 1) {
      const newCart = selectedItems.filter((x) => x.id !== item.id)
      this.setState({selectedItems: newCart})

    } else {
      this.setState({selectedItems: selectedItems.map(x => x.id === item.id ? { ...exist, qty: exist.qty - 1 } : x)})
    }
  }

  getTotalCost = () => {
    localStorage.removeItem('cost')
    let total = 0;
    this.state.selectedItems.map((item) => (total += item.qty * item.price));
    localStorage.setItem('cost',total)
    return total;
  };

  displayError = (msg) => {
    this.setState({
      buttonError: msg
    });
  };

  render() {
    const { errors, order, items, buttonError } = this.state; //properties
    const {
      selectedSite,
      expectedDate,
      type,
      selectedSupplier,
      deliveryAddress
    } = order;
    console.log(selectedSupplier, 'ii');

    let newItems =
      items &&
      items.filter((item) => {
        return this.state.order.selectedSupplier === item.supplier.userName;
      });

    const searchBox = {
      width: '250px',
      fontWeight: 'bold',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      borderColor: '#000',
      margin: '10px'
    };

    const { createOrder } = this; //methods
    return (
      <div>
        <Container
          style={{
            marginTop: '30px',
            marginBottom: '30px',
            border: '1px solid black'
          }}
        >
          <Form autoComplete="off" onSubmit={createOrder}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '25px',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              ADD NEW ORDER
            </div>
            <Row
              style={{ marginTop: '20px' }}
              className="justify-content-md-center"
            >
              <Col>
                <Form.Label>Select Site</Form.Label>
                <Form.Control
                  onChange={this.handleChange}
                  name="selectedSite"
                  value={selectedSite}
                  type="text"
                  as="select"
                  className="paperregistration-form-input"
                >
                  <option value="">- Select -</option>
                  {this.state.sites &&
                    this.state.sites.map((site) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  {/*{this.state.sites && this.state.sites.map(site => (
                      <option value={site.value} key={site.value}>
                        {site.display}
                      </option>
                  ))}*/}

                  {/*<option value="">- Select -</option>
                  <option value="Site1">Site1</option>
                  <option value="Site2">Site2</option>
                  <option value="Site3">Site3</option>
                  <option value="Site4">Site4</option>*/}
                </Form.Control>
                <Form.Text className="text-muted"> Available Sites </Form.Text>
              </Col>
              <Col>
                <Form.Label>Select Supplier</Form.Label>
                <Form.Control
                  onChange={this.handleChange}
                  name="selectedSupplier"
                  value={selectedSupplier}
                  type="text"
                  as="select"
                  className="paperregistration-form-input"
                >
                  <option value="">- Select -</option>
                  {this.state.suppliers &&
                    this.state.suppliers.map((supplier) => (
                      <option key={supplier.id}>{supplier.userName}</option>
                    ))}
                </Form.Control>
                <Form.Text className="text-muted">
                  Available Suppliers
                </Form.Text>
              </Col>
            </Row>
            <Row
              style={{ marginTop: '10px' }}
              className="justify-content-md-center"
            >
              <Col>
                <Form.Label>Type</Form.Label>
                <Form.Control
                  onChange={this.handleChange}
                  name="type"
                  value={type}
                  type="text"
                  as="select"
                  className="paperregistration-form-input"
                >
                  <option value="">- Select -</option>
                  <option value="Requisition">Requisition</option>
                  <option value="Order">Order</option>
                </Form.Control>
                <Form.Text className="text-muted"> Select Type </Form.Text>
              </Col>
              <Col>
                <InputField
                  FormLabel="Expected Date"
                  name="expectedDate"
                  value={expectedDate}
                  handleChange={this.handleChange}
                  FormText="Expected date of order"
                  type="date"
                  placeholder="Expected date of order"
                  trap={false}
                  error={errors.expectedDate}
                />
              </Col>
            </Row>
            <Row
              style={{ marginTop: '10px' }}
              className="justify-content-md-center"
            >
              <Col>
                <InputField
                  FormLabel="Delivery Address"
                  name="deliveryAddress"
                  value={deliveryAddress}
                  handleChange={this.handleChange}
                  FormText="Order Delivery Address Here"
                  type="text"
                  placeholder="Delivery Address"
                  trap={false}
                  error={errors.deliveryAddress}
                />
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col>
                <div style={{marginTop: 30}}>
                  <Card>
                    <Card.Header >
                      <h6>Available Items</h6>
                    </Card.Header>
                    <div
                        style={{
                          marginBottom: '20px',
                          textAlign: 'center',
                          padding: 12
                        }}
                    >
                      <InputGroup size="sm" style={{ marginBottom: 10 }}>
                        <FontAwesomeIcon
                            style={{ margin: '20px' }}
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
                      {newItems &&
                      newItems.map((item) => (
                          <ItemCard item={item} addSelected={this.addSelected} />
                      ))}
                    </div>
                  </Card>
                </div>
              </Col>
              <Col>
                <div
                  style={{
                    marginTop: '30px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    height: '300px'
                  }}
                >
                  <SelectedItems
                    selectedItems={this.state.selectedItems}
                    deleteSelected={this.deleteSelected}
                    onAdd={this.onAdd}
                    onRemove={this.onRemove}
                    totalCost={()=>this.getTotalCost()}
                  />
                </div>
              </Col>
            </Row>

            <Button
              variant="secondary"
              style={{ marginBottom: 8 }}
              onClick={this.createOrder}
            >
              Submit
            </Button>

            {buttonError && (
              <p className="paperregistration-error">{buttonError}</p>
            )}
          </Form>
        </Container>
        {/* Modal or Loading */}
        <Modal
          centered
          size="sm"
          show={this.state.loading}
          onHide={() => console.log('please wait...')}
        >
          <Modal.Header>
            <Modal.Title>
              <Spinner animation="border" /> Please wait...
            </Modal.Title>
          </Modal.Header>
        </Modal>
      </div>
    );
  }
}
export default withRouter(CreateOrder);
