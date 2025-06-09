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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProductService } from "@/services/product.service"
import type { Product } from "@/models/product.model"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    quantidadeEmEstoque: 0,
    codigoProduto: "",
    categoria: ""
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    // Add validation for searchTerm to prevent errors
    const term = searchTerm?.toLowerCase() || '';
    
    // Add validation for product properties to prevent "toLowerCase of undefined" errors
    const filtered = products.filter(
      (product) => {
        // Make sure each property exists before calling toLowerCase()
        const nome = product?.nome?.toLowerCase() || '';
        const descricao = product?.descricao?.toLowerCase() || '';
        const categoria = product?.categoria?.toLowerCase() || '';
        const codigoProduto = product?.codigoProduto?.toLowerCase() || '';
        
        return nome.includes(term) || 
               descricao.includes(term) || 
               categoria.includes(term) ||
               codigoProduto.includes(term);
      }
    );
    
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading products...');
      const response = await ProductService.getProducts();
      
      if (response.success && Array.isArray(response.data)) {
        // Validate and sanitize product data before setting state
        const validatedProducts = response.data.map(product => ({
          id: product?.id || '',
          nome: product?.nome || '',
          descricao: product?.descricao || '',
          preco: product?.preco || 0,
          quantidadeEmEstoque: product?.quantidadeEmEstoque || 0,
          codigoProduto: product?.codigoProduto || '',
          dataCriacao: product?.dataCriacao || '',
          dataAtualizacao: product?.dataAtualizacao || '',
          categoria: product?.categoria || ''
        }));
        
        console.log(`Loaded ${validatedProducts.length} products successfully`);
        setProducts(validatedProducts);
      } else {
        console.error('Failed to load products:', response);
        setError(response.message || "Failed to load products");
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError("An error occurred while loading products");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let response
      if (editingProduct) {
        response = await ProductService.updateProduct(editingProduct.id, formData)
      } else {
        response = await ProductService.createProduct(formData)
      }

      if (response.success) {
        await loadProducts()
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Add validation to prevent undefined values
    setFormData({
      nome: product?.nome || '',
      descricao: product?.descricao || '',
      preco: product?.preco || 0,
      quantidadeEmEstoque: product?.quantidadeEmEstoque || 0,
      codigoProduto: product?.codigoProduto || '',
      categoria: product?.categoria || '',
    });
    setIsDialogOpen(true);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await ProductService.deleteProduct(id)
        if (response.success) {
          await loadProducts()
        } else {
          setError(response.message || "Failed to delete product")
        }
      } catch (err) {
        setError("An error occurred while deleting product")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: 0,
      quantidadeEmEstoque: 0,
      codigoProduto: "",
      categoria: ""
    })
    setEditingProduct(null)
    setError("")
  }

  const openNewProductDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>Manage your business products and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewProductDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? "Update product information" : "Enter the details for the new product"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Name</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="descricao">Description</Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="preco">Price</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantidadeEmEstoque">Stock Quantity</Label>
                      <Input
                        id="quantidadeEmEstoque"
                        type="number"
                        value={formData.quantidadeEmEstoque}
                        onChange={(e) => setFormData({ ...formData, quantidadeEmEstoque: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="codigoProduto">Product Code</Label>
                      <Input
                        id="codigoProduto"
                        value={formData.codigoProduto}
                        onChange={(e) => setFormData({ ...formData, codigoProduto: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoria">Category</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      />
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
                      {isLoading ? "Saving..." : editingProduct ? "Update" : "Create"}
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
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => (
                    <TableRow key={product?.id || index}>
                      <TableCell>{product?.codigoProduto || '-'}</TableCell>
                      <TableCell className="font-medium">{product?.nome || '-'}</TableCell>
                      <TableCell>{product?.descricao || '-'}</TableCell>
                      <TableCell>{formatPrice(product?.preco || 0)}</TableCell>
                      <TableCell>{product?.quantidadeEmEstoque}</TableCell>
                      <TableCell>{product?.categoria || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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

