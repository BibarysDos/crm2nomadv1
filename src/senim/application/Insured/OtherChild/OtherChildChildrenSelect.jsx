import React from 'react';

const OtherChildChildrenSelect = ({
  children,
  selectedChild,
  loading,
  error,
  onSelectChild,
  onBack,
  onSave
}) => {

  return (
    <div
      data-layer="Children select"
      className="ChildrenSelect"
      style={{ width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}
    >
      <div
        data-layer="Menu"
        data-property-1="Menu one"
        className="Menu"
        style={{
          width: 85,
          alignSelf: 'stretch',
          background: 'white',
          overflow: 'hidden',
          borderLeft: '1px #F8E8E8 solid',
          borderRight: '1px #F8E8E8 solid',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'inline-flex'
        }}
      >
        <div
          data-layer="Back button"
          className="BackButton"
          onClick={onBack}
          style={{
            width: 85,
            height: 85,
            position: 'relative',
            background: '#FBF9F9',
            overflow: 'hidden',
            borderBottom: '1px #F8E8E8 solid',
            cursor: 'pointer'
          }}
        >
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{ left: 32, top: 32, position: 'absolute' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <div
        data-layer="Children list"
        className="ChildrenList"
        style={{
          width: 1427,
          overflow: 'hidden',
          borderRight: '1px #F8E8E8 solid',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'inline-flex'
        }}
      >
        <div
          data-layer="SubHeader"
          className="Subheader"
          style={{
            alignSelf: 'stretch',
            height: 85,
            background: 'white',
            overflow: 'hidden',
            borderBottom: '1px #F8E8E8 solid',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex'
          }}
        >
          <div
            data-layer="Title"
            className="Title"
            style={{ flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}
          >
            <div
              data-layer="Screen Title"
              className="ScreenTitle"
              style={{
                flex: '1 1 0',
                textBoxTrim: 'trim-both',
                textBoxEdge: 'cap alphabetic',
                color: 'black',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: '500',
                wordWrap: 'break-word'
              }}
            >
              Выбрать ребенка
            </div>
            {!loading && !error && Array.isArray(children) && children.length > 0 && (
              <div
                data-layer="Save button"
                data-state="pressed"
                className="SaveButton"
                onClick={onSave}
                style={{
                  width: 388,
                  height: 85,
                  background: 'black',
                  overflow: 'hidden',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 8.98,
                  display: 'flex',
                  cursor: 'pointer'
                }}
              >
                <div
                  data-layer="Button Text"
                  className="ButtonText"
                  style={{
                    flex: '1 1 0',
                    textBoxTrim: 'trim-both',
                    textBoxEdge: 'cap alphabetic',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    wordWrap: 'break-word'
                  }}
                >
                  Сохранить
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          data-layer="Children items"
          className="ChildrenItems"
          style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'flex'
          }}
        >
          {loading && (
            <div
              data-layer="Loading"
              className="Loading"
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
                Загрузка списка детей...
              </div>
            </div>
          )}

          {!loading && error && (
            <div
              data-layer="Alert"
              className="Alert"
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
                color: 'black',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: '500'
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && Array.isArray(children) && children.length === 0 && (
            <div
              data-layer="Alert"
              className="Alert"
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
                Детей нет.
              </div>
            </div>
          )}

          {!loading && !error && Array.isArray(children) && children.length > 0 && (
            children.map((child) => {
              const isSelected =
                selectedChild &&
                typeof selectedChild === 'object' &&
                selectedChild.child_iin === child.child_iin;

              const displayName = `${child.child_surname || ''} ${child.child_name || ''} ${child.child_patronymic || ''}`
                .trim() || child.child_iin;

              return (
                <div
                  key={child.child_iin || displayName}
                  data-layer="Child item"
                  className="ChildItem"
                  onClick={() => onSelectChild(child)}
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
                      {displayName}
                    </div>
                  </div>
                  <div
                    data-layer="Radiobutton container"
                    className="RadiobuttonContainer"
                    style={{ width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden' }}
                  >
                    {isSelected ? (
                      <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{ left: 35, top: 36, position: 'absolute' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="6.5" fill="black" stroke="black" />
                        </svg>
                      </div>
                    ) : (
                      <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{ left: 35, top: 36, position: 'absolute' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="6.5" stroke="black" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherChildChildrenSelect;
