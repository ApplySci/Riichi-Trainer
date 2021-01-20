import React, { Component } from 'react';

export default class PopUp extends Component {  
    render() {
      return (
        <div className="azps-modal" onClick={this.props.toggle}>
          <div className="azps-modal-content azps-bigtext">
            <h1>Happy New Year</h1>
            <p>This is the Chinese Year of the Ox</p>
            <div className='azps-superbigtext'>牛</div>
            <p>We are currently in the Metal cycle.</p>
          </div>
        </div>
      );
    }
  }