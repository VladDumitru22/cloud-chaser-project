"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Search, Calendar, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Product = {
  id_product: number
  name: string
}

type CampaignStatus = "Pending" | "Active" | "Completed" | "On Hold"

type Campaign = {
  id_campaign: number
  name: string
  product: string
  status: CampaignStatus
  start_date: string
  end_date: string
}

const API_URL = "http://localhost:8000"

export function MyCampaigns() {
  const { user } = useAuth() 

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    id_product: "", 
    name: "",
    start_date: "",
    end_date: "",
  })

  const getToken = () => {
    return localStorage.getItem("cloudchaser_token")
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      const token = getToken()

      if (!token) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      try {
        const [campaignsRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/campaigns/`, { headers }),
          fetch(`${API_URL}/products/drop_down/`, { headers }),
        ])

        if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns")
        if (!productsRes.ok) throw new Error("Failed to fetch products")

        const campaignsData: Campaign[] = await campaignsRes.json()
        const productsData: Product[] = await productsRes.json()

        setCampaigns(campaignsData)
        setProducts(productsData)
      } catch (err: any) {
        setError(err.message || "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAdd = async () => {
    setIsSaving(true)
    setFormError(null)
    const token = getToken()

    if (!token) {
      setFormError("Authentication token not found. Please log in again.")
      setIsSaving(false)
      return
    }

    if (!formData.id_product || !formData.name || !formData.start_date || !formData.end_date) {
      setFormError("Please fill out all fields.")
      setIsSaving(false)
      return
    }

    const payload = {
      name: formData.name,
      id_product: parseInt(formData.id_product), 
      start_date: formData.start_date,
      end_date: formData.end_date,
    }

    try {
      const res = await fetch(`${API_URL}/campaigns/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to create campaign")
      }

      const newCampaign: Campaign = await res.json()

      setCampaigns((prevCampaigns) => [...prevCampaigns, newCampaign])

      setFormData({ id_product: "", name: "", start_date: "", end_date: "" })
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }


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
      campaign.product.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setFormError(null)
    }
  }


  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card p-6 shadow-lg shadow-primary/5">
        <div className="flex flex-col items-center justify-center text-center text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign for your business
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.id_product}
                    onValueChange={(value) => setFormData({ ...formData, id_product: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id_product}
                          value={product.id_product.toString()}
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Sale 2024"
                    disabled={isSaving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    disabled={isSaving}
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Campaign"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first campaign to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Campaign Name</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Start Date</TableHead>
                  <TableHead className="font-semibold">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id_campaign}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {campaign.product}
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
                    <TableCell className="text-muted-foreground">
                      {formatDate(campaign.start_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(campaign.end_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  )
}