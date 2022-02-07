import { useState } from 'react';
import { Viewer } from 'resium';
import './App.css';
import GridContainer from './components/GridContainer';

const App = () => {
  const [renderGrid, setRenderGrid] = useState(false);

  const toggleGridRender = () => setRenderGrid(!renderGrid);
  
  return (<Viewer>
    <button className='button' onClick={toggleGridRender}>toggle grid</button>
    {renderGrid && <GridContainer />}
  </Viewer>)
};

export default App;
