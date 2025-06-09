"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VendaService } from "@/services/venda.service"
import { ClientService } from "@/services/client.service"
import { ProductService } from "@/services/product.service"
import type { VendaResponse, VendaRequest, ItemVenda } from "@/models/venda.model"
import type { Client } from "@/models/client.model"
import type { Product } from "@/models/product.model"
import { StatusVenda } from "@/models/status-venda.enum"
import { Plus, Ban, Search, X } from "lucide-react"

interface SaleItem {
  productId: number
  quantidade: number
  product: Product
}

export function SalesManagement() {
  const [sales, setSales] = useState<VendaResponse[]>([])
  const [filteredSales, setFilteredSales] = useState<VendaResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Data for new sale
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadSales()
    loadClients()
    loadProducts()
  }, [])

  useEffect(() => {
    const term = searchTerm?.toLowerCase() || '';
    const filtered = sales.filter((sale) => {
      const saleId = sale.id.toLowerCase();
      const saleDate = new Date(sale.vendaDate).toLocaleDateString();
      const status = sale.status.toLowerCase();
      
      return saleId.includes(term) || 
             saleDate.includes(term) || 
             status.includes(term);
    });
    
    setFilteredSales(filtered);
  }, [sales, searchTerm]);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const response = await VendaService.getVendas();
      
      if (response.success && Array.isArray(response.data)) {
        setSales(response.data);
      } else {
        setError(response.message || "Failed to load sales");
      }
    } catch (err) {
      setError("An error occurred while loading sales");
    } finally {
      setIsLoading(false);
    }
  }

  const loadClients = async () => {
    const response = await ClientService.getClients();
    if (response.success && response.data) {
      setClients(response.data);
    }
  }

  const loadProducts = async () => {
    const response = await ProductService.getProducts();
    if (response.success && response.data) {
      setProducts(response.data);
    }
  }

  const handleAddItem = () => {
    if (products.length > 0) {
      setSaleItems([...saleItems, { productId: parseInt(products[0].id), quantidade: 1, product: products[0] }]);
    }
  }

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  }

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...saleItems];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index] = { ...newItems[index], [field]: parseInt(value), product };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setSaleItems(newItems);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const vendaData: VendaRequest = {
        clientId: parseInt(selectedClientId),
        produtosDTO: saleItems.map(item => ({
          productId: parseInt(item.product.id),
          quantidade: item.quantidade
        }))
      };

      const response = await VendaService.createVenda(vendaData);

      if (response.success) {
        await loadSales();
        setIsDialogOpen(false);
        resetForm();
      } else {
        setError(response.message || "Failed to create sale");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this sale?")) {
      try {
        const response = await VendaService.cancelarVenda(id);
        if (response.success) {
          await loadSales();
        } else {
          setError(response.message || "Failed to cancel sale");
        }
      } catch (err) {
        setError("An error occurred while canceling sale");
      }
    }
  }

  const resetForm = () => {
    setSelectedClientId("");
    setSaleItems([]);
    setError("");
  }

  const openNewSaleDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  }

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => parseInt(c.id) === clientId);
    return client ? client.nome : 'Unknown';
  }

  // Get badge color for status
  const getStatusBadgeClass = (status: StatusVenda) => {
    switch (status) {
      case StatusVenda.CONCLUIDA:
        return "bg-green-100 text-green-800";
      case StatusVenda.CANCELADA:
        return "bg-red-100 text-red-800";
      case StatusVenda.AGUARDANDO:
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Management</CardTitle>
          <CardDescription>Manage your sales and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <DialogTitle>Create New Sale</DialogTitle>
                  <DialogDescription>
                    Select a client and add products to create a new sale
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client">Client</Label>
                      <Select
                        value={selectedClientId}
                        onValueChange={setSelectedClientId}
                      >
                        <SelectTrigger id="client">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label>Products</Label>
                        <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" /> Add Product
                        </Button>
                      </div>
                      
                      {saleItems.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No products added. Click "Add Product" to add products to the sale.
                        </div>
                      )}

                      {saleItems.map((item, index) => (
                        <div key={index} className="flex space-x-2 items-end border p-2 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor={`product-${index}`}>Product</Label>
                            <Select
                              value={item.product.id.toString()}
                              onValueChange={(value) => handleItemChange(index, 'productId', value)}
                            >
                              <SelectTrigger id={`product-${index}`}>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.nome} - {formatCurrency(product.preco)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value))}
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="mb-0.5"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                    <Button type="submit" disabled={isLoading || !selectedClientId || saleItems.length === 0}>
                      {isLoading ? "Creating..." : "Create Sale"}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Products</TableHead>
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
                  filteredSales.map((sale, index) => (
                    <TableRow key={sale?.id || index}>
                      <TableCell className="font-medium">{sale?.id || '-'}</TableCell>
                      <TableCell>{formatDate(sale?.vendaDate) || '-'}</TableCell>
                      <TableCell>{getClientName(sale?.clientId) || '-'}</TableCell>
                      <TableCell>
                        {sale?.products?.length || 0} items
                      </TableCell>
                      <TableCell>{formatCurrency(sale?.valorTotal || 0)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(sale?.status)}`}>
                          {sale?.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {sale?.status !== StatusVenda.CANCELADA && (
                            <Button variant="outline" size="sm" onClick={() => handleCancel(sale.id)}>
                              <Ban className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          )}
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
