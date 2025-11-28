import React from 'react';

export const CalendarField = ({
    label,
    value,
    onChange,
    onBlur,
    isActive,
    onActivate
}) => {
    const hasValue = !!value;
    const isPressed = isActive || hasValue;

    // Если передан onChange, значит поле редактируемое (как в Policyholder.js)
    // Если нет, то оно работает как кнопка (как в InsuredFormFields.js, хотя там тоже может быть редактируемым)
    const isEditable = !!onChange;

    if (isPressed) {
        return (
            <div
                data-layer={`Input '${label}'`}
                data-state="pressed"
                className="Input"
                style={{
                    alignSelf: 'stretch',
                    height: 85,
                    paddingLeft: 20,
                    background: 'white',
                    overflow: 'hidden',
                    borderBottom: '1px #F8E8E8 solid',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
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
                        {isEditable ? (
                            <input
                                type="text"
                                value={value || ''}
                                onChange={onChange}
                                onBlur={onBlur}
                                autoFocus={isActive}
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
                        ) : (
                            value
                        )}
                    </div>
                </div>
                <div
                    data-layer="Calendar button"
                    className="CalendarButton"
                    style={{
                        width: 85,
                        height: 85,
                        position: 'relative',
                        background: '#FBF9F9',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => {
                        if (isEditable) {
                            // Если редактируемое, клик по иконке может открывать календарь (логика в родителе)
                            // или просто активировать поле
                            onActivate && onActivate();
                        }
                    }}
                >
                    <div
                        data-svg-wrapper
                        data-layer="Calendar"
                        className="Calendar"
                        style={{
                            left: 31,
                            top: 32,
                            position: 'absolute'
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.33301 0.916992C7.83927 0.916992 8.24967 1.3274 8.24967 1.83366V2.75033H13.7497V1.83366C13.7497 1.3274 14.1601 0.916992 14.6663 0.916992C15.1726 0.916992 15.583 1.3274 15.583 1.83366V2.75033H17.4163C18.1457 2.75033 18.8452 3.04006 19.3609 3.55578C19.8766 4.07151 20.1663 4.77098 20.1663 5.50033V18.3337C20.1663 19.063 19.8766 19.7625 19.3609 20.2782C18.8452 20.7939 18.1457 21.0837 17.4163 21.0837H4.58301C3.85366 21.0837 3.15419 20.7939 2.63846 20.2782C2.12274 19.7625 1.83301 19.063 1.83301 18.3337V5.50033C1.83301 4.77098 2.12274 4.07151 2.63846 3.55578C3.15419 3.04006 3.85366 2.75033 4.58301 2.75033H6.41634V1.83366C6.41634 1.3274 6.82675 0.916992 7.33301 0.916992ZM6.41634 4.58366H4.58301C4.33989 4.58366 4.10673 4.68024 3.93483 4.85214C3.76292 5.02405 3.66634 5.25721 3.66634 5.50033V8.25033H18.333V5.50033C18.333 5.25721 18.2364 5.02405 18.0645 4.85214C17.8926 4.68024 17.6595 4.58366 17.4163 4.58366H15.583V5.50033C15.583 6.00659 15.1726 6.41699 14.6663 6.41699C14.1601 6.41699 13.7497 6.00659 13.7497 5.50033V4.58366H8.24967V5.50033C8.24967 6.00659 7.83927 6.41699 7.33301 6.41699C6.82724 6.41699 6.41634 6.00659 6.41634 5.50033V4.58366ZM18.333 10.0837H3.66634V18.3337C3.66634 18.5768 3.76292 18.8099 3.93483 18.9818C4.10673 19.1537 4.33989 19.2503 4.58301 19.2503H17.4163C17.6595 19.2503 17.8926 19.1537 18.0645 18.9818C18.2364 18.8099 18.333 18.5768 18.333 18.3337V10.0837Z" fill="black" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div
                data-layer={`Input '${label}'`}
                data-state="not_pressed"
                className="Input"
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
                <div
                    data-layer="Calendar button"
                    className="CalendarButton"
                    style={{
                        width: 85,
                        height: 85,
                        position: 'relative',
                        background: '#FBF9F9',
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onActivate && onActivate();
                    }}
                >
                    <div
                        data-svg-wrapper
                        data-layer="Calendar"
                        className="Calendar"
                        style={{
                            left: 31,
                            top: 32,
                            position: 'absolute'
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.33301 0.916992C7.83927 0.916992 8.24967 1.3274 8.24967 1.83366V2.75033H13.7497V1.83366C13.7497 1.3274 14.1601 0.916992 14.6663 0.916992C15.1726 0.916992 15.583 1.3274 15.583 1.83366V2.75033H17.4163C18.1457 2.75033 18.8452 3.04006 19.3609 3.55578C19.8766 4.07151 20.1663 4.77098 20.1663 5.50033V18.3337C20.1663 19.063 19.8766 19.7625 19.3609 20.2782C18.8452 20.7939 18.1457 21.0837 17.4163 21.0837H4.58301C3.85366 21.0837 3.15419 20.7939 2.63846 20.2782C2.12274 19.7625 1.83301 19.063 1.83301 18.3337V5.50033C1.83301 4.77098 2.12274 4.07151 2.63846 3.55578C3.15419 3.04006 3.85366 2.75033 4.58301 2.75033H6.41634V1.83366C6.41634 1.3274 6.82675 0.916992 7.33301 0.916992ZM6.41634 4.58366H4.58301C4.33989 4.58366 4.10673 4.68024 3.93483 4.85214C3.76292 5.02405 3.66634 5.25721 3.66634 5.50033V8.25033H18.333V5.50033C18.333 5.25721 18.2364 5.02405 18.0645 4.85214C17.8926 4.68024 17.6595 4.58366 17.4163 4.58366H15.583V5.50033C15.583 6.00659 15.1726 6.41699 14.6663 6.41699C14.1601 6.41699 13.7497 6.00659 13.7497 5.50033V4.58366H8.24967V5.50033C8.24967 6.00659 7.83927 6.41699 7.33301 6.41699C6.82724 6.41699 6.41634 6.00659 6.41634 5.50033V4.58366ZM18.333 10.0837H3.66634V18.3337C3.66634 18.5768 3.76292 18.8099 3.93483 18.9818C4.10673 19.1537 4.33989 19.2503 4.58301 19.2503H17.4163C17.6595 19.2503 17.8926 19.1537 18.0645 18.9818C18.2364 18.8099 18.333 18.5768 18.333 18.3337V10.0837Z" fill="black" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
};
