import React, { useState, useEffect } from 'react';
import { getDictionaryValues } from '../../services/processService';
import { getAccessToken } from '../../services/storageService';

const ClientType = ({ onBack, onSave, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [clientTypes, setClientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClientTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }
        const data = await getDictionaryValues('DicRelationCompany', token);
        if (Array.isArray(data)) {
          setClientTypes(data);
          // Если есть initialValue, находим соответствующий элемент
          if (initialValue) {
            const found = data.find(item => 
              item.id === initialValue?.id || 
              item.code === initialValue?.code ||
              item.nameRu === initialValue?.nameRu ||
              (typeof initialValue === 'string' && item.nameRu === initialValue)
            );
            if (found) {
              setSelectedValue(found);
            }
          }
        } else {
          setClientTypes([]);
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        setClientTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadClientTypes();
  }, [initialValue]);

  const handleSelect = (clientType) => {
    setSelectedValue(clientType);
  };

  const handleSave = () => {
    if (onSave && selectedValue) {
      onSave(selectedValue);
    }
  };

  const isSelected = (clientType) => {
    if (!selectedValue) return false;
    if (typeof selectedValue === 'object' && typeof clientType === 'object') {
      return selectedValue.id === clientType.id || selectedValue.code === clientType.code;
    }
    return selectedValue === clientType;
  };

  return (
    <div data-layer="Client type selection" className="ClientTypeSelection" style={{width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Back button" className="BackButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="Client type" className="ClientType" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Тип клиента</div>
            <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSave} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
              <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
            </div>
          </div>
        </div>
        <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          {loading && (
            <div data-layer="Loading" className="Loading" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Загрузка...</div>
            </div>
          )}
          {error && (
            <div data-layer="Alert" className="Alert" style={{alignSelf: 'stretch', height: 85, paddingRight: 20, background: '#fff5f5', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
              <div data-layer="Info container" className="InfoContainer" style={{width: 85, height: 85, position: 'relative', background: 'white', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer="Error" className="Error" style={{left: 31, top: 32, position: 'absolute'}}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="10" stroke="#d32f2f" strokeWidth="2" />
                    <path d="M11 7V11M11 15H11.01" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div data-layer="Label" className="Label" style={{flex: '1 1 0', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#d32f2f', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{error}</div>
            </div>
          )}
          {!loading && !error && clientTypes.map((clientType) => (
            <div
              key={clientType.id || clientType.code}
              data-layer="Radio Option"
              data-state={isSelected(clientType) ? 'pressed' : 'not_pressed'}
              className="RadioOption"
              onClick={() => handleSelect(clientType)}
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
            >
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{clientType.nameRu || clientType.nameKz || clientType.code}</div>
              </div>
              <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                {isSelected(clientType) ? (
                  <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
                    </svg>
                  </div>
                ) : (
                  <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{left: 35, top: 36, position: 'absolute'}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="6.5" stroke="black"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientType;
