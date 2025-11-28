import React from 'react';

const OtherPersonHeader = ({ title, isLoading, getHeaderButtonText, onHeaderButtonClick }) => {
  return (
    <div
      data-layer="SubHeader"
      data-type="SectionApplication"
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
        style={{
          flex: '1 1 0',
          height: 85,
          paddingLeft: 20,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          display: 'flex'
        }}
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
          {title}
        </div>
        <div
          data-layer="Button container"
          className="ButtonContainer"
          style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}
        >
          <div
            data-layer="Send request button"
            data-state="pressed"
            className="SendRequestButton"
            onClick={isLoading ? undefined : onHeaderButtonClick}
            style={{
              width: 390,
              height: 85,
              background: isLoading ? '#666' : 'black',
              overflow: 'hidden',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8.98,
              display: 'flex',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
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
              {getHeaderButtonText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherPersonHeader;


