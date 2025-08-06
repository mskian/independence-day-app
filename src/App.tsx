import { Router, Route } from 'preact-router';
import Greeting from './components/Greeting';
import GreetingPage from './components/GreetingPage';
import TerminalGreeting from './components/TerminalGreeting';

const App = () => {
  return (
    <Router>
      <Route path="/" component={Greeting} />
      <Route path="/terminal" component={TerminalGreeting} />
      <Route path="/:name" component={GreetingPage} />
    </Router>
  );
};

export default App;
