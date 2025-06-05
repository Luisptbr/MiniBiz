export class FinancialCalculator {
  static calculateTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  static calculateTax(amount: number, taxRate = 0.1): number {
    return amount * taxRate
  }

  static calculateDiscount(amount: number, discountPercent: number): number {
    return amount * (discountPercent / 100)
  }

  static formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }
}
