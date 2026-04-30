"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { Sparkles } from "lucide-react";

export default function TestComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            UI Component Library Test
          </h1>
          <p className="text-gray-600">
            Auctus AI Design System - All Components Showcase
          </p>
        </div>

        {/* Button Component */}
        <Card header={<h2 className="text-2xl font-bold">Button Component</h2>}>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-semibold mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  With Icon
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Card Component */}
        <Card header={<h2 className="text-2xl font-bold">Card Component</h2>}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Card Variations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basic Card */}
              <Card>
                <h4 className="font-semibold mb-2">Basic Card</h4>
                <p className="text-gray-600">Simple card with content only</p>
              </Card>

              {/* Card with Header */}
              <Card header={<div className="font-semibold">Card Header</div>}>
                <p className="text-gray-600">Card with header section</p>
              </Card>

              {/* Card with Footer */}
              <Card
                footer={
                  <Button size="sm" variant="outline" className="w-full">
                    Action
                  </Button>
                }
              >
                <h4 className="font-semibold mb-2">With Footer</h4>
                <p className="text-gray-600">Card with footer section</p>
              </Card>
            </div>
          </div>
        </Card>

        {/* Badge Component */}
        <Card header={<h2 className="text-2xl font-bold">Badge Component</h2>}>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Input Component */}
        <Card header={<h2 className="text-2xl font-bold">Input Component</h2>}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Basic Input"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <Input
                label="With Helper Text"
                placeholder="Enter email..."
                type="email"
                helperText="We'll never share your email"
              />
              
              <Input
                label="Error State"
                placeholder="Enter password..."
                type="password"
                error="Password is too short"
              />
              
              <Input
                label="Disabled"
                placeholder="Disabled input"
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Select Component */}
        <Card header={<h2 className="text-2xl font-bold">Select Component</h2>}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Basic Select"
                options={selectOptions}
                placeholder="Choose an option..."
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />
              
              <Select
                label="With Error"
                options={selectOptions}
                error="Please select an option"
              />
            </div>
          </div>
        </Card>

        {/* Modal Component */}
        <Card header={<h2 className="text-2xl font-bold">Modal Component</h2>}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Click the button below to test the modal. It supports ESC key and
              click-outside to close.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Test Modal"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  This is a modal dialog. You can close it by:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Clicking the X button</li>
                  <li>Pressing the ESC key</li>
                  <li>Clicking outside the modal</li>
                </ul>
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setIsModalOpen(false)}>
                    Close Modal
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </Card>

        {/* Success Message */}
        <Card className="bg-secondary-50 border-2 border-secondary-500">
          <div className="text-center">
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              ✅ All Components Working!
            </h3>
            <p className="text-secondary-800">
              Phase 1.2 Design System Foundation - Complete
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
