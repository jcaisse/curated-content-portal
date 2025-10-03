"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Crawler = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ExtractedKeyword = {
  name: string;
  relevance: number; // 0..1
  category: string;
  confidence: "high" | "medium" | "low";
  priority?: string;
};

export default function EditCrawlerPage() { return null }


