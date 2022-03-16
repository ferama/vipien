import React, { Fragment } from 'react';
import { http } from '../lib/Axios'
import { PageHeader, Table } from 'antd';
import {
    withRouter,
    Link
  } from "react-router-dom";

export class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "ns": [],
        }
        this.intervalHandler = null
    }
    async componentDidMount() {
        await this.updateState()
        this.intervalHandler = setInterval(this.updateState, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.intervalHandler)
    }

    updateState = async () => {
        let data
        try {
            data = await http.get("k8s/ns")
        } catch {
            return
        }
        if (data.data === null) return

        const ns = []
        let i = 0
        for (let n of data.data.namespaces) {
            n["key"] = ++i
            ns.push(n)
        }

        this.setState({
            "ns": ns
        })
    }

    render () {
        const columns = [
            {
                title: 'Namespaces',
                dataIndex: 'name',
                key: '1',
                render: item => {
                    const path = `/services/${item}`
                    return (<Link to={path}>{item}</Link>)
                }
            }
        ]
        return (
            <Fragment>
                <PageHeader
                    title="Home"
                />
                <Table 
                    onRow={(record, rowIndex) => {
                        return {
                          onClick: event => {
                            //   console.log(event)
                              console.log(record)
                          }
                        }
                    }}
                    columns={columns} 
                    dataSource={this.state.ns} />
            </Fragment>
        )
    }
} 