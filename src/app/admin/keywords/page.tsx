"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Keyword {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    posts: number;
    runs: number;
  };
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/keywords");
      if (response.ok) {
        const data = await response.json();
        setKeywords(data);
      }
    } catch (error) {
      console.error("Error fetching keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", description: "", isActive: true });
        setShowForm(false);
        fetchKeywords();
      }
    } catch (error) {
      console.error("Error creating keyword:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keywords Management</h1>
          <p className="text-muted-foreground">
            Manage keywords for content crawling and curation
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Keyword"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Keyword Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., artificial intelligence"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of the keyword"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit">Create Keyword</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">Loading keywords...</div>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No keywords found
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first keyword to start content crawling
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {keywords.map((keyword) => (
            <Card key={keyword.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{keyword.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={keyword.isActive ? "default" : "secondary"}>
                        {keyword.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{keyword._count.posts} posts</Badge>
                      <Badge variant="outline">{keyword._count.runs} runs</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {keyword.description && (
                  <p className="text-muted-foreground">{keyword.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Created: {new Date(keyword.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}