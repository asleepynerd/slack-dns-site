"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { DNSRecord } from "@/lib/dns-types";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion } from "framer-motion";

interface DomainCardProps {
  domain: DNSRecord;
  onEdit: (domain: DNSRecord) => void;
  onDelete: (domain: string) => void;
}

export function DomainCard({ domain, onEdit, onDelete }: DomainCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.domain,
          recordType: domain.recordType,
        }),
      });

      if (response.ok) {
        onDelete(domain.domain);
      } else {
        throw new Error("Failed to delete domain");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDisplayContent = () => {
    if (domain.recordType === "SRV") {
      return `${domain.priority} ${domain.port} ${domain.content}`;
    }
    if (domain.recordType === "MX") {
      return (
        <div className="space-y-2">
          {Array.isArray(domain.content) ? (
            domain.content.map((record, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">
                  Priority: {domain.priority}
                </span>
                <span className="text-sm text-zinc-100">{record}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">
                Priority: {domain.priority}
              </span>
              <span className="text-sm text-zinc-100">{domain.content}</span>
            </div>
          )}
        </div>
      );
    }
    return domain.content;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, rotateY: 45, scale: 0.8 }}
        animate={{
          opacity: 1,
          rotateY: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1,
          },
        }}
        whileHover={{
          scale: 1.02,
          rotateY: 5,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
          },
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          if (Math.abs(info.offset.x) > 100) {
            setShowDeleteConfirm(true);
          }
        }}
      >
        <Card className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-800/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <motion.h3
              className="font-semibold text-lg text-zinc-100"
              layoutId={`title-${domain.domain}`}
              whileHover={{ scale: 1.05 }}
            >
              {domain.domain}
            </motion.h3>
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(domain)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -45, 45, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <motion.div
                    whileHover={{
                      rotate: [0, 15, -15, 0],
                      transition: {
                        repeat: Infinity,
                        duration: 0.5,
                      },
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
            >
              <motion.div className="space-y-1" whileHover={{ scale: 1.02 }}>
                <p className="text-sm font-medium text-zinc-400">Record Type</p>
                <motion.p
                  className="text-sm text-zinc-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {domain.recordType}
                </motion.p>
              </motion.div>
              <motion.div className="space-y-1" whileHover={{ scale: 1.02 }}>
                <p className="text-sm font-medium text-zinc-400">Content</p>
                <motion.p
                  className="text-sm text-zinc-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {getDisplayContent()}
                </motion.p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Domain"
        description={`Are you sure you want to delete ${domain.domain}? This action cannot be undone.`}
      />
    </>
  );
}
