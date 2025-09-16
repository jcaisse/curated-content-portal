"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Post {
  id: string;
  title: string;
  description?: string;
  url: string;
  status: string;
  createdAt: string;
  keyword?: {
    name: string;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("REVIEW");

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]); // TODO: Add fetchPosts to dependency array or use useCallback

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/curate?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurateAction = async (postId: string, action: string) => {
    try {
      const response = await fetch("/api/admin/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action }),
      });

      if (response.ok) {
        fetchPosts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error performing curation action:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DRAFT": return "secondary";
      case "REVIEW": return "default";
      case "PUBLISHED": return "default";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Posts Management</h1>
        <p className="text-muted-foreground">
          Review and manage curated content posts
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="status-filter">Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading posts...</div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No posts found
            </h3>
            <p className="text-sm text-muted-foreground">
              No posts found with status: {statusFilter}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(post.status)}>
                        {post.status}
                      </Badge>
                      {post.keyword && (
                        <Badge variant="outline">{post.keyword.name}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {post.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => handleCurateAction(post.id, "curate")}
                      >
                        Curate
                      </Button>
                    )}
                    {post.status === "REVIEW" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleCurateAction(post.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCurateAction(post.id, "reject")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {post.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCurateAction(post.id, "draft")}
                      >
                        Unpublish
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.description && (
                  <p className="text-muted-foreground mb-2">{post.description}</p>
                )}
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {post.url}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}