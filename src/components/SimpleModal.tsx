import React from 'react';

interface SimpleModalProps {
  show: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
  confirmText?: string;
  routerPush: (path: string) => void;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ 
  show, 
  title, 
  message, 
  onCancel, 
  onConfirm, 
  canConfirm,
  confirmText = "Confirm",
  routerPush
}) => {
  const handleAddTokens = () => {
    console.log("Navigating to add tokens page");
    routerPush('/dashboard/wallet?action=purchase');
  };

  // Prevent closing when clicking inside the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleButtonClick = () => {
    if (canConfirm) {
      console.log("Confirm button clicked");
      onConfirm();
    } else {
      console.log("Add Tokens button clicked");
      handleAddTokens();
    }
  };

  if (!show) return null;

  return (
    // Overlay
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
      data-custom-modal="true"
    >
      {/* Modal Box */}
      <div 
        style={{
          backgroundColor: "#121212",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
        onClick={handleModalClick}
      >
        {/* Modal Title */}
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "bold", 
          marginBottom: "1rem",
          color: "white"
        }}>
          {title}
        </h2>
        
        {/* Modal Content */}
        <p style={{ 
          marginBottom: "1.5rem",
          color: "rgba(255, 255, 255, 0.8)"
        }}>
          {message}
        </p>
        
        {/* Modal Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button 
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "white",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transition: "background-color 0.2s",
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button 
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              backgroundColor: canConfirm ? "#3b82f6" : "#10b981",
              color: "white",
              cursor: "pointer",
              border: "none",
              transition: "background-color 0.2s",
            }}
            onClick={handleButtonClick}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal; 