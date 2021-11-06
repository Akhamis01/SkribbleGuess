import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './components/Home/Home';
import DrawingPage from './components/DrawingRoom/DrawingPage/DrawingPage';

const App = () => {
    return (
        <Router>
            <Route path="/" exact component={Home} />
            <Route path="/DrawingRoom" component={DrawingPage} />
        </Router>
    );
};

export default App;