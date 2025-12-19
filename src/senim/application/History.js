import React, { useEffect, useState } from 'react';
import { loadApplicationHistory } from '../../services/storageService';
import { normalizeHistoryData, formatHistoryDateTime } from '../services/historyService';

const History = ({ onBack, applicationId }) => {
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    if (!applicationId) {
      return;
    }
    const data = loadApplicationHistory(applicationId);
    const normalized = normalizeHistoryData(data || {});
    setHistoryItems(normalized.items || []);
  }, [applicationId]);

  const columns = ['Этап процесса', 'Исполнитель', 'Дата события', 'Решение', 'Комментарий'];

  const renderMenu = () => (
    <div data-layer="Menu" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
        <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );

  const renderSubHeader = (title) => (
    <div data-layer="SubHeader" className="Subheader" style={{alignSelf: 'stretch', height: 85, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{title}</div>
      </div>
    </div>
  );

  return (
    <div data-layer="History page" className="HistoryPage" style={{width: 1512, minHeight: '100vh', background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
      {renderMenu()}
      <div data-layer="History content" className="HistoryContent" style={{width: 1427, alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        {renderSubHeader('История')}
        <div data-layer="History table wrapper" className="HistoryTableWrapper" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="History table head" className="HistoryTableHead" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: '#FCFCFC', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            {columns.map((title) => (
              <div key={title} data-layer="History cell head" className="HistoryCellHead" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                {title}
              </div>
            ))}
          </div>
          {historyItems.length === 0 ? (
            <div data-layer="History empty" className="HistoryEmpty" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Empty text" className="EmptyText" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>История пуста</div>
            </div>
          ) : (
            historyItems.map((item, index) => (
              <div key={`${item.stage}-${index}`} data-layer="History row" className="HistoryRow" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div data-layer="History cell" className="HistoryCell" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{item.stage || '—'}</div>
                <div data-layer="History cell" className="HistoryCell" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{item.performer || '—'}</div>
                <div data-layer="History cell" className="HistoryCell" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{item.eventDate ? formatHistoryDateTime(item.eventDate) : '—'}</div>
                <div data-layer="History cell" className="HistoryCell" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{item.decision || '—'}</div>
                <div data-layer="History cell" className="HistoryCell" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>{item.comment || '—'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

