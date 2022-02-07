import { useCesium } from 'resium';
import { useEffect, useState } from 'react';
import GridLayer from './GridLayer';

const GridContainer = () => {
    const [pH, setPH] = useState(0);
    const [pLat, setPLat] = useState(0);
    const [pLon, setPLon] = useState(0);
    const [pHeading, setPHeading] = useState(0);
    
    const { viewer, camera } = useCesium();

    const setCameraValues = () => {
        if (camera) {
            const { positionCartographic, heading } = camera;
            const h = positionCartographic.height;
            const lat = positionCartographic.latitude;
            const lon = positionCartographic.longitude;
            if (h !== pH || lat !== pLat || lon !== pLon || heading !== pHeading) {
                setPH(h);
                setPLat(lat);
                setPLon(lon);
                setPHeading(heading);
            }
        }
    }

    useEffect(() => {
        viewer?.clock.onTick.addEventListener(() => {
            setCameraValues();
        });

        return () => {
            viewer?.clock.onTick.removeEventListener(() => {
                setCameraValues();
            })
        }
    }, [setCameraValues])

    return <GridLayer />
}

export default GridContainer;
