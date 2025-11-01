"use client"

import { useState } from "react"
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
import { Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-react"

type Component = {
  id: string
  name: string
  component_type: string
  unit_cost: number
  description: string
}

const initialComponents: Component[] = [
  {
    id: "1",
    name: "Social Media Post Template",
    component_type: "Template",
    unit_cost: 49.99,
    description: "Professional social media post template with customizable layouts",
  },
  {
    id: "2",
    name: "Analytics Dashboard Widget",
    component_type: "Widget",
    unit_cost: 129.99,
    description: "Real-time analytics widget for tracking engagement metrics",
  },
  {
    id: "3",
    name: "Content Calendar Module",
    component_type: "Module",
    unit_cost: 199.99,
    description: "Comprehensive content planning and scheduling module",
  },
]

export function ComponentsTable() {
  const [components, setComponents] = useState<Component[]>(initialComponents)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    component_type: "",
    unit_cost: "",
    description: "",
  })

  const filteredComponents = components.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.component_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAdd = () => {
    const newComponent: Component = {
      id: (components.length + 1).toString(),
      name: formData.name,
      component_type: formData.component_type,
      unit_cost: Number.parseFloat(formData.unit_cost),
      description: formData.description,
    }
    setComponents([...components, newComponent])
    setFormData({ name: "", component_type: "", unit_cost: "", description: "" })
    setIsAddDialogOpen(false)
  }

  const handleEdit = () => {
    if (!editingComponent) return
    setComponents(
      components.map((c) =>
        c.id === editingComponent.id
          ? {
              ...c,
              name: formData.name,
              component_type: formData.component_type,
              unit_cost: Number.parseFloat(formData.unit_cost),
              description: formData.description,
            }
          : c,
      ),
    )
    setFormData({ name: "", component_type: "", unit_cost: "", description: "" })
    setEditingComponent(null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
  }

  const openEditDialog = (component: Component) => {
    setEditingComponent(component)
    setFormData({
      name: component.name,
      component_type: component.component_type,
      unit_cost: component.unit_cost.toString(),
      description: component.description,
    })
    setIsEditDialogOpen(true)
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Component name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Component Type</Label>
                  <Input
                    id="type"
                    value={formData.component_type}
                    onChange={(e) => setFormData({ ...formData, component_type: e.target.value })}
                    placeholder="e.g., Template, Widget, Module"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Unit Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Component description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add Component</Button>
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
                  <TableRow key={component.id}>
                    <TableCell className="font-mono text-sm">{component.id}</TableCell>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {component.component_type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">${component.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{component.description}</TableCell>
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
                            onClick={() => handleDelete(component.id)}
                            className="text-destructive focus:text-destructive"
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>Update the component details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Component Type</Label>
              <Input
                id="edit-type"
                value={formData.component_type}
                onChange={(e) => setFormData({ ...formData, component_type: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cost">Unit Cost ($)</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
