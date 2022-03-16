import React from 'react';
import {
    Switch,
    Route,
  } from "react-router-dom";
import { Home } from './view/Home';
import { Services } from './view/Services';

export const Routes = () => (
    <Switch>
        <Route path="/services/:namespace" component={Services} />
        <Route path="/" component={Home} />
    </Switch>
)