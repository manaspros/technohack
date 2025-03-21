import axios from "axios";

// Define API base URL - configure for development and production
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000, // Increase to 5 minutes (300,000 ms) for very long operations
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Received response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

// Types for API requests and responses
export interface Message {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  settings?: {
    rag_enabled?: boolean;
    web_search_enabled?: boolean;
  };
}

export interface ChatResponse {
  message: string;
  session_id: string;
}

export interface SessionInfo {
  session_id: string;
  created_at: string;
  last_active: string;
  rag_enabled: boolean;
  web_search_enabled: boolean;
  message_count: number;
}

export interface FeatureToggleRequest {
  session_id: string;
  feature: "rag" | "websearch";
  enabled: boolean;
}

export interface ConversationSaveRequest {
  session_id: string;
  filename: string;
}

export interface ConversationLoadRequest {
  conversation_name: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  filename: string;
  message: string;
}

// Error handler helper
const handleApiError = (error: any): never => {
  let errorMessage = "An unknown error occurred";

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      const serverError =
        error.response.data.error || error.response.data.detail;
      errorMessage =
        typeof serverError === "string" ? serverError : "Server error";
    } else if (error.request) {
      // No response received
      errorMessage =
        "No response from server. Please make sure the API server is running at " +
        BASE_URL;
    } else {
      // Request setup error
      errorMessage = error.message || "Error setting up request";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  throw new Error(errorMessage);
};

// API service functions
export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post<ChatResponse>("/chat", request);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  toggleFeature: async (
    request: FeatureToggleRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/features/toggle", request);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSession: async (sessionId: string): Promise<SessionInfo> => {
    try {
      const response = await apiClient.get<SessionInfo>(
        `/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSessionHistory: async (sessionId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.post<Message[]>(
        `/sessions/${sessionId}/history`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  listSessions: async (): Promise<SessionInfo[]> => {
    try {
      const response = await apiClient.get<SessionInfo[]>("/sessions");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteSession: async (
    sessionId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Conversation management
  listConversations: async (): Promise<{ conversations: string[] }> => {
    try {
      const response = await apiClient.get<{ conversations: string[] }>(
        "/conversations"
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  saveConversation: async (
    request: ConversationSaveRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/conversations/save", request);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  loadConversation: async (
    request: ConversationLoadRequest
  ): Promise<{ success: boolean; session_id: string; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        session_id: string;
        message: string;
      }>("/conversations/load", request);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Document processing
  uploadDocument: async (
    sessionId: string,
    file: File
  ): Promise<DocumentUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("file", file);

      const response = await apiClient.post<DocumentUploadResponse>(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  processDocumentList: async (
    sessionId: string,
    documentListPath: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/documents/process-list", {
        session_id: sessionId,
        document_list_path: documentListPath,
      });

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default chatApi;
