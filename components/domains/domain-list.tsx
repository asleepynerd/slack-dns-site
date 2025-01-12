"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DomainCard } from "./domain-card";
import { EditDomainDialog } from "./edit-domain-dialog";
import { AddDomainDialog } from "./add-domain-dialog";
import { Button } from "@/components/ui/button";

export function DomainList() {
  const [domains, setDomains] = useState<any[]>([]);
  const [editingDomain, setEditingDomain] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains");
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  };

  const handleDelete = async (domain: string) => {
    try {
      const response = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (response.ok) {
        fetchDomains();
      }
    } catch (error) {
      console.error("Failed to delete domain:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -100, rotateX: 80 }}
          animate={{ opacity: 1, x: 0, rotateX: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
            duration: 0.8,
          }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent">
            Your Domains
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
          }}
        >
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={domains.length >= 20}
            className="bg-blue-500 hover:bg-blue-600 text-white relative overflow-hidden group"
          >
            <motion.span
              className="absolute inset-0 bg-blue-400/30"
              initial={false}
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
            Add Domain
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {domains.map((domain) => (
          <DomainCard
            key={domain.domain}
            domain={domain}
            onEdit={setEditingDomain}
            onDelete={handleDelete}
          />
        ))}
      </motion.div>

      <AddDomainDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onDomainAdded={fetchDomains}
      />

      {editingDomain && (
        <EditDomainDialog
          open={!!editingDomain}
          onOpenChange={(open) => !open && setEditingDomain(null)}
          onDomainEdited={fetchDomains}
          domain={editingDomain}
        />
      )}
    </div>
  );
}
