export class DateFormatter {
  static formatDate(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  static formatDateTime(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  static getDateRange(range: string): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date()

    switch (range) {
      case "last-7-days":
        start.setDate(end.getDate() - 7)
        break
      case "last-30-days":
        start.setDate(end.getDate() - 30)
        break
      case "last-3-months":
        start.setMonth(end.getMonth() - 3)
        break
      case "last-6-months":
        start.setMonth(end.getMonth() - 6)
        break
      case "last-year":
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setMonth(end.getMonth() - 6)
    }

    return { start, end }
  }
}
