import React from 'react';
import { formatHistoryDateTime } from '../../services/historyService';

const HistoryCard = ({ historyData, onOpen }) => {
  return (
    <div
      data-layer="Сounterparty History"
      data-state="pressed"
      className="OunterpartyHistory"
      style={{
        alignSelf: 'stretch',
        background: 'white',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        display: 'flex'
      }}
    >
      <div
        data-layer="Sections History"
        className="SectionsHistory"
        style={{
          width: 1427,
          height: 85,
          paddingLeft: 20,
          background: '#FCFCFC',
          overflow: 'hidden',
          borderBottom: '1px #F8E8E8 solid',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10,
          display: 'inline-flex'
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
              flex: '1 1 0',
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
            История
          </div>
        </div>
        <div
          data-layer="Open button"
          className="OpenButton"
          onClick={onOpen}
          style={{
            width: 85,
            height: 85,
            position: 'relative',
            background: '#FBF9F9',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <div
            data-svg-wrapper
            data-layer="Chewron right"
            className="ChewronRight"
            style={{ left: 31, top: 32, position: 'absolute' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 4L15 11.5L7 19" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <div
        data-layer="Info container"
        data-state="pressed"
        className="InfoContainer"
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
            Дата события
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
            {historyData?.lastEventDate
              ? formatHistoryDateTime(historyData.lastEventDate)
              : '—'}
          </div>
        </div>
      </div>
      <div
        data-layer="Input Field"
        data-state="pressed"
        className="InputField"
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
            Статус процесса
          </div>
          <div
            data-layer="%Input text"
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
            {historyData?.lastStage || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;


