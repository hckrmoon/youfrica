import express from 'express';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {RoutingContext, match} from 'react-router';
import createLocation from 'history/lib/createLocation';
import routes from 'routes';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import promiseMiddleware from 'lib/promiseMiddleware';
import {Provider} from 'react-redux';
import * as reducers from 'reducers';

const app = express();

app.use((req, res) => {
    const location = createLocation(req.url);
    const reducer = combineReducers(reducers);
    const store = applyMiddleware(promiseMiddleware)(createStore)(reducer);

    match({routes, location}, (err, redirectLocation, renderProps) => {
        if (err)
            return res.status(500).end('Internal Server Error LOL');

        if (!renderProps) return res.status(404).end('Not Found LOL');

        const InitialComponent = (
            <Provider store={store}>
                <RoutingContext {...renderProps} />
            </Provider>
        );

        const initialState = store.getState();
        const componentHTML = renderToString(InitialComponent);
        const HTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title> Youfrica TV </title>
                    <script type="application/javascript">
                        window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
                    </script>
                </head>
                <body>
                    <div id="react-view">${componentHTML}</div>
                    <script type="text/javascript" src="./bundle.js"></script>
                    <script type="text/javascript" src="./dist/bundle.js"></script>
                    <script type="text/javascript" src="./client/bundle.js"></script>
                </body>
            </html>
        `;

        res.end(HTML);
    });
});

export default app;