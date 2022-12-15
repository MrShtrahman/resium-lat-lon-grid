import { useCesium } from 'resium';
import { useCallback, useEffect, useState } from 'react';
import GridLayer from './GridLayer';

const GridContainer = () => {
    const [pH, setPH] = useState(0);
    const [pLat, setPLat] = useState(0);
    const [pLon, setPLon] = useState(0);
    const [pHeading, setPHeading] = useState(0);

    const { viewer, camera } = useCesium();

    const setCameraValues = useCallback(() => {
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
    }, [camera, pH, pHeading, pLat, pLon])

    useEffect(() => {
        if (viewer && camera) {
            const ro = new ResizeObserver(_ => setCameraValues());
            ro.observe(viewer.container);
            viewer.container.addEventListener('resize', setCameraValues);
            camera.changed.addEventListener(() => {
                setCameraValues();
            })

            return (() => {
                viewer.container.removeEventListener('resize', setCameraValues);
                camera.changed.removeEventListener(() => {
                    setCameraValues();
                });
                ro.unobserve(viewer.container);
            })
        }
    }, [camera, camera?.changed, setCameraValues, viewer, viewer?.container]);

    if (!viewer) return null;
    viewer.useBrowserRecommendedResolution = true;

    return <GridLayer />
}

export default GridContainer;
