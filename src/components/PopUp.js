import React, { Component } from 'react';
import { Container } from 'reactstrap';

export default class PopUp extends Component {
    render() {
      return (
        <div className="azps-modal" onClick={this.props.toggle}>
          <Container className="azps-modal-content azps-bigtext">
            <h1>Happy New Year</h1>
            <p>Friday, 12 February 2021 marks the start of the Year of the Ox</p>
            <p className='azps-superbigtext'>牛</p>
            <p>We are currently in the Metal cycle.</p>
          </Container>
        </div>
      );
    }
  }