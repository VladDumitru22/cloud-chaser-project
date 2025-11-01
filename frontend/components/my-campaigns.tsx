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
import { Card } from "@/components/ui/card"
import { Plus, Search, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

type CampaignStatus = "Pending" | "Active" | "Completed"

type Campaign = {
  name: string
  product: string
  status: CampaignStatus
  start_date: string
  end_date: string
}

export function MyCampaigns() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    product: "",
    name: "",
    start_date: "",
    end_date: "",
  })

  // Fetch campaigns from backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem("cloudchaser_token")
      if (!token || !user) return
      try {
        const res = await fetch("http://localhost:8000/campaigns", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        if (!res.ok) throw new Error("Failed to fetch campaigns")
        const data: Campaign[] = await res.json()
        setCampaigns(data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      }
    }
    fetchCampaigns()
  }, [user])

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      case "Active":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "Completed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.product.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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

          {/* Dialog pentru adăugare campanie – rămâne local */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new marketing campaign for your business</DialogDescription>
              </DialogHeader>
              {/* Form – rămâne local */}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    placeholder="Product name"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Create Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first campaign to get started</p>
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
                {filteredCampaigns.map((campaign, idx) => (
                  <TableRow key={idx}>
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
                    <TableCell className="text-muted-foreground">{formatDate(campaign.start_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(campaign.end_date)}</TableCell>
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
