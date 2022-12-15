import { Cartesian2, Cartesian3, Cartographic, Color, HorizontalOrigin, LabelStyle, NearFarScalar, VerticalOrigin } from "cesium";
import { useScreenCenterPosition } from './gridUtils';
import { useCesium, Entity, LabelGraphics } from 'resium';

interface GridLabelProps {
    lat: number;
    lon: number;
    text: string;
    isLat: boolean;
}

const adjustLabelText = (input: string): string => {
    switch(input) {
        case '0°N':
            return 'Equator';
        case '0°E':
            return 'Prime Meridian';
        case '180°E':
            return 'Antimeridian';
        default:
            return input;
    }
}

const GridLabel = ({ lat, lon, text, isLat }: GridLabelProps) => {
    const { globe } = useCesium();
    const center = useScreenCenterPosition();

    if (!globe) return null;

    const carto = new Cartographic(lon, lat);
    if (isLat) carto.longitude = center.longitude;
    else carto.latitude = center.latitude;
    const position = globe.ellipsoid.cartographicToCartesian(carto);
    const labelText = adjustLabelText(text);

    return <Entity {...{ position }}>
        <LabelGraphics text={labelText} font='bold 1rem Arial' 
            fillColor={Color.WHITE} outlineColor={Color.BLACK} style={LabelStyle.FILL_AND_OUTLINE}
            outlineWidth={4} scaleByDistance={new NearFarScalar(1, 0.85, 8.0e6, .75)}
            pixelOffset={new Cartesian2(isLat ? 0 : 4, isLat ? -6 : 0)}
            eyeOffset={Cartesian3.ZERO} scale={1.0} 
            horizontalOrigin={isLat ? HorizontalOrigin.CENTER : HorizontalOrigin.LEFT}
            verticalOrigin={isLat ? VerticalOrigin.BOTTOM : VerticalOrigin.TOP}/>
    </Entity>
}

export default GridLabel;