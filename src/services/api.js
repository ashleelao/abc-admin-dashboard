const API_BASE_URL = 'https://k6vgfj0ap5.execute-api.ap-southeast-1.amazonaws.com/prod';

class StaffAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Create new staff
  async createStaff(staffData) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  // Update staff
  async updateStaff(clinicId, staffId, updates) {
    return this.request(`/staff/${clinicId}/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Get single staff
  async getStaff(clinicId, staffId) {
    return this.request(`/staff/${clinicId}/${staffId}`);
  }

  // List all staff (with optional filtering)
  async listStaff(clinicId, filters = {}) {
    const queryParams = new URLSearchParams({
      clinic_id: clinicId,
      ...filters,
    });
    
    return this.request(`/staff?${queryParams}`);
  }

  // Soft delete (deactivate) staff
  async deactivateStaff(clinicId, staffId, reason = 'Administrative deactivation') {
    return this.request(`/staff/${clinicId}/${staffId}/deactivate`, {
      method: 'PATCH',
      body: JSON.stringify({ deactivation_reason: reason }),
    });
  }

  // Restore staff
  async restoreStaff(clinicId, staffId) {
    return this.request(`/staff/${clinicId}/${staffId}/restore`, {
      method: 'PUT',
    });
  }

  // Get active staff
  async getActiveStaff(clinicId) {
    return this.listStaff(clinicId, { status: 'active' });
  }

  // Get inactive staff
  async getInactiveStaff(clinicId) {
    return this.listStaff(clinicId, { status: 'inactive' });
  }

  // Get doctors for secretary assignment
  async getDoctors(clinicId) {
    return this.listStaff(clinicId, { 
      status: 'active',
      role: 'Doctor'
    });
  }

  // Get statistics
  async getStaffStats(clinicId) {
    try {
      const [activeStaff, inactiveStaff] = await Promise.all([
        this.getActiveStaff(clinicId),
        this.getInactiveStaff(clinicId)
      ]);

      const doctors = (activeStaff.staff || []).filter(s => s.role === 'Doctor').length;
      const secretaries = (activeStaff.staff || []).filter(s => s.role === 'Secretary').length;
      const inactive = (inactiveStaff.staff || []).length;

      return {
        totalActive: (activeStaff.staff || []).length,
        doctors,
        secretaries,
        inactive,
        total: (activeStaff.staff || []).length + inactive
      };
    } catch (error) {
      console.error('Error getting staff stats:', error);
      // Return default stats if API fails
      return {
        totalActive: 0,
        doctors: 0,
        secretaries: 0,
        inactive: 0,
        total: 0
      };
    }
  }

  // Fetch revenue report
  async fetchRevenue(filters = {}) {
    const { startDate, endDate, clinicIds = '' } = filters;
    
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      clinicIds
    });
    
    return this.request(`/revenue?${queryParams}`);
  }
}

export default new StaffAPI();