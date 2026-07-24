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

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.detail || data.error || data.message || JSON.stringify(data);
      throw new Error(errorMessage);
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, data: text };
    }
  }
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

      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process payment";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async getTransaction(transactionId: string): Promise<PaymentResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/transaction/${transactionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Get transaction error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get transaction";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async getTransactions(userId: string, page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payments/transactions/${userId}?page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Get transactions error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get transactions";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  }
};