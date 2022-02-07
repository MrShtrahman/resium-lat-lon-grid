import { useExtentView, drawGrid } from './gridUtils';
import GridPolyline from './GridPolyline';
import GridLabel from './GridLabel';

const GridLayer = () => {
    const extent = useExtentView();

    const { latsLines, lonsLines } = drawGrid(extent);

    return <>
        {latsLines.map(({ color, lat, lon, path, text }) => <div key={text}>
            <GridPolyline {...{ color, path }} />
            <GridLabel {...{ lat, lon, text, isLat: true }} />
        </div>)}
        {lonsLines.map(({ color, lat, lon, path, text }) => <div key={text}>
            <GridPolyline {...{ color, path }} />
            <GridLabel {...{ lat, lon, text, isLat: false }} />
        </div>)}
    </>
}

export default GridLayer;