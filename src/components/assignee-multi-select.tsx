"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface MultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export function AssigneeMultiSelect({ selectedIds, onChange, label = "Assignees" }: MultiSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUsers = users.filter(user => selectedIds.includes(user._id));

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter(id => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onChange(selectedIds.filter(id => id !== userId));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <div key={user._id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {user.name}
              <button
                type="button"
                onClick={() => removeUser(user._id)}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start bg-muted border-0"
        >
          {selectedUsers.length === 0 ? "Select assignees..." : `${selectedUsers.length} selected`}
        </Button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div className="max-h-40 overflow-auto">
              {filteredUsers.map(user => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggleUser(user._id)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                  {selectedIds.includes(user._id) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}