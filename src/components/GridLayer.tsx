import { useExtentView, drawGrid } from './gridUtils';
import GridPolyline from './GridPolyline';
import GridLabel from './GridLabel';

const GridLayer = () => {
    const extent = useExtentView();

    const { latsLines, lonsLines } = drawGrid(extent);

    return <>
        {latsLines.map(({ color, lat, lon, path, text }) => <>
            <GridPolyline {...{ color, path }} />
            <GridLabel {...{ lat, lon, text, isLat: true }} />
        </>)}
        {lonsLines.map(({ color, lat, lon, path, text }) => <>
            <GridPolyline {...{ color, path }} />
            <GridLabel {...{ lat, lon, text, isLat: false }} />
        </>)}
    </>
}

export default GridLayer;