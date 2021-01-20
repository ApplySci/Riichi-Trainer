import React from 'react';
import { withTranslation } from "react-i18next";
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';
import Tibet from "./Tibet";
import PopUp from "../components/PopUp";

class TibetMenu extends React.Component {
    state = {
        seen: false
        };

    togglePop = () => {
        this.setState({
            seen: !this.state.seen
        });
    };

    render() {
        return (
            <BrowserRouter>
                <nav>
                    <button className="metal radial" onClick={this.togglePop}>牛</button>
                    <ul>
                        <li><NavLink to='/tibet/5/1/0/0/0'>5 tiles, 1 suit</NavLink></li>
                        <li><NavLink to='/tibet/8/1/0/0/0'>8 tiles, 1 suit</NavLink></li>
                        <li><NavLink to='/tibet/8/1/1/0/0'>8 tiles, 2 suits</NavLink></li>
                        <li><NavLink to='/tibet/11/1/1/0/0'>11 tiles, 2 suits</NavLink></li>
                        <li><NavLink to='/tibet/11/1/1/1/0'>11 tiles, 3 suits</NavLink></li>
                        <li><NavLink to='/tibet/14/1/1/1/0'>14 tiles, 3 suits</NavLink></li>
                        <li><NavLink to='/tibet/14/1/1/1/1'>14 tiles, 3 suits &amp; Honours</NavLink></li>
                    </ul>
                </nav>
                <Switch>
                    <Route path="/tibet/:hs/:p/:s/:m/:h" component={Tibet} />
                </Switch>
                {this.state.seen ? <PopUp toggle={this.togglePop} /> : null}
            </BrowserRouter>
        );
    }
}

export default withTranslation()(TibetMenu);
