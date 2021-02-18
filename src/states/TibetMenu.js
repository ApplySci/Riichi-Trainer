import React from 'react';
import { Container } from 'reactstrap';
import { withTranslation } from "react-i18next";
import { BrowserRouter, Link, NavLink, Route, Switch } from 'react-router-dom';
import Tibet from "./Tibet";
import PopUp from "../components/PopUp";
import Intro from "../components/Intro";
import SichuanClient from "./SichuanClient";

class TibetMenu extends React.Component {
    state = {
        showPopup: false
        };

    togglePop = () => {
        this.setState({
            showPopup: !this.state.showPopup
        });
    };

    render() {
        return (
            <BrowserRouter>
                {this.state.showPopup ? <PopUp toggle={this.togglePop} /> : null}
                <nav>
                    <Link to=''><button className="metal radial" onClick={this.togglePop}>牛</button></Link>
                    <ul>
                        <li><NavLink to='/tibet/5/1/0/0/0'>5 tiles, 1 suit</NavLink></li>
                        <li><NavLink to='/tibet/8/1/0/0/0'>8 tiles, 1 suit</NavLink></li>
                        <li><NavLink to='/tibet/8/1/1/0/0'>8 tiles, 2 suits</NavLink></li>
                        <li><NavLink to='/tibet/11/1/1/0/0'>11 tiles, 2 suits</NavLink></li>
                        <li><NavLink to='/tibet/11/1/1/1/0'>11 tiles, 3 suits</NavLink></li>
                        <li><NavLink to='/tibet/14/1/1/1/0'>14 tiles, 3 suits</NavLink></li>
                        <li><NavLink to='/tibet/14/1/1/1/1'>14 tiles, 3 suits &amp; Honours</NavLink></li>
                        {/*<li>---------------------</li>
                        <li>For advanced players only:</li>
                        <li><NavLink to='/tibet/11/1/0/0/0'>11 tiles, 1 suit</NavLink></li>
                        <li><NavLink to='/tibet/14/1/0/0/0'>14 tiles, 1 suit</NavLink></li>
                        <li></li>*/}
                    </ul>
                </nav>
                <Container>
                <Switch>
                    <Route path="/tibet/:hs/:p/:s/:m/:h" component={Tibet} />
                    <Route exact path="/" component={Intro} />
                    <Route exact path='/sbr' component={SichuanClient} />
                </Switch>
                </Container>
            </BrowserRouter>
        );
    }
}

export default withTranslation()(TibetMenu);
