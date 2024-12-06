import React from 'react';

const DerivativeSpinner: React.FC = () => {
    return (
        <div className="loader">
            <div className="svg-wrapper">
                <img src="/Derivative.svg" alt="Loading..." height="80" width="80" />
                <div className="loading-text">Creating TouchDesigner project...</div>
            </div>
        </div>
    );
};

export default DerivativeSpinner;
