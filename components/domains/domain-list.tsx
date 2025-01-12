'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AddDomainDialog } from './add-domain-dialog';

interface DomainRecord {
  domain: string;
  recordType: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function DomainList() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };

  const handleDelete = async (domain: string) => {
    try {
      const response = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });

      if (response.ok) {
        fetchDomains();
      }
    } catch (error) {
      console.error('Failed to delete domain:', error);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <Card key={domain.domain}>
            <CardHeader>
              <CardTitle className="text-lg">{domain.domain}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Type:</span> {domain.recordType}
                </div>
                <div>
                  <span className="font-medium">Points to:</span> {domain.content}
                </div>
                <div className="text-sm text-zinc-500">
                  Created: {new Date(domain.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(domain.domain)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddDomainDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onDomainAdded={fetchDomains}
      />
    </div>
  );
}