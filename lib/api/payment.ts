// lib/api/payment.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateMandateData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  account_number: string;
  bank_code: string;
  account_name: string;
  amount: number;
  frequency: string;
  start_date: string;
}

export interface InitiateCollectionData {
  amount: number;
  narration: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  detail?: string;
  error?: string;
  data?: any;
}

export interface MandateResponse extends ApiResponse {
  mandate_id?: string;
}

export interface CollectionResponse extends ApiResponse {
  collection_id?: string;
}

export interface NearbyUser {
  user_id: string;
  name: string;
  distance_meters: number;
  mandate_id?: string;
  account_number?: string;
  bank_code?: string;
  account_name?: string;
}

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    
    if (!response.ok) {
      // Extract error message properly - check for detail, error, or message
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
  async createMandate(data: CreateMandateData): Promise<MandateResponse> {
    try {
      console.log("Creating mandate with data:", data);
      
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/create-mandate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const result = await handleResponse(response);
      console.log("Response data:", result);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Create mandate error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create mandate";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async getMandate(mandateId: string): Promise<MandateResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
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
      console.error("Get mandate error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get mandate";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async listMandates(page: number = 1, pageSize: number = 20): Promise<ApiResponse> {
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
        `${API_BASE_URL}/api/payments/mandates?page=${page}&page_size=${pageSize}`,
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
      console.error("List mandates error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to list mandates";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async updateMandate(mandateId: string, amount: number): Promise<MandateResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Update mandate error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update mandate";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async initiateCollection(mandateId: string, data: InitiateCollectionData): Promise<CollectionResponse> {
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
        `${API_BASE_URL}/api/payments/mandate/${mandateId}/collect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Initiate collection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate collection";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async suspendMandate(mandateId: string, reason: string): Promise<ApiResponse> {
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
        `${API_BASE_URL}/api/payments/mandate/${mandateId}/suspend`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );
      const result = await handleResponse(response);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Suspend mandate error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to suspend mandate";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async cancelMandate(mandateId: string): Promise<ApiResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
        method: "DELETE",
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
      console.error("Cancel mandate error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel mandate";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },

  async getMandateStatus(mandateId: string): Promise<ApiResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          error: "Authentication required. Please log in.",
          detail: "Authentication required. Please log in."
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}/status`, {
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
      console.error("Get mandate status error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get mandate status";
      return {
        success: false,
        error: errorMessage,
        detail: errorMessage,
      };
    }
  },
};