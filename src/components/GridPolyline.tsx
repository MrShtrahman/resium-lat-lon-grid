import { Cartographic, Color } from 'cesium';
import { useCesium, Entity, PolylineGraphics } from 'resium';

interface GridPolylineProps {
    path: Cartographic[];
    color: Color;
}

const GridPolyline = ({ path, color }: GridPolylineProps) => {
    const { globe } = useCesium();

    if (!globe) return null;
    const positions = globe.ellipsoid.cartographicArrayToCartesianArray(path);

    return <Entity>
        <PolylineGraphics {...{ positions }} width={1} material={color}/>
    </Entity>

}

export default GridPolyline;