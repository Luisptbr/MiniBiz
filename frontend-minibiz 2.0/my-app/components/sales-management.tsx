"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SaleService } from "@/services/sale.service"
import { ClientService } from "@/services/client.service"
import { ProductService } from "@/services/product.service"
import type { Sale, SaleItem } from "@/models/sale.model"
import type { Client } from "@/models/client.model"
import type { Product } from "@/models/product.model"
import type { ApiResponse } from "@/src/types"
import { Page } from "@/services/client.service"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    status: "pending" as const,
    items: [] as SaleItem[],
  })
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    price: 0,
  })

  const statuses = ["pending", "completed", "cancelled"] as const

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = sales.filter(
      (sale) =>
        sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter)
    }

    setFilteredSales(filtered)
  }, [sales, searchTerm, statusFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [salesResponse, clientsResponse, productsResponse] = await Promise.all([
        SaleService.getSales(),
        ClientService.getClients(),
        ProductService.getProducts(),
      ])

      // Handle sales response
      if (salesResponse && salesResponse.success && salesResponse.data) {
        if (salesResponse.data && 'content' in salesResponse.data) {
          // Handle paginated response
          setSales(salesResponse.data.content);
        } else {
          // Handle array response
          setSales(Array.isArray(salesResponse.data) ? salesResponse.data : []);
        }
      }
      
      // Handle clients response
      if (clientsResponse && clientsResponse.success && clientsResponse.data) {
        if (clientsResponse.data && 'content' in clientsResponse.data) {
          // Handle paginated response
          setClients(clientsResponse.data.content);
        } else {
          // Handle array response
          setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : []);
        }
      }
      
      // Handle products response
      if (productsResponse && productsResponse.success && productsResponse.data) {
        if (productsResponse.data && 'content' in productsResponse.data) {
          // Handle paginated response
          setProducts(productsResponse.data.content);
        } else {
          // Handle array response
          setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
        }
      }
    } catch (err) {
      setError("An error occurred while loading data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.items.length === 0) {
      setError("Please add at least one item to the sale")
      setIsLoading(false)
      return
    }

    try {
      let response
      if (editingSale) {
        response = await SaleService.updateSale(editingSale.id, formData)
      } else {
        response = await SaleService.createSale(formData)
      }

      if (response.success) {
        await loadData()
        setIsDialogOpen(false)
        resetForm()
      } else {
        setError(response.message || "Operation failed")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      clientId: sale.client.id,
      status: sale.status,
      items: sale.items,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        const response = await SaleService.deleteSale(id)
        if (response.success) {
          await loadData()
        } else {
          setError(response.message || "Failed to delete sale")
        }
      } catch (err) {
        setError("An error occurred while deleting sale")
      }
    }
  }

  const addItem = () => {
    if (!newItem.productId) return

    const product = products.find((p) => p.id === newItem.productId)
    if (!product) return

    const item: SaleItem = {
      id: Date.now().toString(),
      productId: newItem.productId,
      product: product,
      quantity: newItem.quantity,
      price: newItem.price || product.price,
    }

    setFormData({
      ...formData,
      items: [...formData.items, item],
    })

    setNewItem({ productId: "", quantity: 1, price: 0 })
  }

  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    })
  }

  const resetForm = () => {
    setFormData({ clientId: "", status: "pending", items: [] })
    setNewItem({ productId: "", quantity: 1, price: 0 })
    setEditingSale(null)
    setError("")
  }

  const openNewSaleDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const calculateTotal = (items: SaleItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Management</CardTitle>
          <CardDescription>Manage your sales transactions and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewSaleDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingSale ? "Edit Sale" : "Create New Sale"}</DialogTitle>
                  <DialogDescription>
                    {editingSale ? "Update sale information" : "Create a new sale transaction"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client">Client</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Sale Items</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Select
                          value={newItem.productId}
                          onValueChange={(value) => {
                            const product = products.find((p) => p.id === value)
                            setNewItem({ ...newItem, productId: value, price: product?.price || 0 })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                        />
                        <Button type="button" onClick={addItem}>
                          Add
                        </Button>
                      </div>

                      {formData.items.length > 0 && (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.product.name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>${item.price.toFixed(2)}</TableCell>
                                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="p-4 border-t">
                            <div className="text-right font-bold">
                              Total: ${calculateTotal(formData.items).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : editingSale ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No sales found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{sale.client.name}</TableCell>
                      <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.items.length} items</TableCell>
                      <TableCell>${sale.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(sale)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(sale.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
