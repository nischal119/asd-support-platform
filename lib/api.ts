const API_BASE_URL = "http://abooking.geeksewa.com/api";

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {} as Record<string, string>;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const authHeaders = this.getAuthHeaders();
      const mergedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
        ...authHeaders,
      };
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: mergedHeaders,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }
      // Debug log for all API responses
      console.log("API raw response:", data);
      // If the response has a 'token' and 'role', return as-is (for login/register)
      if (data.token && data.role) {
        return data;
      }
      // Otherwise, return the 'data' property if present, or the whole object
      return data.data !== undefined ? { data: data.data } : data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: any, role: "user" | "doctor") {
    return this.request(`/register/${role}`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getDoctors() {
    return this.request("/user/doctors");
  }

  async bookAppointment(appointmentData: any) {
    return this.request("/user/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
  }

  // Doctor endpoints
  async getDoctorAppointments() {
    return this.request("/doctor/appointments");
  }

  async acceptAppointment(appointmentId: string) {
    return this.request(`/doctor/appointments/accept`, {
      method: "POST",
      body: JSON.stringify({ appointment_id: appointmentId }),
    });
  }

  async rejectAppointment(appointmentId: string) {
    return this.request(`/doctor/appointments/reject`, {
      method: "POST",
      body: JSON.stringify({ appointment_id: appointmentId }),
    });
  }

  // Admin endpoints
  async getUsers() {
    return this.request("/admin/users");
  }

  async getAdminDoctors() {
    return this.request("/admin/doctors");
  }

  async getAdminAppointments() {
    return this.request("/admin/appointments");
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: "DELETE" });
  }

  async deleteAppointment(appointmentId: string) {
    return this.request(`/admin/appointments/${appointmentId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
