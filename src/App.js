import TaiwanMap from './container/TaiwanMap'
import { Card } from 'antd'
import './App.css';

const CardStyle = {
  width: 300,
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 999
}

function App() {
  return (
    <div className="App">
      <Card style={CardStyle}>
        <p>Big Number, Select Count, Percentage</p>
      </Card>
      <TaiwanMap/>
    </div>
  );
}

export default App;
