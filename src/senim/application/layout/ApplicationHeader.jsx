import React from 'react';
import { loadApplicationMetadata } from '../../../services/storageService';

const ApplicationHeader = ({
  applicationNumber,
  applicationId,
  folderType,
  currentTaskId,
  canClaimTaskNow,
  isDecisionDisabled,
  isClaimingTask,
  isSendingTask,
  isRejectingTask,
  userRole,
  processError,
  isSigned,
  onBackToProduct,
  onClaimTask,
  onSendForApproval,
  onOpenSigning,
  onRejectClick
}) => {
  const metadata = applicationId ? loadApplicationMetadata(applicationId) : null;
  const metadataFolderType = metadata?.folderType;

  const shouldShowButtons =
    currentTaskId &&
    (folderType === 'Task' ||
      folderType === 'Tasks' ||
      metadataFolderType === 'Task' ||
      metadataFolderType === 'Tasks' ||
      !metadataFolderType);

  const renderDecisionButtonLabel = () => {
    if (!userRole) {
      return 'Отправить на согласование';
    }
    const roleLower = userRole.toLowerCase().trim();
    if (roleLower === 'underwriter' || roleLower === 'compliance') {
      return 'Согласовать';
    }
    return 'Отправить на согласование';
  };

  const numberForTitle =
    applicationNumber || (applicationId ? applicationId.substring(0, 8) : '');

  return (
    <div
      data-layer="SubHeader"
      data-type="OrderHeader"
      className="Subheader"
      style={{
        alignSelf: 'stretch',
        background: 'white',
        overflow: 'hidden',
        borderBottom: '1px #F8E8E8 solid',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
      }}
    >
      <div
        data-layer="Frame 1321316873"
        className="Frame1321316873"
        style={{
          flex: '1 1 0',
          height: 85,
          paddingLeft: 20,
          background: 'white',
          overflow: 'hidden',
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
            flex: '1 1 auto',
            height: 12,
            textBoxTrim: 'trim-both',
            textBoxEdge: 'cap alphabetic',
            color: 'black',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: '500',
            wordWrap: 'break-word'
          }}
        >
          Заявление № {numberForTitle}
        </div>
      </div>
      {shouldShowButtons && (
        <div
          data-layer="Button Container"
          className="ButtonContainer"
          style={{
            flex: '0 0 777px',
            height: 85,
            background: 'white',
            overflow: 'hidden',
            borderLeft: '1px #F8E8E8 solid',
            justifyContent: 'flex-end',
            alignItems: 'center',
            display: 'flex',
            gap: 0
          }}
        >
          {processError && (
            <div
              style={{
                color: '#d32f2f',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 500,
                marginRight: 12
              }}
            >
              {processError}
            </div>
          )}
          {canClaimTaskNow ? (
            <div
              data-layer="Claim button"
              className="ClaimButton"
              style={{
                width: 388.5,
                height: 85,
                background: isClaimingTask ? '#666' : '#000',
                opacity: isClaimingTask ? 0.7 : 1,
                overflow: 'hidden',
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex',
                cursor: isClaimingTask ? 'wait' : 'pointer',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: 500
              }}
              onClick={isClaimingTask ? undefined : onClaimTask}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>
                {isClaimingTask ? 'Берем задачу...' : 'Взять задачу'}
              </div>
            </div>
          ) : (
            <>
              <div
                data-layer="Reject button"
                className="RejectButton"
                style={{
                  width: 388.5,
                  height: 85,
                  overflow: 'hidden',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'flex',
                  cursor: isDecisionDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDecisionDisabled ? 0.5 : 1,
                  color: 'black',
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: 500
                }}
                onClick={isDecisionDisabled ? undefined : onRejectClick}
              >
                <div style={{ flex: 1, textAlign: 'center' }}>
                  {isRejectingTask ? 'Отклоняем...' : 'Отклонить'}
                </div>
              </div>
              {!isSigned ? (
                <div
                  data-layer="Send button for signing"
                  className="SendButtonForSigning"
                  style={{
                    width: 388.5,
                    height: 85,
                    background: isDecisionDisabled ? '#666' : 'black',
                    overflow: 'hidden',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    cursor: isDecisionDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDecisionDisabled ? 0.7 : 1,
                    color: 'white',
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: 500
                  }}
                  onClick={isDecisionDisabled ? undefined : (onOpenSigning || (() => {
                    console.warn('onOpenSigning не определен');
                  }))}
                >
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    Отправить на подписание
                  </div>
                </div>
              ) : (
                <div
                  data-layer="Send button for approval"
                  className="SendButtonForApproval"
                  style={{
                    width: 388.5,
                    height: 85,
                    background: isDecisionDisabled ? '#666' : 'black',
                    overflow: 'hidden',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    cursor: isDecisionDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDecisionDisabled ? 0.7 : 1,
                    color: 'white',
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: 500
                  }}
                  onClick={isDecisionDisabled ? undefined : onSendForApproval}
                >
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    {isSendingTask ? 'Отправляем...' : renderDecisionButtonLabel()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationHeader;


