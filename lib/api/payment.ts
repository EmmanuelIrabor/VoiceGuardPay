// lib/api/payment.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface InitiatePaymentData {
  amount: number;
  narration: string;
  recipient_id: string;
  sender_id: string;
  pin: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  detail?: string;
  error?: string;
  transaction_id?: string;
  data?: any;
}

const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const paymentService = {
  async initiatePayment(data: InitiatePaymentData): Promise<PaymentResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        
        if (!response.ok) {
          const errorMessage = result.detail || result.error || result.message || JSON.stringify(result);
          return {
            success: false,
            error: errorMessage,
            detail: errorMessage,
          };
        }
        
        return {
          success: true,
          ...result
        };
      } else {
        const text = await response.text();
        if (!response.ok) {
          return {
            success: false,
            error: `Server error: ${response.status}`,
            detail: text || `Server error: ${response.status}`,
          };
        }
        return {
          success: true,
          data: text
        };
      }
    } catch (error) {
      console.error("Payment error:", error);
      let errorMessage = "Failed to process payment";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = "Unknown error occurred";
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  }
};