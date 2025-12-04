import React from 'react';
import Svg, { Defs, ClipPath, Path, Rect, G, Use } from 'react-native-svg';

const TeamShield = ({
    colors = ['#CCCCCC', '#999999', '#CCCCCC', '#999999'], // Default gray
    width = 100,
    height = 120,
    borderColor = "#ffffffff"
}) => {

    // The mathematical path for a classic shield shape
    // Defined on a 200x240 grid for easy scaling
    const shieldPath = "M0,0 L200,0 L200,140 C200,200 100,240 100,240 C100,240 0,200 0,140 Z";

    return (
        <Svg width={width} height={height} viewBox="0 0 200 240">
            <Defs>
                <ClipPath id="shieldClip">
                    <Path d={shieldPath} />
                </ClipPath>
            </Defs>

            {/* Group containing the 4 stripes, clipped to shield shape */}
            <G clipPath="url(#shieldClip)">
                {/* Stripe 1 */}
                <Rect x="0" y="0" width="50" height="240" fill={colors[0]} />

                {/* Stripe 2 */}
                <Rect x="50" y="0" width="50" height="240" fill={colors[1]} />

                {/* Stripe 3 */}
                <Rect x="100" y="0" width="50" height="240" fill={colors[2]} />

                {/* Stripe 4 */}
                <Rect x="150" y="0" width="50" height="240" fill={colors[3]} />
            </G>

            {/* The Outline (Border) */}
            <Path
                d={shieldPath}
                fill="none"
                stroke={borderColor}
                strokeWidth="4"
            />
        </Svg>
    );
};

export default TeamShield;