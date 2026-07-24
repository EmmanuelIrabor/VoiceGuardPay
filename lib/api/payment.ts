// services/paymentService.ts
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

export interface MandateResponse {
  success: boolean;
  message?: string;
  mandate_id?: string;
  data?: any;
  error?: string;
}

export interface CollectionResponse {
  success: boolean;
  message?: string;
  collection_id?: string;
  data?: any;
  error?: string;
  detail?:string;
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
      throw new Error(data.error || data.detail || `API Error: ${response.status}`);
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    return JSON.parse(text);
  }
};

export const paymentService = {
  async createMandate(data: CreateMandateData): Promise<MandateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/create-mandate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Create mandate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create mandate",
      };
    }
  },

  async getMandate(mandateId: string): Promise<MandateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get mandate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get mandate",
      };
    }
  },

  async listMandates(page: number = 1, pageSize: number = 20): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/mandates?page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("List mandates error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list mandates",
      };
    }
  },

  async updateMandate(mandateId: string, amount: number): Promise<MandateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ amount }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Update mandate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update mandate",
      };
    }
  },

  async initiateCollection(mandateId: string, data: InitiateCollectionData): Promise<CollectionResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/mandate/${mandateId}/collect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(data),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("Initiate collection error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initiate collection",
      };
    }
  },

  async suspendMandate(mandateId: string, reason: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/mandate/${mandateId}/suspend`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ reason }),
        }
      );
      return await handleResponse(response);
    } catch (error) {
      console.error("Suspend mandate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to suspend mandate",
      };
    }
  },

  async cancelMandate(mandateId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Cancel mandate error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel mandate",
      };
    }
  },

  async getMandateStatus(mandateId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/mandate/${mandateId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Get mandate status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get mandate status",
      };
    }
  },
};