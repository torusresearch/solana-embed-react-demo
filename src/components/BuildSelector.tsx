import { TORUS_BUILD_ENV, TORUS_BUILD_ENV_TYPE } from "@toruslabs/solana-embed";
import { FC } from "react";

const BuildSelector: FC<{build: TORUS_BUILD_ENV_TYPE, setBuild: any}> = ({build, setBuild}) => {
    const handleBuildChange = (e: any) => {
        setBuild(e.target.value);
    }
    return (
        <div className='build-selector-container'>
            <span>Current Network: </span>
            <select value={build} onChange={handleBuildChange} className="build-selector">
                <option value={TORUS_BUILD_ENV.PRODUCTION}>{TORUS_BUILD_ENV.PRODUCTION}</option>
                <option value={TORUS_BUILD_ENV.TESTING}>{TORUS_BUILD_ENV.TESTING}</option>
                <option value={TORUS_BUILD_ENV.DEVELOPMENT}>{TORUS_BUILD_ENV.DEVELOPMENT}</option>
            </select>
        </div>
    )
}

export default BuildSelector;
