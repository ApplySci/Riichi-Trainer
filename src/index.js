import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './tibet.css';
import "react-toggle/style.css";
import * as serviceWorker from './serviceWorker';
import "./i18n";

import TibetMenu from './states/TibetMenu';

ReactDOM.render(<TibetMenu />, document.getElementById('root'));
serviceWorker.register();