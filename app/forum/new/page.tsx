"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { getForumCategories } from "@/lib/data-utils";
import { useBusiness } from "@/lib/BusinessContext";

export default function NewThreadPage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Get categories (excluding "All")
  const categories = getForumCategories().filter((cat) => cat !== "All");

  // Auto-suggest tags based on content
  const autoSuggestTags = (): string[] => {
    const keywords = [
      "funding",
      "grant",
      "partnership",
      "collaboration",
      "marketing",
      "hiring",
      "supplier",
      "wholesale",
      "equipment",
      "expansion",
      "advice",
      "help",
      "recommendation",
    ];

    const lowerContent = (title + " " + content).toLowerCase();
    return keywords.filter((keyword) => lowerContent.includes(keyword)).slice(0, 5);
  };

  const suggestedTags = autoSuggestTags();

  // Add tag
  const addTag = (tag: string) => {
    if (tag && !manualTags.includes(tag) && manualTags.length < 5) {
      setManualTags([...manualTags, tag]);
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setManualTags(manualTags.filter((t) => t !== tag));
  };

  // Handle tag input
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim().toLowerCase());
      setTagInput("");
    }
  };

  // Form validation
  const isFormValid = title.trim().length > 0 && category && content.trim().length > 0;

  // Handle submit
  const handleSubmit = () => {
    if (!isFormValid) return;

    // Demo functionality - show success message
    alert(`Thread posted successfully!

Title: ${title}
Category: ${category}
Content length: ${content.length} characters
Tags: ${manualTags.join(", ") || "None"}

(Demo mode - thread not actually saved)`);

    // Redirect to forum
    router.push("/forum");
  };

  // Loading state if no business selected
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/forum")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Forum</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Thread</h1>
          <p className="text-lg text-gray-600">
            Share your question, idea, or opportunity with the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thread Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Looking for a wholesale coffee bean supplier"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your question, offer, or idea in detail. The more information you provide, the better responses you'll receive."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {content.length} characters
                  </p>
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  
                  {/* Suggested Tags */}
                  {suggestedTags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary-600" />
                        <p className="text-xs text-gray-600">Suggested tags based on your content:</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTag(tag)}
                            disabled={manualTags.includes(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              manualTags.includes(tag)
                                ? "bg-primary-100 text-primary-700 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Tag Input */}
                  <Input
                    type="text"
                    placeholder="Add custom tags (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    className="w-full"
                    disabled={manualTags.length >= 5}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {manualTags.length}/5 tags • Press Enter to add
                  </p>

                  {/* Selected Tags */}
                  {manualTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {manualTags.map((tag) => (
                        <div key={tag} className="relative group">
                          <Badge variant="info" size="md">
                            #{tag}
                          </Badge>
                          <button
                            onClick={() => removeTag(tag)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/forum")}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                  >
                    Post Thread
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h3>

                {title || category || content ? (
                  <div className="space-y-3">
                    {/* Category Badge */}
                    {category && (
                      <div>
                        <Badge variant="default" size="md">
                          {category}
                        </Badge>
                      </div>
                    )}

                    {/* Title */}
                    {title && (
                      <h4 className="font-semibold text-gray-900">
                        {title}
                      </h4>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {currentBusiness.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentBusiness.name}
                        </p>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {content && (
                      <p className="text-sm text-gray-700 line-clamp-4">
                        {content}
                      </p>
                    )}

                    {/* Tags */}
                    {manualTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {manualTags.map((tag) => (
                          <Badge key={tag} variant="info" size="sm">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Your thread preview will appear here
                  </p>
                )}
              </div>
            </Card>

            {/* Tips Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 Tips for a Great Post
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Be specific and descriptive in your title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Choose the most relevant category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Provide context and details in your content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Add relevant tags to help others find your post</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Be respectful and professional</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
