import MainMap from './container/MainMap'
import BigNumber from './component/BigNumber'
import Dashboard from './component/MetrixChart'
import './App.css'

function App() {
  return (
    <div className="App">
      <BigNumber/>
      <MainMap/>
      <Dashboard/>
    </div>
  );
}

export default App;
