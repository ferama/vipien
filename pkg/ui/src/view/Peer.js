import React, { Fragment } from 'react';
import { http } from '../lib/Axios'
import { Card, PageHeader } from 'antd';

export class Peer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            peer: "",
        }
    }
    async componentDidMount() {
        await this.updateState()
    }

    updateState = async () => {
        const peer = this.props.match.params.name
        let data
        try {
            data = await http.get(`peers/${peer}`)
        } catch {
            return
        }
        if (data.data === null) return

        this.setState({
            peer: data.data.data
        })
    }

    render () {
        const title = `peer / ${this.props.match.params.name}`
        return (
            <Fragment>
                <PageHeader title={title} />
                <Card>
                    <pre>{this.state.peer}</pre>
                </Card>
            </Fragment>
        )
    }
} 