import React from "react";
import { Form, Input, Button } from 'antd';


export class CreateForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
                layout="horizontal"
                onFinish={this.props.onFinish}
                // onFinishFailed={this.onFinishFailed}
                >
                <Form.Item
                    label="PeerName"
                    name="name"
                    rules={[{ required: true, message: 'Please input the peer name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}