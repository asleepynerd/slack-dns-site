'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: () => void;
}

export function AddDomainDialog({ open, onOpenChange, onDomainAdded }: AddDomainDialogProps) {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, recordType, content }),
      });

      if (response.ok) {
        onDomainAdded();
        onOpenChange(false);
        setDomain('');
        setRecordType('A');
        setContent('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add domain');
      }
    } catch (error) {
      alert('Failed to add domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Domain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="subdomain.example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type</Label>
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A Record</SelectItem>
                <SelectItem value="AAAA">AAAA Record</SelectItem>
                <SelectItem value="CNAME">CNAME Record</SelectItem>
                <SelectItem value="TXT">TXT Record</SelectItem>
                <SelectItem value="MX">MX Record</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Input
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="IP address or domain"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Domain'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}