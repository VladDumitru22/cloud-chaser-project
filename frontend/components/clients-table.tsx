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
import { Plus, MoreVertical, Pencil, Trash2, Search, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type User = {
  id_user: number
  name: string
  email: string
  phone_number: string | null
  address: string | null
  created_at: string
  role: "CLIENT" | "OPERATIVE" | "ADMIN"
}

const API_URL = "http://localhost:8000"

export function ClientsTable() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    role: "CLIENT",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      if (!token) {
        setError("Admin not authenticated.")
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_URL}/admin/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data: User[] = await res.json()
        setUsers(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number?.includes(searchQuery) ||
      user.address?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", phone_number: "", address: "", role: "CLIENT" })
    setFormError(null)
    setIsSaving(false)
  }

  const handleAdd = async () => {
    setIsSaving(true)
    setFormError(null)
    const token = getToken()
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.")
      setIsSaving(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/admin/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to add user")
      }
      const newUser: User = await res.json()
      setUsers([...users, newUser])
      resetForm()
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editingUser) return
    setIsSaving(true)
    setFormError(null)
    const token = getToken()
    const updatePayload = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number || null,
      address: formData.address || null,
      role: formData.role,
    }
    try {
      const res = await fetch(`${API_URL}/admin/clients/${editingUser.id_user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatePayload),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to update user")
      }
      const updatedUser: User = await res.json()
      setUsers(users.map((c) => (c.id_user === updatedUser.id_user ? updatedUser : c)))
      resetForm()
      setEditingUser(null)
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
      const res = await fetch(`${API_URL}/admin/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to delete user")
      }
      
      setUsers(users.filter((c) => c.id_user !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || "",
      address: user.address || "",
      role: user.role,
      password: "",
    })
    setFormError(null)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    })
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
               <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user entry in the system</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="User name" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@example.com" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 6 characters" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="+1 (555) 123-4567" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Business St, City, State ZIP" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: "CLIENT" | "OPERATIVE") => setFormData({ ...formData, role: value })} disabled={isSaving}>
                    <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="OPERATIVE">Operative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add User"}
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
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id_user}>
                    <TableCell className="font-mono text-sm">{user.id_user}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone_number || "N/A"}</TableCell>
                    <TableCell><span className="rounded-full bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary-foreground">{user.role}</span></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /><span className="sr-only">Open menu</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id_user)}
                            className="text-destructive focus:text-destructive"
                            disabled={isSaving}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user details. Password is not changed here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={isSaving} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: "CLIENT" | "OPERATIVE") => setFormData({ ...formData, role: value })} disabled={isSaving}>
                <SelectTrigger id="edit-role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="OPERATIVE">Operative</SelectItem>
                </SelectContent>
              </Select>
            </div>
             {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}