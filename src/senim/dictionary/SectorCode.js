import React, { useState, useEffect } from 'react';

const SectorCode = ({ onBack, onSelect, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  // Установка начального значения при монтировании или изменении initialValue
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== null && initialValue !== '') {
      // Если initialValue - это число или строка с числом, используем его
      const value = String(initialValue).trim();
      // Проверяем, является ли значение числом от 1 до 9
      if (/^[1-9]$/.test(value)) {
        setSelectedValue(value);
      } else {
        // Если это полный текст, пытаемся найти соответствующий код
        const sectorCodes = {
          '1 - Правительство Республики Казахстан или Правительство иностранного государства': '1',
          '2 - Региональные и местные органы управления': '2',
          '3 - Центральный (национальный) банк': '3',
          '4 - Другие депозитные организации': '4',
          '5 - Другие финансовые организации': '5',
          '6 - Государственные нефинансовые организации': '6',
          '7 - Негосударственные нефинансовые организации': '7',
          '8 - Некоммерческие организации, обслуживающие домашние хозяйства': '8',
          '9 - Домашние хозяйства/физическое лицо': '9'
        };
        // Ищем по полному тексту или по части текста после " - "
        const foundCode = Object.keys(sectorCodes).find(key => {
          const textAfterDash = key.split(' - ')[1];
          return String(initialValue).includes(textAfterDash) || key.includes(String(initialValue));
        });
        if (foundCode) {
          setSelectedValue(sectorCodes[foundCode]);
        }
      }
    } else {
      // Если initialValue пустое, сбрасываем выбранное значение
      setSelectedValue(null);
    }
  }, [initialValue]);

  // Маппинг значений на читаемые имена
  const getDisplayName = (value) => {
    const nameMap = {
      '1': '1 - Правительство Республики Казахстан или Правительство иностранного государства',
      '2': '2 - Региональные и местные органы управления',
      '3': '3 - Центральный (национальный) банк',
      '4': '4 - Другие депозитные организации',
      '5': '5 - Другие финансовые организации',
      '6': '6 - Государственные нефинансовые организации',
      '7': '7 - Негосударственные нефинансовые организации',
      '8': '8 - Некоммерческие организации, обслуживающие домашние хозяйства',
      '9': '9 - Домашние хозяйства/физическое лицо'
    };
    return nameMap[value] || value;
  };

  // Массив секторов для рендеринга
  const sectors = [
    { value: '1', label: '1 - Правительство Республики Казахстан или Правительство иностранного государства' },
    { value: '2', label: '2 - Региональные и местные органы управления' },
    { value: '3', label: '3 - Центральный (национальный) банк' },
    { value: '4', label: '4 - Другие депозитные организации' },
    { value: '5', label: '5 - Другие финансовые организации' },
    { value: '6', label: '6 - Государственные нефинансовые организации' },
    { value: '7', label: '7 - Негосударственные нефинансовые организации' },
    { value: '8', label: '8 - Некоммерческие организации, обслуживающие домашние хозяйства' },
    { value: '9', label: '9 - Домашние хозяйства/физическое лицо' }
  ];

  return (
    <div data-layer="List variants" className="ListVariants" style={{width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Menu button" className="MenuButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" stroke-width="2"/>
        </svg>
      </div>
    </div>
    <div data-layer="OpenDocument button" className="OpendocumentButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
      <div data-layer="File" className="File" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute'}}>
        <div data-svg-wrapper data-layer="Frame 1321316875" className="Frame1321316875" style={{left: 3, top: 1, position: 'absolute'}}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0L16.001 6V18.001C16.0009 19.1008 15.1008 20.0008 14.001 20.001H1.99023C0.890252 20.001 0.000107007 19.1009 0 18.001L0.00976562 2C0.00980161 0.900011 0.900014 4.85053e-05 2 0H10ZM2.00293 2V18.001H14.0039V7H9.00293V2H2.00293Z" fill="black"/>
          <line x1="4" y1="11.2505" x2="12.0004" y2="11.2505" stroke="black" stroke-width="1.5"/>
          <line x1="4" y1="15.2508" x2="10.0003" y2="15.2508" stroke="black" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Код сектора экономики</div>
        <div data-layer="ActionButtonWithoutRounding" data-state="pressed" className="Actionbuttonwithoutrounding" onClick={() => onSelect && onSelect(getDisplayName(selectedValue))} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
      </div>
    </div>
    <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      {sectors.map((sector) => (
        <div 
          key={sector.value}
          data-layer="InputContainerRadioButton" 
          data-state={selectedValue === sector.value ? 'pressed' : 'not_pressed'} 
          className="Inputcontainerradiobutton" 
          onClick={() => setSelectedValue(sector.value)} 
          style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
        >
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{sector.label}</div>
          </div>
          <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
            {selectedValue === sector.value ? (
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

export default SectorCode;