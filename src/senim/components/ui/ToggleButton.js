import React from 'react';

export const ToggleButton = ({
    label,
    isPressed,
    onClick
}) => {
    return (
        <div
            data-layer="InputContainerToggleButton"
            data-state={isPressed ? "pressed" : "not_pressed"}
            className="Inputcontainertogglebutton"
            onClick={onClick}
            style={{
                alignSelf: 'stretch',
                height: 85,
                paddingLeft: 20,
                background: 'white',
                overflow: 'hidden',
                borderBottom: '1px #F8E8E8 solid',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
                display: 'inline-flex',
                cursor: 'pointer'
            }}
        >
            <div
                data-layer="Text container"
                className="TextContainer"
                style={{
                    flex: '1 1 0',
                    paddingTop: 20,
                    paddingBottom: 20,
                    overflow: 'hidden',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 10,
                    display: 'flex'
                }}
            >
                <div
                    data-layer="LabelDiv"
                    className="Labeldiv"
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'black',
                        fontSize: 16,
                        fontFamily: 'Inter',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                    }}
                >
                    {label}
                </div>
            </div>
            <div
                data-layer="Switch container"
                className="SwitchContainer"
                style={{
                    width: 85,
                    height: 85,
                    position: 'relative',
                    background: '#FBF9F9',
                    overflow: 'hidden'
                }}
            >
                <div
                    data-svg-wrapper
                    data-layer="tui-switches"
                    className="TuiSwitches"
                    style={{
                        left: 26,
                        top: 35,
                        position: 'absolute'
                    }}
                >
                    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="16" rx="8" fill={isPressed ? "black" : "#E0E0E0"} />
                        <circle cx={isPressed ? "24" : "8"} cy="8" r="6" fill="white" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
