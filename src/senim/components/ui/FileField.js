import React from 'react';

export const FileField = ({
    label,
    value,
    onClick
}) => {
    const hasValue = !!value;
    const dataState = hasValue ? "pressed" : "not_pressed";

    return (
        <div
            data-layer="InputContainerAttachButton"
            data-state={dataState}
            className="Inputcontainerattachbutton"
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
                    data-layer="Attach"
                    className="Attach"
                    style={{
                        left: 31,
                        top: 32,
                        position: 'absolute'
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.4648 2.1888C13.7349 2.1888 13.0349 2.47875 12.5188 2.99486L4.09463 11.419C3.23451 12.2791 2.7513 13.4457 2.7513 14.6621C2.7513 15.8785 3.23451 17.045 4.09463 17.9052C4.95474 18.7653 6.12131 19.2485 7.33769 19.2485C8.55408 19.2485 9.72065 18.7653 10.5808 17.9052L19.0049 9.48099C19.3629 9.12301 19.9433 9.12301 20.3013 9.48099C20.6593 9.83897 20.6593 10.4194 20.3013 10.7774L11.8771 19.2015C10.6732 20.4055 9.04031 21.0818 7.33769 21.0818C5.63508 21.0818 4.00219 20.4055 2.79826 19.2015C1.59433 17.9976 0.917969 16.3647 0.917969 14.6621C0.917969 12.9595 1.59433 11.3266 2.79826 10.1227L11.2224 1.69849C12.0824 0.838569 13.2487 0.355469 14.4648 0.355469C15.6809 0.355469 16.8472 0.838569 17.7071 1.69849C18.5671 2.55842 19.0501 3.72472 19.0501 4.94084C19.0501 6.15696 18.5671 7.32327 17.7071 8.18319L9.27379 16.6074C8.75788 17.1233 8.05814 17.4131 7.32853 17.4131C6.59891 17.4131 5.89918 17.1233 5.38326 16.6074C4.86735 16.0914 4.57751 15.3917 4.57751 14.6621C4.57751 13.9325 4.86735 13.2327 5.38326 12.7168L13.1661 4.94311C13.5243 4.58534 14.1047 4.58568 14.4625 4.94388C14.8203 5.30207 14.8199 5.88247 14.4617 6.24024L6.67963 14.0132C6.50776 14.1853 6.41084 14.4189 6.41084 14.6621C6.41084 14.9055 6.50753 15.1389 6.67963 15.311C6.85173 15.4831 7.08514 15.5798 7.32853 15.5798C7.57191 15.5798 7.80533 15.4831 7.97743 15.311L16.4108 6.88683C16.9266 6.37075 17.2168 5.67056 17.2168 4.94084C17.2168 4.21095 16.9269 3.51096 16.4108 2.99486C15.8947 2.47875 15.1947 2.1888 14.4648 2.1888Z" fill="black" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
