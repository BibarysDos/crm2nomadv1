import React from 'react';

export const DictionarySelect = ({
    label,
    value,
    onClick,
    showValue = true,
    hasError = false
}) => {
    const hasValue = !!value && showValue;
    const dataState = hasValue ? "pressed" : "not_pressed";

    return (
        <div
            data-layer="InputContainerDictionaryButton"
            data-state={dataState}
            className="Inputcontainerdictionarybutton"
            onClick={onClick}
            style={{
                alignSelf: 'stretch',
                height: 85,
                paddingLeft: 20,
                background: hasError ? '#fff5f5' : 'white',
                overflow: 'hidden',
                borderBottom: hasError ? '1px #d32f2f solid' : '1px #F8E8E8 solid',
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'inline-flex',
                cursor: 'pointer'
            }}
        >
            {hasValue ? (
                <div
                    data-layer="Text field container"
                    className="TextFieldContainer"
                    style={{
                        flex: '1 1 0',
                        height: 85,
                        paddingTop: 20,
                        paddingBottom: 20,
                        paddingRight: 16,
                        overflow: 'hidden',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: 10,
                        display: 'inline-flex'
                    }}
                >
                    <div
                        data-layer="Label"
                        className="Label"
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: hasError ? '#d32f2f' : '#6B6D80',
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                        }}
                    >
                        {label}
                    </div>
                    <div
                        data-layer="Input text"
                        className="InputText"
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#071222',
                            fontSize: 16,
                            fontFamily: 'Inter',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                        }}
                    >
                        {value}
                    </div>
                </div>
            ) : (
                <div
                    data-layer="Text container"
                    className="TextContainer"
                    style={{
                        flex: '1 1 0',
                        paddingTop: 20,
                        paddingBottom: 20,
                        paddingRight: 16,
                        overflow: 'hidden',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        display: 'flex'
                    }}
                >
                    <div
                        data-layer="Label"
                        className="Label"
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: hasError ? '#d32f2f' : 'black',
                            fontSize: 16,
                            fontFamily: 'Inter',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                        }}
                    >
                        {label}
                    </div>
                </div>
            )}
            <div
                data-layer="Open button"
                className="OpenButton"
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
                    data-layer="Chewron right"
                    className="ChewronRight"
                    style={{
                        left: 31,
                        top: 32,
                        position: 'absolute'
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
