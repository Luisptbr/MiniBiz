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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientService } from "@/services/client.service"
import type { Client } from "@/models/client.model"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
  })

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    // Add validation for searchTerm to prevent errors
    const term = searchTerm?.toLowerCase() || '';
    
    // Add validation for client properties to prevent "toLowerCase of undefined" errors
    const filtered = clients.filter(
      (client) => {
        // Make sure each property exists before calling toLowerCase()
        const nome = client?.nome?.toLowerCase() || '';
        const email = client?.email?.toLowerCase() || '';
        const endereco = client?.endereco?.toLowerCase() || '';
        
        return nome.includes(term) || 
               email.includes(term) || 
               endereco.includes(term);
      }
    );
    
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      console.log('Loading clients...');
      const response = await ClientService.getClients();
      
      if (response.success && Array.isArray(response.data)) {
        // Validate and sanitize client data before setting state
        const validatedClients = response.data.map(client => ({
          id: client?.id || '',
          nome: client?.nome || '',
          email: client?.email || '',
          telefone: client?.telefone || '',
          endereco: client?.endereco || ''
        }));
        
        console.log(`Loaded ${validatedClients.length} clients successfully`);
        setClients(validatedClients);
      } else {
        console.error('Failed to load clients:', response);
        setError(response.message || "Failed to load clients");
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError("An error occurred while loading clients");
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
      if (editingClient) {
        response = await ClientService.updateClient(editingClient.id, formData)
      } else {
        response = await ClientService.createClient(formData)
      }

      if (response.success) {
        await loadClients()
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    // Add validation to prevent undefined values
    setFormData({
      nome: client?.nome || '',
      email: client?.email || '',
      telefone: client?.telefone || '',
      endereco: client?.endereco || '',
    });
    setIsDialogOpen(true);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await ClientService.deleteClient(id)
        if (response.success) {
          await loadClients()
        } else {
          setError(response.message || "Failed to delete client")
        }
      } catch (err) {
        setError("An error occurred while deleting client")
      }
    }
  }

  const resetForm = () => {
    setFormData({ nome: "", email: "", telefone: "", endereco: "" })
    setEditingClient(null)
    setError("")
  }

  const openNewClientDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>Manage your business clients and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewClientDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                  <DialogDescription>
                    {editingClient ? "Update client information" : "Enter the details for the new client"}
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefone">Phone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endereco">Address</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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
                      {isLoading ? "Saving..." : editingClient ? "Update" : "Create"}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading clients...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client, index) => (
                    <TableRow key={client?.id || index}>
                      <TableCell className="font-medium">{client?.nome || '-'}</TableCell>
                      <TableCell>{client?.email || '-'}</TableCell>
                      <TableCell>{client?.telefone || '-'}</TableCell>
                      <TableCell>{client?.endereco || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
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
