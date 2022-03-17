import React from 'react';
import {
    Switch,
    Route,
  } from "react-router-dom";
import { Home } from './view/Home';
import { Peer } from './view/Peer';
import { PeersList } from './view/PeersList';
import { Services } from './view/Services';

export const Routes = () => (
    <Switch>
        <Route path="/namespaces/:namespace/services" component={Services} />
        <Route path="/namespaces" component={Home} />

        <Route path="/peers/:name" component={Peer} />
        <Route path="/peers" component={PeersList} />
        
        <Route path="/" component={Home} />
    </Switch>
)