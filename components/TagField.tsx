'use client';
import type { FC, KeyboardEvent } from 'react';
import { useState, ChangeEvent } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

type TagFieldProps = {
  id?: string;
  className?: string;
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string, index: number) => void;
  maxTags: number;
}

export const TagField: FC<TagFieldProps> = ( props ) => {
  const {
    id,
    className,
    tags,
    addTag,
    removeTag,
    maxTags,
  } = props;

  // track the use input
  const [userInput, setUserInput] = useState<string>(" ");

  // Handle input onChange

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // handle Enter key press

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or new line creation

      if (
        userInput.trim() !== "" &&
        tags.length < maxTags
      ) {
        const sanitizedUserInput = userInput.trim().replace(/\s[2,]/g, " ");

        if ( tags.indexOf(sanitizedUserInput) === -1 ) {
          addTag(sanitizedUserInput);
        }
        
        setUserInput(""); // Clear the input after adding a tag
      }
    }
  };

  return (
    <div className={ className } data-testid="tag-field">
      <Input
        id={ id }
        name="keyword_tags"
        type="text"
        placeholder={
          tags.length < maxTags
            ? "Add a tag"
            : `You can only enter max. of ${maxTags} tags`
        }
        onKeyDown={handleKeyPress}
        onChange={handleInputChange}
        value={userInput}
        disabled={tags.length === maxTags}
      />

      {/* ===== Render the tags here ===== */}

      <div className="flex flex-row flex-wrap gap-3 mt-4">
        {tags.map((tag: string, index: number) => (
          <Badge
            className='cursor-default'
            variant='outline'
            key={`${index}-${tag}`}
          >
            {tag}
            <button
              className="ml-2 hover:text-blue-500"
              onClick={() => removeTag(tag, index)}
              title={`Remove ${tag}`}
            >
              &times;
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};