import { AuthService } from "./auth.service"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export class ReportService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

  static async getReportData(reportType: string, dateRange: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.API_URL}/reports/${reportType}?range=${dateRange}`, {
        headers: AuthService.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data }
      }

      return { success: false, message: data.message || "Failed to fetch report data" }
    } catch (error) {
      // Mock data for demonstration
      const mockData = {
        salesData: [
          { month: "Jan", sales: 45, revenue: 2250 },
          { month: "Feb", sales: 52, revenue: 2600 },
          { month: "Mar", sales: 48, revenue: 2400 },
          { month: "Apr", sales: 61, revenue: 3050 },
          { month: "May", sales: 55, revenue: 2750 },
          { month: "Jun", sales: 67, revenue: 3350 },
        ],
        categoryData: [
          { name: "Electronics", value: 35, color: "#0088FE" },
          { name: "Clothing", value: 25, color: "#00C49F" },
          { name: "Food", value: 20, color: "#FFBB28" },
          { name: "Books", value: 15, color: "#FF8042" },
          { name: "Other", value: 5, color: "#8884D8" },
        ],
        summary: {
          totalRevenue: 45231,
          totalSales: 328,
          totalProducts: 156,
          totalClients: 89,
        },
      }
      return { success: true, data: mockData }
    }
  }

  static async exportReport(reportType: string, dateRange: string, format: "pdf" | "csv"): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.API_URL}/reports/${reportType}/export?range=${dateRange}&format=${format}`, {
        headers: AuthService.getAuthHeaders(),
      })

      if (response.ok) {
        const blob = await response.blob()
        return { success: true, data: blob }
      }

      const data = await response.json()
      return { success: false, message: data.message || "Failed to export report" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }
}
