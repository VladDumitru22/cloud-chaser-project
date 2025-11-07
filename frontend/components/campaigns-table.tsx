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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { MoreVertical, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type CampaignStatus = "Pending" | "Active" | "Completed" | "On Hold"

type Campaign = {
  id_campaign: number
  name: string
  status: CampaignStatus
  start_date: string
  end_date: string
  product_name: string
  client_name: string
  client_email: string
}

const API_URL = "http://localhost:8000"

export function CampaignsTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    status: "Pending" as CampaignStatus,
    start_date: "",
    end_date: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem("cloudchaser_token")

  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()
      if (!token) {
        setError("Admin not authenticated.")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/admin/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch campaigns")

        const data: Campaign[] = await res.json()
        setCampaigns(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadCampaigns()
  }, [])

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      case "Active":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "Completed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "On Hold":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  
  const resetForm = () => {
     setFormData({ name: "", status: "Pending", start_date: "", end_date: "" })
     setFormError(null)
     setIsSaving(false)
  }

  const handleEdit = async () => {
    if (!editingCampaign) return
    
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    const updatePayload = {
      name: formData.name,
      status: formData.status,
      start_date: formData.start_date,
      end_date: formData.end_date,
    }

    try {
      const res = await fetch(`${API_URL}/admin/campaigns/${editingCampaign.id_campaign}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatePayload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to update campaign")
      }

      const updatedCampaign: Campaign = await res.json()
      setCampaigns(campaigns.map((c) => (c.id_campaign === updatedCampaign.id_campaign ? updatedCampaign : c)))
      resetForm()
      setEditingCampaign(null)
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
      const res = await fetch(`${API_URL}/admin/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to delete campaign")
      }
      
      setCampaigns(campaigns.filter((c) => c.id_campaign !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      status: campaign.status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    })
    setFormError(null)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              placeholder="Search campaigns, clients, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Campaign</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id_campaign}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{campaign.client_name}</span>
                        <span className="text-xs text-muted-foreground">{campaign.client_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {campaign.product_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                          getStatusColor(campaign.status),
                        )}
                      >
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(campaign.start_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(campaign.end_date)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(campaign.id_campaign)}
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
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update the campaign details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Campaign Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: CampaignStatus) => setFormData({ ...formData, status: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-start-date">Start Date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-end-date">End Date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={isSaving}
              />
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