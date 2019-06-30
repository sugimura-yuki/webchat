import React, { CSSProperties } from 'react';
import { eventNames } from 'cluster';
// import UUID from 'uuid';

enum MessageType {
    Self,
    Others
}
type Message = { type: MessageType, message: string };
interface State {
    opened: boolean
    myMessage: string
    messages: Message[]
};

export default class extends React.Component {
    socket: WebSocket
    state: State = {
        opened: false,
        myMessage: '',
        messages: [],
    }
    constructor(props: {}) {
        super(props);
        const socket = new WebSocket('ws://localhost:80808');
        socket.addEventListener("open", (e: Event) => {
            this.setState({ opened: true });
        });
        socket.addEventListener("close", (e: CloseEvent) => {
            this.setState({ opened: false });
        });
        socket.addEventListener("message", (e: MessageEvent) => {
            this.setState({
                messages: this.state.messages.concat({ type: MessageType.Others, message: e.data }),
            });
        });
        this.socket = socket;
    }
    render() {
        return (
            <div>
                <input type="text" value={this.state.myMessage} onChange={e => this.setState({ myMessage: e.target.value })} />
                <button onClick={e => this.send()} disabled={!this.state.opened}>Send</button>
                <hr />
                {this.state.messages.map((v, i) => {
                    let style: CSSProperties = {};
                    switch (v.type) {
                        case MessageType.Self:
                            style.textAlign = 'right';
                            break;
                        case MessageType.Others:
                            style.textAlign = 'left';
                            style.color = 'red';
                            break;
                    }
                    return (
                        <div style={style}>{v.message}</div>
                    )
                })}
            </div>
        );
    }
    send() {
        const message = this.state.myMessage;
        try {
            this.socket.send(message);
            this.setState({
                myMessage: '',
                messages: this.state.messages.concat({ type: MessageType.Self, message }),
            });
        } catch (e) {
            alert('failed to send message');
        }
    }
}