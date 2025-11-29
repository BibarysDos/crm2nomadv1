import React from 'react';
import Policyholder from './Policyholder';
import Insured from './Insured/Insured';
import Beneficiary from './Beneficiary';
import Terms from './Terms';
import Questionary from './Questionary/Questionary';
import History from './History';
import RejectReason from './RejectReason';
import ApplicationHeader from './layout/ApplicationHeader';
import PolicyholderCard from './cards/PolicyholderCard';
import InsuredCard from './cards/InsuredCard';
import HistoryCard from './cards/HistoryCard';
import BeneficiaryCard from './cards/BeneficiaryCard';
import TermsCard from './cards/TermsCard';
import QuestionaryCard from './cards/QuestionaryCard';
import { useApplicationData } from '../hooks/useApplicationData';

const Application = ({ selectedProduct, applicationId, onBack, processState, onProcessStateRefresh, folderType = 'Statement' }) => {
  const {
    state,
    derived,
    setters,
    handlers
  } = useApplicationData({ applicationId, selectedProduct, processState, onProcessStateRefresh });

  const {
    currentView,
    policyholderData,
    insuredData,
    termsData,
    questionaryData,
    historyData,
    beneficiaryData,
    applicationNumber,
    processDetails,
    isClaimingTask,
    isSendingTask,
    isRejectingTask,
    reasons,
    selectedReasonId,
    reasonsLoading,
    processError,
    userRole,
    isLoadingApplicationData,
    isLoadingInsured
  } = state;

  const { currentTaskId, canClaimTaskNow, isDecisionDisabled } = derived;

  const {
    setCurrentView
  } = setters;

  const {
    handleClaimTask,
    handleSendForApproval,
    handleRejectClick,
    handleConfirmReject,
    handleBackToMain,
    handleOpenPolicyholder,
    handleOpenInsured,
    handleOpenTerms,
    handleOpenQuestionary,
    handleViewFullHistory,
    handleInsuredSave,
    handlePolicyholderSave,
    handleTermsSave,
    handleQuestionarySave,
    setSelectedReasonId
  } = handlers;
  
  const handleBackToProduct = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleSendForApprovalAndClose = async () => {
    const success = await handleSendForApproval();
    if (success && onBack) {
      onBack();
    }
  };

  const handleConfirmRejectAndClose = async () => {
    const success = await handleConfirmReject();
    if (success && onBack) {
      onBack();
    }
  };
  // Порядок разделов для навигации

  // Функция для сохранения данных заявки в API
  // Функция для сохранения данных заявки в API для секций Terms/Questionary перенесена в хук

  const handleBackFromReject = () => {
    setCurrentView('main');
    setSelectedReasonId(null);
  };

  if (currentView === 'history') {
    return (
      <History
        onBack={handleBackToMain}
        applicationId={applicationId}
      />
    );
  }

  if (currentView === 'policyholder') {
    return (
      <Policyholder
        onBack={handleBackToMain}
        onSave={handlePolicyholderSave}
        applicationId={applicationId}
        taskId={processState?.taskId}
        processDetails={processDetails}
      />
    );
  }

  if (currentView === 'insured') {
    // Показываем индикатор загрузки, пока данные застрахованного загружаются
    if (isLoadingInsured) {
      return (
        <div style={{width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white'}}>
          <div style={{textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500'}}>
            Загрузка данных застрахованного...
          </div>
        </div>
      );
    }
    return <Insured onBack={handleBackToMain} policyholderData={policyholderData} onSave={handleInsuredSave} applicationId={applicationId} taskId={processState?.taskId} savedInsuredData={insuredData} />;
  }

  if (currentView === 'beneficiary') {
    return <Beneficiary onBack={handleBackToMain} applicationId={applicationId} />;
  }

  if (currentView === 'terms') {
    return <Terms onBack={handleBackToMain} onSave={handleTermsSave} applicationId={applicationId} processDetails={processDetails} taskId={currentTaskId} historyData={historyData} />;
  }

  if (currentView === 'questionary') {
    // Получаем contragentId клиента и застрахованного из processDetails
    let clientContragentId = null;
    let insuredContragentId = null;
    
    if (processDetails?.contragents) {
      const clientContragent = processDetails.contragents.find(c => c.contragentRoleCode === 'client');
      const insuredContragent = processDetails.contragents.find(c => c.contragentRoleCode === 'insured');
      
      if (clientContragent?.id) {
        clientContragentId = clientContragent.id;
      }
      if (insuredContragent?.id) {
        insuredContragentId = insuredContragent.id;
      }
    }
    
    // Fallback на insuredData, если не нашли в processDetails
    if (!insuredContragentId && insuredData?.fullData?.fullInsured?.id) {
      insuredContragentId = insuredData.fullData.fullInsured.id;
    }
    
    return (
      <Questionary 
        onBack={handleBackToMain} 
        onSave={handleQuestionarySave} 
        applicationId={applicationId}
        clientContragentId={clientContragentId}
        insuredContragentId={insuredContragentId}
        taskId={currentTaskId}
        historyData={historyData}
        processDetails={processDetails}
      />
    );
  }

  if (currentView === 'reject') {
    return (
      <RejectReason
        reasons={reasons}
        selectedReasonId={selectedReasonId}
        onReasonSelect={setSelectedReasonId}
        onConfirm={handleConfirmRejectAndClose}
        onBack={handleBackFromReject}
        isLoading={reasonsLoading}
        isRejectingTask={isRejectingTask}
      />
    );
  }

  // Показываем индикатор загрузки, пока данные загружаются
  if (isLoadingApplicationData) {
    return (
      <div style={{width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white'}}>
        <div style={{textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500'}}>
          Загрузка данных заявки...
        </div>
      </div>
    );
  }

  return (
    <div data-layer="Statements details" className="StatementsDetails" style={{width: 1512, background: 'white', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu one" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Back button" className="BackButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}} onClick={handleBackToProduct}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 32, top: 32, position: 'absolute'}}>
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
          <line x1="4.00024" y1="11.2505" x2="12.0006" y2="11.2505" stroke="black" strokeWidth="1.5"/>
          <line x1="4.00024" y1="15.2507" x2="10.0005" y2="15.2507" stroke="black" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="Statements details" className="StatementsDetails" style={{flex: '1 1 0', alignSelf: 'stretch', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <ApplicationHeader
      applicationNumber={applicationNumber}
      applicationId={applicationId}
      folderType={folderType}
      currentTaskId={currentTaskId}
      canClaimTaskNow={canClaimTaskNow}
      isDecisionDisabled={isDecisionDisabled}
      isClaimingTask={isClaimingTask}
      isSendingTask={isSendingTask}
      isRejectingTask={isRejectingTask}
      userRole={userRole}
      processError={processError}
      onBackToProduct={handleBackToProduct}
      onClaimTask={handleClaimTask}
      onSendForApproval={handleSendForApprovalAndClose}
      onRejectClick={handleRejectClick}
    />
    <div data-layer="Application data section" className="ApplicationDataSection" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      <HistoryCard historyData={historyData} onOpen={handleViewFullHistory} />
      <PolicyholderCard policyholderData={policyholderData} onOpen={handleOpenPolicyholder} />
      <InsuredCard insuredData={insuredData} onOpen={handleOpenInsured} />
      <BeneficiaryCard beneficiaryData={beneficiaryData} />
      <TermsCard termsData={termsData} onOpen={handleOpenTerms} />
      <QuestionaryCard hasQuestionary={Boolean(questionaryData)} questionnaireData={questionaryData} onOpen={handleOpenQuestionary} />
    </div>
  </div>
  </div>
  );
};

export default Application;
