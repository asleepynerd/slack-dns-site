#!/usr/bin/env python3

import re
import sys
from pathlib import Path

def clean_comments(content: str) -> str:
    # Preserve important compiler directives
    important_comments = [
        "@ts-nocheck",
        "@ts-ignore",
        "@ts-expect-error",
        "@deprecated",
        "@param",
        "@returns",
        "@throws",
        "@type",
        "@typedef",
        "@interface",
        "eslint-disable",
        "eslint-enable",
        "prettier-ignore",
    ]
    
    # Split into lines to handle line comments
    lines = content.split('\n')
    result_lines = []
    in_multiline = False
    preserve_next = False
    
    for line in lines:
        stripped = line.strip()
        
        # Check if this line has an important comment
        has_important = any(directive in line for directive in important_comments)
        
        # Handle multiline comments
        if not in_multiline:
            if '/*' in line and '*/' in line:
                # Single line /* */ comment
                if has_important:
                    result_lines.append(line)
                else:
                    # Remove the comment
                    line = re.sub(r'/\*.*?\*/', '', line)
                    if line.strip():
                        result_lines.append(line)
            elif '/*' in line:
                # Start of multiline comment
                in_multiline = True
                if has_important:
                    preserve_next = True
                    result_lines.append(line)
                else:
                    # Keep content before comment
                    before_comment = line.split('/*')[0]
                    if before_comment.strip():
                        result_lines.append(before_comment)
            else:
                # Handle single line comments
                if '//' in line:
                    if has_important:
                        result_lines.append(line)
                    else:
                        # Keep content before comment
                        before_comment = line.split('//')[0]
                        if before_comment.strip():
                            result_lines.append(before_comment)
                else:
                    if line.strip():
                        result_lines.append(line)
        else:
            # Inside multiline comment
            if '*/' in line:
                in_multiline = False
                if preserve_next:
                    result_lines.append(line)
                    preserve_next = False
                else:
                    # Keep content after comment
                    after_comment = line.split('*/')[1]
                    if after_comment.strip():
                        result_lines.append(after_comment)
            elif preserve_next:
                result_lines.append(line)
    
    return '\n'.join(result_lines)

def process_file(file_path: Path) -> None:
    if not file_path.is_file():
        print(f"Error: {file_path} is not a file")
        return
    
    # Only process TypeScript/JavaScript files
    if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
        print(f"Skipping {file_path}: not a TypeScript/JavaScript file")
        return
    
    try:
        content = file_path.read_text()
        cleaned = clean_comments(content)
        
        # Create backup
        backup_path = file_path.with_suffix(file_path.suffix + '.bak')
        file_path.rename(backup_path)
        
        # Write cleaned content
        file_path.write_text(cleaned)
        print(f"Processed {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        # Restore from backup if it exists
        if backup_path.exists():
            backup_path.rename(file_path)

def main():
    if len(sys.argv) < 2:
        print("Usage: clean-comments.py <file_or_directory>")
        sys.exit(1)
    
    path = Path(sys.argv[1])
    if path.is_dir():
        # Process all TypeScript/JavaScript files in directory
        for file_path in path.rglob('*'):
            if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                process_file(file_path)
    else:
        process_file(path)

if __name__ == '__main__':
    main() 