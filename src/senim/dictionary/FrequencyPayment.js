import React, { useState, useEffect } from 'react';
import { getProgramPaymentFrequencies } from '../../services/processService';
import { getAccessToken } from '../../services/storageService';

const FrequencyPayment = ({ onBack, onSelect, programId, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [frequencies, setFrequencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFrequencies = async () => {
      if (!programId) {
        setError('Программа страхования не выбрана');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const token = getAccessToken();
        const frequenciesData = await getProgramPaymentFrequencies(programId, token);
        setFrequencies(frequenciesData || []);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить частоты оплаты');
      } finally {
        setIsLoading(false);
      }
    };

    loadFrequencies();
  }, [programId]);

  // Обновляем selectedValue при изменении initialValue
  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  const handleSelect = (frequency) => {
    setSelectedValue(frequency);
  };

  const handleSave = () => {
    if (selectedValue && onSelect) {
      onSelect(selectedValue);
    } else if (onBack) {
      onBack();
    }
  };
  return (
    <div data-layer="Selection payment procedure" className="SelectionPaymentProcedure" style={{width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Menu button" className="MenuButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
    <div data-layer="OpenDocument button" className="OpendocumentButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
      <div data-layer="File" className="File" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute'}}>
        <div data-svg-wrapper data-layer="Frame 1321316875" className="Frame1321316875" style={{left: 3, top: 1, position: 'absolute'}}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0L16.001 6V18.001C16.0009 19.1008 15.1008 20.0008 14.001 20.001H1.99023C0.890252 20.001 0.000107007 19.1009 0 18.001L0.00976562 2C0.00980161 0.900011 0.900014 4.85053e-05 2 0H10ZM2.00293 2V18.001H14.0039V7H9.00293V2H2.00293Z" fill="black"/>
          <line x1="4.00049" y1="11.251" x2="12.0008" y2="11.251" stroke="black" strokeWidth="1.5"/>
          <line x1="4.00049" y1="15.251" x2="10.0008" y2="15.251" stroke="black" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="Payment procedure" className="PaymentProcedure" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Порядок оплаты</div>
        <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSave} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
      </div>
    </div>
    <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      {isLoading ? (
        <div data-layer="Loading state" className="LoadingState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Загрузка частот оплаты...</div>
        </div>
      ) : error ? (
        <div data-layer="Error state" className="ErrorState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#D32F2F', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{error}</div>
        </div>
      ) : frequencies.length === 0 ? (
        <div data-layer="Empty state" className="EmptyState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Частоты оплаты недоступны</div>
        </div>
      ) : (
        frequencies.map((frequency) => {
          const isSelected = selectedValue && (
            (typeof selectedValue === 'object' && (
              selectedValue.id === frequency.id ||
              selectedValue.paymentFrequencyId === frequency.paymentFrequencyId ||
              selectedValue.paymentFrequencyCode === frequency.paymentFrequencyCode
            )) ||
            (typeof selectedValue === 'string' && (selectedValue === frequency.paymentFrequencyNameRu || selectedValue === frequency.paymentFrequencyCode))
          );
          return (
            <div
              key={frequency.id}
              data-layer="InputContainerRadioButton"
              data-state={isSelected ? 'pressed' : 'not_pressed'}
              className="Inputcontainerradiobutton"
              onClick={() => handleSelect(frequency)}
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
            >
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                  {frequency.paymentFrequencyNameRu || frequency.paymentFrequencyNameKz || frequency.paymentFrequencyCode}
                </div>
              </div>
              <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer={isSelected ? "Ellipse-on" : "Ellipse-off"} className={isSelected ? "EllipseOn" : "EllipseOff"} style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="6.5" fill={isSelected ? "black" : "none"} stroke="black"/>
                  </svg>
                </div>
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

export default FrequencyPayment;