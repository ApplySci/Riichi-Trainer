import React from 'react';
import { ListGroupItem, Collapse, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';

class HistoryMessage extends React.Component {
    /* PROPS
        data (HistoryData),
        verbose,
        concise,
        spoilers
    */
    constructor(props) {
        super(props);
        this.state = { collapsed: true };
    }

    componentDidMount() {
        this.setState({
            collapsed: false
        });
    }

    render() {
        let { t } = this.props;
        if (!this.props.data) return <ListGroupItem></ListGroupItem>;

        let message = this.props.data.getMessage(t, this.props.concise, this.props.verbose, this.props.spoilers);
        let messageRows = message.split("<br/>").map((message, index) => <Row key={index}>{message}</Row>)

        return (
            <Collapse isOpen={!this.state.collapsed}>
                <ListGroupItem className={this.props.data.getClassName()}>
                    {messageRows}
                </ListGroupItem>
            </Collapse>
        );
    }
}

export default withTranslation()(HistoryMessage);