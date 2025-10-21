#!/usr/bin/env python3
"""
Replace 'Training' with 'Resource' or 'Resources' across all HTML files
Intelligently determines singular vs plural based on context
"""

import os
import re
from pathlib import Path

# Directory to process
WEBSITE_DIR = r"C:\Users\m_kap\OneDrive\Desktop\Personal\LARKLabs\Website"

# Directories to exclude
EXCLUDE_DIRS = {'node_modules', '.git', 'backups'}

# Patterns for plural context (should become "Resources")
PLURAL_PATTERNS = [
    r'training\s+materials',
    r'training\s+resources',
    r'training\s+modules',
    r'training\s+units',
    r'training\s+tools',
    r'training\s+programs',
    r'training\s+courses',
    r'study\s+materials',
    r'learning\s+materials',
    r'educational\s+materials',
]

# Patterns that should stay as "Training" (exceptions)
KEEP_TRAINING_PATTERNS = [
    r'fit\s+testing\s+and\s+training',  # Safety context
    r'training\s+before\s+use',  # Safety requirement
    r'proper\s+training',  # Safety/compliance
    r'cross-training',  # Employment term
    r'on-the-job\s+training',  # Employment term
]

def should_keep_as_training(text, match_pos):
    """Check if this instance should remain as 'training'"""
    # Get context around the match (50 chars before and after)
    start = max(0, match_pos - 50)
    end = min(len(text), match_pos + 100)
    context = text[start:end].lower()

    for pattern in KEEP_TRAINING_PATTERNS:
        if re.search(pattern, context, re.IGNORECASE):
            return True
    return False

def should_be_plural(text, match_pos):
    """Determine if 'Training' should become 'Resources' (plural)"""
    # Get context around the match (100 chars before and after)
    start = max(0, match_pos - 100)
    end = min(len(text), match_pos + 150)
    context = text[start:end].lower()

    # Check for plural indicators
    for pattern in PLURAL_PATTERNS:
        if re.search(pattern, context, re.IGNORECASE):
            return True

    # Check for common plural contexts
    if any(word in context for word in ['modules', 'units', 'materials', 'courses', 'tools', 'programs']):
        return True

    # Check for "and" which often indicates plural/multiple items
    if re.search(r'training\s+and', context, re.IGNORECASE):
        return True

    return False

def replace_training_in_text(text):
    """Replace training with resource/resources intelligently"""
    result = text
    changes = []

    # Find all occurrences of "training" or "Training"
    pattern = re.compile(r'\b(training|Training|TRAINING)\b')

    # Process matches in reverse order to maintain positions
    matches = list(pattern.finditer(text))

    for match in reversed(matches):
        original = match.group(0)
        pos = match.start()

        # Check if we should keep it as "training"
        if should_keep_as_training(text, pos):
            continue

        # Determine replacement
        if should_be_plural(text, pos):
            # Use "Resources" (plural)
            if original == 'training':
                replacement = 'resources'
            elif original == 'Training':
                replacement = 'Resources'
            else:  # TRAINING
                replacement = 'RESOURCES'
        else:
            # Use "Resource" (singular)
            if original == 'training':
                replacement = 'resource'
            elif original == 'Training':
                replacement = 'Resource'
            else:  # TRAINING
                replacement = 'RESOURCE'

        # Make the replacement
        result = result[:pos] + replacement + result[pos + len(original):]
        changes.append((original, replacement, pos))

    return result, len(changes)

def process_html_file(filepath):
    """Process a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file contains "training"
        if not re.search(r'\btraining\b', content, re.IGNORECASE):
            return 0

        # Replace training with resource/resources
        new_content, count = replace_training_in_text(content)

        if count > 0:
            # Write back to file
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return count

        return 0

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def main():
    """Main function to process all HTML files"""
    website_path = Path(WEBSITE_DIR)
    total_files = 0
    total_replacements = 0
    files_changed = []

    print("Starting Training to Resource replacement across all HTML files...")
    print(f"Directory: {WEBSITE_DIR}")
    print("-" * 80)

    # Walk through all HTML files
    for html_file in website_path.rglob('*.html'):
        # Skip excluded directories
        if any(excluded in html_file.parts for excluded in EXCLUDE_DIRS):
            continue

        total_files += 1
        count = process_html_file(html_file)

        if count > 0:
            total_replacements += count
            rel_path = html_file.relative_to(website_path)
            files_changed.append((str(rel_path), count))
            print(f"[OK] {rel_path}: {count} replacements")

    print("-" * 80)
    print(f"\nSUMMARY:")
    print(f"Total HTML files processed: {total_files}")
    print(f"Files modified: {len(files_changed)}")
    print(f"Total replacements: {total_replacements}")

    if files_changed:
        print(f"\nTop 10 files by changes:")
        for filepath, count in sorted(files_changed, key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {count:3d} - {filepath}")

    print("\nReplacement complete!")

if __name__ == "__main__":
    main()
