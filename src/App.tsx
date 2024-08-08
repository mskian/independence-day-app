import { Router, Route } from 'preact-router';
import Greeting from './components/Greeting';
import GreetingPage from './components/GreetingPage';

const App = () => {
  return (
    <Router>
      <Route path="/" component={Greeting} />
      <Route path="/:name" component={GreetingPage} />
    </Router>
  );
};

export default App;
