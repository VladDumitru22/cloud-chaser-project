"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Plus, MoreVertical, Pencil, Trash2, Search, Loader2 } from "lucide-react"

type Component = {
  id_component: number
  name: string
  component_type: string
  unit_cost: string
  description: string | null
}

const API_URL = "http://localhost:8000"

export function ComponentsTable() {
  const [components, setComponents] = useState<Component[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    component_type: "",
    unit_cost: "",
    description: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadComponents = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      if (!token) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/components/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
           const errData = await res.json()
           throw new Error(errData.detail || "Failed to fetch components")
        }
        const data: Component[] = await res.json()
        setComponents(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadComponents()
  }, [])

  const filteredComponents = components.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.component_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({ name: "", component_type: "", unit_cost: "", description: "" })
    setFormError(null)
    setIsSaving(false)
  }

  const handleAdd = async () => {
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        ...formData,
        unit_cost: parseFloat(formData.unit_cost),
      }
      
      const res = await fetch(`${API_URL}/components/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to add component")
      }

      const newComponent: Component = await res.json()
      setComponents([...components, newComponent])
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editingComponent) return
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    try {
      const payload = {
        ...formData,
        unit_cost: parseFloat(formData.unit_cost),
      }
      
      const res = await fetch(`${API_URL}/components/${editingComponent.id_component}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to update component")
      }

      const updatedComponent: Component = await res.json()
      setComponents(
        components.map((c) => (c.id_component === updatedComponent.id_component ? updatedComponent : c)),
      )
      resetForm()
      setEditingComponent(null)
      setIsEditDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setIsSaving(true)
    setError(null)
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/components/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to delete component")
      }
      
      setComponents(components.filter((c) => c.id_component !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (component: Component) => {
    setEditingComponent(component)
    setFormData({
      name: component.name,
      component_type: component.component_type,
      unit_cost: component.unit_cost,
      description: component.description || "",
    })
    setFormError(null)
    setIsEditDialogOpen(true)
  }
  
  if (isLoading) {
    return <div className="flex h-60 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }
  
  if (error && !isLoading) {
    return <div className="text-destructive p-4 text-center rounded-lg border border-destructive/50 bg-destructive/10">{error}</div>
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Component</DialogTitle>
                <DialogDescription>Create a new component entry in your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Component name" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Component Type</Label>
                  <Input id="type" value={formData.component_type} onChange={(e) => setFormData({ ...formData, component_type: e.target.value })} placeholder="e.g., Template, Widget, Module" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Unit Cost ($)</Label>
                  <Input id="cost" type="number" step="0.01" value={formData.unit_cost} onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })} placeholder="0.00" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Component description" disabled={isSaving} />
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Component"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Unit Cost</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No components found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComponents.map((component) => (
                  <TableRow key={component.id_component}>
                    <TableCell className="font-mono text-sm">{component.id_component}</TableCell>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {component.component_type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">${parseFloat(component.unit_cost).toFixed(2)}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{component.description || "N/A"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(component)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(component.id_component)}
                            className="text-destructive focus:text-destructive"
                            disabled={isSaving}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>Update the component details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Component Type</Label>
              <Input id="edit-type" value={formData.component_type} onChange={(e) => setFormData({ ...formData, component_type: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cost">Unit Cost ($)</Label>
              <Input id="edit-cost" type="number" step="0.01" value={formData.unit_cost} onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} disabled={isSaving} />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}