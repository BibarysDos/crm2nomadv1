import React from 'react';

export const InputField = ({
    label,
    value,
    onChange,
    onBlur,
    isActive,
    onActivate,
    placeholder = ''
}) => {
    const hasValue = !!value;
    const isPressed = isActive || hasValue;

    if (isPressed) {
        return (
            <div
                data-layer="InputContainerWithoutButton"
                data-state="pressed"
                className="Inputcontainerwithoutbutton"
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
                    display: 'inline-flex'
                }}
            >
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
                        data-layer="LabelDefault"
                        className="Labeldefault"
                        style={{
                            alignSelf: 'stretch',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#6B6D80',
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                        }}
                    >
                        {label}
                    </div>
                    <div
                        data-layer="%Input text"
                        className="InputText"
                        style={{
                            alignSelf: 'stretch',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <input
                            type="text"
                            value={value || ''}
                            onChange={onChange}
                            onBlur={onBlur}
                            autoFocus={isActive}
                            placeholder={placeholder}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 16,
                                fontFamily: 'Inter',
                                fontWeight: '500',
                                color: '#071222',
                                paddingLeft: 0,
                                marginLeft: 0
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div
                data-layer="InputContainerWithoutButton"
                data-state="not_pressed"
                className="Inputcontainerwithoutbutton"
                onClick={onActivate}
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
                        data-layer="Label"
                        className="Label"
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
            </div>
        );
    }
};
